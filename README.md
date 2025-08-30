# API de Transferências e Usuários

Esta API permite realizar registro, login, consulta de usuários e transferências de valores entre usuários. O banco de dados é em memória, ideal para testes e automação de API.

## Instalação

1. Clone o repositório ou copie os arquivos para seu ambiente.
2. Instale as dependências:
   ```powershell
   npm install express swagger-ui-express
   ```

## Como executar

- Para iniciar o servidor:
  ```powershell
  npm start
  ```
- A API estará disponível em `http://localhost:3000`.
- A documentação Swagger estará disponível em `http://localhost:3000/api-docs`.

## Endpoints

- `POST /register`: Registra novo usuário. Campos obrigatórios: `username`, `password`. Opcional: `favorecidos` (array de usernames).
- `POST /login`: Realiza login. Campos obrigatórios: `username`, `password`.
- `GET /users`: Lista todos os usuários cadastrados.
  - `POST /transfer`: Realiza transferência. Campos obrigatórios: `from`, `to`, `value`.
- `GET /transfers`: Lista todas as transferências realizadas.

## Regras de Negócio

- Não é permitido registrar usuários duplicados.
- Login exige usuário e senha válidos.
- Transferências para destinatários não favorecidos só podem ser feitas se o valor for menor que R$ 5.000,00.

## Testes

Para testar a API com Supertest, importe o `app.js` em seus testes sem executar o método `listen()`.

## Documentação

Consulte o Swagger em `/api-docs` para detalhes dos endpoints e exemplos de requisições.
