const transferService = require('../services/transferService');

exports.createTransfer = (req, res) => {
  try {
  const transfer = transferService.createTransfer(req.body);
    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTransfers = (req, res) => {
  res.json(transferService.getTransfers());
};
