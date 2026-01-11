const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('User Controller - Register', () => {
  it('Registrar um novo usuário com sucesso', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('username', 'testuser');
  });

  it('Deve retornar 400 se o usuário já existir', async () => {
    await request(app)
      .post('/register')
      .send({
        username: 'duplicateuser',
        password: 'password123',
      });

    const response = await request(app)
      .post('/register')
      .send({
        username: 'duplicateuser',
        password: 'password123',
      });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error', 'Usuário já existe');
  });

  it('Deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
    const response = await request(app)
      .post('/register')
      .send({});

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error');
  });
});
