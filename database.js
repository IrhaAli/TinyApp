const bcrypt = require("bcryptjs");

// Starting database for users
const users = {
  'user1@gmail.com': bcrypt.hashSync('123456', 10),
  'user2@gmail.com': bcrypt.hashSync('654321', 10),
};

// Starting database for urls of users
const urlDatabase = {
  'user1@gmail.com': { "b2xVn2": "http://www.lighthouselabs.ca" },
  'user2@gmail.com': { "9sm5xK": "http://www.google.com" }
};

module.exports = { users, urlDatabase };