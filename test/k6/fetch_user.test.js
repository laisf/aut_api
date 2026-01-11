import http from 'k6/http';
import { check, group, sleep } from 'k6';
import data from './data.json';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(90)<=2', 'p(95)<3'],
    http_req_failed: ['rate<0.01'], // menos de 1% de falhas
  },
};

export default function () {
  group('Fetch User Performance', () => {
    const userId = data[0].id;

    const res = http.get(`https://api.example.com/users/${userId}`);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'user data fetched': (r) => r.json().id === userId,
    });
  });

  sleep(1);
}
