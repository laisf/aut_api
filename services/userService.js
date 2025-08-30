const { users } = require('../models/userModel');

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function registerUser({ username, password, favorecidos = [] }) {
  if (findUserByUsername(username)) {
    throw new Error('Usuário já existe');
  }
  const user = { username, password, favorecidos };
  users.push(user);
  return user;
}

function loginUser({ username, password }) {
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    throw new Error('Credenciais inválidas');
  }
  return user;
}

function getAllUsers() {
  return users;
}

module.exports = {
  findUserByUsername,
  registerUser,
  loginUser,
  getAllUsers,
};
