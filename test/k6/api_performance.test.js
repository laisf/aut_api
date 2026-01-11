import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { registerUser, loginUser } from './helpers.js';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import data from './data.json';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_VUS = parseInt(__ENV.MAX_VUS || '20');

const registerTime = new Trend('register_time');
const loginTime = new Trend('login_time');
const transferTime = new Trend('transfer_time');
const successRate = new Rate('successful_requests');
const transferCounter = new Counter('total_transfers');

export const options = {
  // carga crescente
  stages: [
    { duration: '10s', target: 5 },   // Aquecimento
    { duration: '30s', target: MAX_VUS }, // Carga máxima
    { duration: '20s', target: 10 },  // Descida gradual
    { duration: '10s', target: 0 },   // Finalização
  ],

  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    'register_time': ['avg<500', 'p(95)<800'],
    'login_time': ['avg<300', 'p(95)<500'],
    'transfer_time': ['avg<400', 'p(95)<700'],
    'successful_requests': ['rate>0.95'],
    checks: ['rate>0.90'],
  },
};

export default function () {
  let userCredentials;
  let loggedInUser;

  group('Register User', () => {
    const username = `user_${randomString(8)}_${uuidv4()}`;
    const password = `pwd_${randomString(10)}`;

    const startTime = Date.now();
    const result = registerUser(username, password);
    const duration = Date.now() - startTime;

    registerTime.add(duration);

    const registerCheck = check(result.response, {
      'register status is 201': (r) => r.status === 201,
      'register response time < 1s': (r) => r.timings.duration < 1000,
      'user has username': (r) => {
        try {
          const body = r.json();
          return body.username === username;
        } catch (e) {
          return false;
        }
      },
    });

    if (registerCheck) {
      successRate.add(1);
      userCredentials = result.credentials;
    } else {
      successRate.add(0);
    }
  });

  sleep(1);

  if (userCredentials) {
    group('Login User', () => {
      const startTime = Date.now();
      const loginRes = loginUser(userCredentials);
      const duration = Date.now() - startTime;

      loginTime.add(duration);

      const loginCheck = check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'login response time < 500ms': (r) => r.timings.duration < 500,
        'user authenticated': (r) => {
          try {
            const body = r.json();
            loggedInUser = body.username; // token
            return body.username === userCredentials.username;
          } catch (e) {
            return false;
          }
        },
      });

      if (loginCheck) {
        successRate.add(1);
      } else {
        successRate.add(0);
      }
    });
  }

  sleep(1);

  if (loggedInUser && data && data.length > 0) {
    group('Get All Users', () => {
      const res = http.get(`${BASE_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Identifier': loggedInUser,
        },
      });

      check(res, {
        'get users status is 200': (r) => r.status === 200,
        'users list returned': (r) => {
          try {
            const users = r.json();
            return Array.isArray(users);
          } catch (e) {
            return false;
          }
        },
      });
    });
  }

  sleep(1);

  if (loggedInUser && data && data.length > 0) {
    group('Transfer Operations', () => {
      const transferData = data[randomIntBetween(0, data.length - 1)];
      const recipientUsername = `recipient_${randomString(6)}_${__VU}_${__ITER}`;
      const recipientRes = registerUser(recipientUsername, 'password123');
      
      if (recipientRes.response.status === 201) {
        const transferValue = transferData.transferValue;
        
        const transferPayload = JSON.stringify({
          from: loggedInUser,
          to: recipientUsername,
          value: transferValue,
        });

        const startTime = Date.now();
        const transferRes = http.post(`${BASE_URL}/transfer`, transferPayload, {
          headers: {
            'Content-Type': 'application/json',
            'X-User-Identifier': loggedInUser, // Token
          },
        })
        const duration = Date.now() - startTime;

        transferTime.add(duration);

        const transferCheck = check(transferRes, {
          'transfer status is 201': (r) => r.status === 201,
          'transfer response time < 700ms': (r) => r.timings.duration < 700,
          'transfer created': (r) => {
            try {
              const body = r.json();
              return body.from === loggedInUser && body.to === recipientUsername;
            } catch (e) {
              return false;
            }
          },
        });

        if (transferCheck) {
          transferCounter.add(1);
          successRate.add(1);
        } else {
          successRate.add(0);
        }
      }
    });
  }

  sleep(1);
}

