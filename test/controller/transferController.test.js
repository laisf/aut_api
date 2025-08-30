const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

const app = require('../../app');

describe('Transfer Controller', () => {
    // describe('POST /transfer', () => {
    //     it('Quando uso dados validos o retorno é 201', async () => {
    //         const resposta = await request(app)
    //             .post('/transfer')
    //             .send({ from: 'alice', to: 'bob', amount: 1000 });
    //         expect(resposta.status).to.equal(201);
    //         expect(resposta.body).to.include({ from: 'alice', to: 'bob', value: 1000 });
    //     });
    // });

     describe('POST /transfer', () => {
        it('Quando informa remetente e destinatario inexistente recebo 404', async () => {
            const resposta = await request(app)
                .post('/transfer')
                .send({ from: 'alice', to: 'bob', value: 1000 });
            expect(resposta.status).to.equal(404);
            expect(resposta.body).to.have.property('error', 'Usuário remetente não encontrado');
        });
    });
});