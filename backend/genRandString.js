// Generate random string of length 6 for testing purposes
const generateRandomString = function() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

module.exports = { generateRandomString };