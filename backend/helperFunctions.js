// Generate random string of length 6 for testing purposes
const generateRandomString = function() {
  return Math.random().toString(36).slice(2).substring(0, 6);
};

// Renders login page
const loginPage = function(req, res, alert) {
  res.render("pages/login", { alert, user: undefined });
};

// Renders error page with the given errorType
const errorPage = function(req, res, errorType) {
  const user = req.session.user;
  res.render("pages/error", { user, errorType });
};

module.exports = { generateRandomString, loginPage, errorPage };