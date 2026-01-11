import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(90)<=2', 'p(95)<3'],
    http_req_failed: ['rate<0.01'], // menos de 1% de falhas
  },
};

export default function () {
  group('Register User Performance', () => {
    const payload = JSON.stringify({
      username: `user_${__VU}_${__ITER}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      password: 'password123',
    });

    const res = http.post('http://localhost:3000/register', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'status is 201': (r) => r.status === 201,
      'user registered': (r) => r.json().username !== undefined,
    });
  });

  sleep(1);
}
