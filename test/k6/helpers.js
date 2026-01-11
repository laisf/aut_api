import http from 'k6/http';

// Variável de Ambiente (conceito: Variável de Ambiente)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function registerUser(username, password) {
  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const res = http.post(`${BASE_URL}/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return {
    response: res,
    credentials: {
      username: username,
      password: password,
    },
  };
}

export function loginUser(credentials) {
  const payload = JSON.stringify({
    username: credentials.username,
    password: credentials.password,
  });

  return http.post(`${BASE_URL}/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}
