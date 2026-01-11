const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('User Controller - Login', () => {
  it('Validar login com credenciais corretas', async () => {
    // Registro
    await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    // Login
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });
      console.log('body', response.body);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('username', 'testuser');
  });

  it('Validar login com credenciais inválidas - 401', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testUser2',
        password: 'wrongpassword',
      });

    expect(response.status).to.equal(401);
    expect(response.body).to.have.property('error', 'Usuário não encontrado');
  });

  it('Validar login com usuário não registrado - 401', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'unregistereduser',
        password: 'password123',
      });

    expect(response.status).to.equal(401);
    expect(response.body).to.have.property('error', 'Usuário não encontrado');
  });

  it('Validar login com campos obrigatórios faltando - 400', async () => {
    const response = await request(app)
      .post('/login')
      .send({});

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error', 'Campos obrigatórios estão faltando');
  });
});
