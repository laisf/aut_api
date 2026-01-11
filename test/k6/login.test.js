import { group, check, sleep } from 'k6';
import { registerUser, loginUser } from './helpers.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(90)<=2000', 'p(95)<=3000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
};

export default function () {

  let credentials;

  group('Register User', () => {
    const username = `user_${randomString(8)}_${uuidv4()}`;
    const password = `pwd_${randomString(10)}`;
    
    const result = registerUser(username, password);

    credentials = result.credentials;

    check(result.response, {
      'register status is 201': (r) => r.status === 201,
    });
  });

  group('Login Performance', () => {
    const loginRes = loginUser(credentials);

    check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login response time < 2s': (r) => r.timings.duration < 2000,
      'no server error': (r) => r.status < 500,
    });
  });

  sleep(1);
}
