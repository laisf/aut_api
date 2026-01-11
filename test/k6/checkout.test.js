import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { login } from './helpers.js';
import data from './data.json';

const responseTimeTrend = new Trend('response_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    'response_time': ['avg<300'],
  },
};

export default function () {
  group('Login and Fetch Data', () => {
    const token = login();

    const res = http.get('https://api.example.com/data', {
      headers: { Authorization: `Bearer ${token}` },
    });

    responseTimeTrend.add(res.timings.duration);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response contains data': (r) => r.json().length > 0,
    });
  });

  group('Register User', () => {
    const payload = JSON.stringify({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    const res = http.post('https://api.example.com/register', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'status is 201': (r) => r.status === 201,
      'user registered': (r) => r.json().id !== undefined,
    });
  });

  group('Fetch User', () => {
    const userId = data[0].id;

    const res = http.get(`https://api.example.com/users/${userId}`);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'user data fetched': (r) => r.json().id === userId,
    });
  });

  sleep(1);
}
