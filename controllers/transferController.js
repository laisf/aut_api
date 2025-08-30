const transferService = require('../services/transferService');

exports.createTransfer = (req, res) => {
  try {
    const transfer = transferService.createTransfer(req.body);
    res.status(201).json(transfer);
  } catch (err) {
    if (
      err.message === 'Usuário remetente não encontrado' ||
      err.message === 'Usuário destinatário não encontrado'
    ) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

exports.getTransfers = (req, res) => {
  res.json(transferService.getTransfers());
};
