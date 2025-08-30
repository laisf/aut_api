const { transfers } = require('../models/transferModel');
const { findUserByUsername } = require('./userService');

function createTransfer({ from, to, value }) {
  const sender = findUserByUsername(from);
  if (!sender) {
    throw new Error('Usuário remetente n encontrado');
  }
  const recipient = findUserByUsername(to);
  if (!recipient) {
    throw new Error('Usuário destinatário não encontrado');
  }
  const isFavorecido = sender.value && sender.value.includes(to);
  if (!isFavorecido && value >= 5000) {
    throw new Error('Transferências acima de R$ 5.000,00 só podem ser feitas para favorecidos');
  }
  const transfer = { from, to, value, date: new Date() };
  transfers.push(transfer);
  return transfer;
}

function getTransfers() {
  return transfers;
}

module.exports = {
  createTransfer,
  getTransfers,
};
