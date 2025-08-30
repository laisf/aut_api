const { users } = require('../models/userModel');

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function registerUser({ username, password, value = [] }) {
  if (findUserByUsername(username)) {
    throw new Error('Usuário já existe');
  }
  const user = { username, password, value };
  users.push(user);
  return user;
}

function loginUser({ username, password }) {
  const user = findUserByUsername(username);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  if (user.password !== password) {
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
