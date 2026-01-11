# Testes de Performance com K6

Este diretório contém os testes de performance automatizados para a API. O objetivo é validar o desempenho da aplicação sob diferentes condições de carga e cenários.

## Estrutura

- **api_performance.test.js**: Script principal de teste de performance com todos os conceitos aplicados.
- **helpers.js**: Funções auxiliares reutilizáveis (registerUser, loginUser).
- **data.json**: Dados para testes baseados em dados (Data-Driven Testing).
- **register.test.js**: Teste específico de registro de usuários.
- **login.test.js**: Teste específico de login e autenticação.

## Como Executar

```bash
# Executar o teste principal
k6 run api_performance.test.js

# Executar com variáveis de ambiente
BASE_URL=http://localhost:3000 MAX_VUS=30 k6 run api_performance.test.js

# Gerar relatório HTML
k6 run --out json=results.json api_performance.test.js
k6-to-cloud --token=YOUR_TOKEN results.json
```

## Conceitos Aplicados

Abaixo estão os conceitos implementados com exemplos específicos de código do arquivo `api_performance.test.js`:

### 1. Thresholds

**Definição**: Limites de desempenho que garantem que a API atenda aos requisitos.

**Código** (linhas 23-34 em `api_performance.test.js`):

```javascript
export const options = {
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
```

Este código define thresholds para garantir que:
- 95% das requisições completem em menos de 1 segundo
- A taxa de falhas seja menor que 5%
- As métricas personalizadas de tempo estejam dentro dos limites

### 2. Checks

**Definição**: Validações das respostas da API para garantir que os dados retornados estão corretos.

**Código** (linhas 59-70 em `api_performance.test.js`):

```javascript
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
```

Este código valida que:
- O status da resposta é 201 (criado)
- O tempo de resposta é menor que 1 segundo
- O usuário retornado possui o username esperado

### 3. Helpers

**Definição**: Funções reutilizáveis que encapsulam lógica comum de teste.

**Código** (linhas 5-33 em `helpers.js`):

```javascript
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
```

**Uso no teste** (linha 53 em `api_performance.test.js`):

```javascript
const result = registerUser(username, password);
```

As funções helper permitem reutilização de código e facilitam a manutenção dos testes.

### 4. Trends

**Definição**: Métricas personalizadas para coletar e analisar dados de desempenho específicos.

**Código** (linhas 8-12 em `api_performance.test.js`):

```javascript
const registerTime = new Trend('register_time');
const loginTime = new Trend('login_time');
const transferTime = new Trend('transfer_time');
```

**Uso** (linhas 55-56 em `api_performance.test.js`):

```javascript
const duration = Date.now() - startTime;
registerTime.add(duration);
```

Este código cria métricas personalizadas para registrar o tempo de cada operação específica (registro, login, transferência), permitindo análise detalhada de desempenho.

### 5. Faker

**Definição**: Geração de dados fictícios aleatórios para simular diferentes cenários de teste.

**Código** (linhas 47-49 em `api_performance.test.js`):

```javascript
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const username = `user_${randomString(8)}_${uuidv4()}`;
const password = `pwd_${randomString(10)}`;
```

**Outro exemplo** (linha 155 em `api_performance.test.js`):

```javascript
const transferValue = randomIntBetween(100, 4000);
```

O uso de Faker permite gerar dados únicos e aleatórios para cada execução de teste, evitando conflitos e simulando dados reais.

### 6. Variável de Ambiente

**Definição**: Configurações externas que podem ser alteradas sem modificar o código.

**Código** (linhas 15-16 em `api_performance.test.js`):

```javascript
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_VUS = parseInt(__ENV.MAX_VUS || '20');
```

**Uso** (linha 117 em `api_performance.test.js`):

```javascript
const res = http.get(`${BASE_URL}/users`, {
  headers: {
    'Content-Type': 'application/json',
    'X-User-Identifier': loggedInUser,
  },
});
```

As variáveis de ambiente permitem configurar a URL da API e o número máximo de usuários virtuais sem alterar o código, facilitando a execução em diferentes ambientes.

### 7. Stages

**Definição**: Configuração de carga crescente e decrescente para simular diferentes cenários de uso.

**Código** (linhas 18-22 em `api_performance.test.js`):

```javascript
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Aquecimento
    { duration: '30s', target: MAX_VUS }, // Carga máxima
    { duration: '20s', target: 10 },  // Descida gradual
    { duration: '10s', target: 0 },   // Finalização
  ],
};
```

Este código define stages que:
1. Começam com 5 usuários virtuais por 10 segundos (aquecimento)
2. Aumentam gradualmente até o máximo (30 segundos)
3. Reduzem para 10 usuários (20 segundos)
4. Finalizam com 0 usuários (10 segundos)

### 8. Reaproveitamento de Resposta

**Definição**: Uso de dados de uma resposta anterior em requisições subsequentes.

**Código** (linhas 66-67 e 75-76 em `api_performance.test.js`):

```javascript
// Armazena credenciais do registro
userCredentials = result.credentials;

// ... mais tarde ...

// Reaproveita credenciais para login
if (userCredentials) {
  group('Login User', () => {
    const loginRes = loginUser(userCredentials);
```

O reaproveitamento de resposta permite criar fluxos de teste mais realistas, onde uma operação depende do resultado de outra operação anterior.

### 9. Uso de Token de Autenticação

**Definição**: Utilização de tokens ou identificadores para autenticar requisições.

**Código** (linhas 85-89 e 120-122 em `api_performance.test.js`):

```javascript
// Armazena username como identificador de sessão
loggedInUser = body.username; // Usando username como "token" de sessão

// ... em requisições subsequentes ...

headers: {
  'Content-Type': 'application/json',
  'X-User-Identifier': loggedInUser, // Token/Identificador
},
```

Embora a API não use tokens JWT tradicionais, o teste demonstra o conceito usando o username como identificador de sessão nas requisições subsequentes.

### 10. Data-Driven Testing

**Definição**: Testes que utilizam dados externos (JSON, CSV, etc.) para executar múltiplos cenários.

**Código** (linha 5 e 144-145 em `api_performance.test.js`):

```javascript
import data from './data.json';

// ... no código ...

const transferData = data[randomIntBetween(0, data.length - 1)];
```

**Arquivo data.json**:

```json
[
  { "id": 1, "transferValue": 500, "description": "Pequena transferência" },
  { "id": 2, "transferValue": 1500, "description": "Transferência média" },
  { "id": 3, "transferValue": 3000, "description": "Transferência grande" },
  { "id": 4, "transferValue": 4500, "description": "Transferência muito grande" }
]
```

O Data-Driven Testing permite testar múltiplos cenários usando dados externos, facilitando a manutenção e expansão dos testes sem modificar o código.

### 11. Groups

**Definição**: Organização de testes em grupos para melhor legibilidade, manutenção e análise de resultados.

**Código** (linhas 43-45, 75-77, 116-117, 143-144 em `api_performance.test.js`):

```javascript
group('Register User', () => {
  // código de registro
});

group('Login User', () => {
  // código de login
});

group('Get All Users', () => {
  // código para buscar usuários
});

group('Transfer Operations', () => {
  // código de transferências
});
```

Os grupos organizam os testes logicamente, facilitando a identificação de problemas e a análise de desempenho por funcionalidade específica.

## Relatório de Execução

Para gerar um relatório HTML, você pode usar ferramentas como:

1. **k6-to-cloud**: Para gerar relatórios HTML a partir de resultados JSON
2. **Grafana Cloud**: Para visualização em tempo real
3. **k6 HTML Report**: Extensões da comunidade

Exemplo de geração de relatório:

```bash
k6 run --out json=results.json api_performance.test.js
```

## Observações

- Todos os conceitos estão implementados no arquivo `api_performance.test.js`
- Os helpers estão definidos em `helpers.js` e são reutilizados em múltiplos testes
- Os dados para Data-Driven Testing estão em `data.json`
- As variáveis de ambiente podem ser configuradas na execução do teste
