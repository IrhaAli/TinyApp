// Import the backend functions
const { generateRandomString } = require('./backend/helperFunctions');

// Set up the express web server and encryption
const cookieSession = require('cookie-session');
const express = require("express");

const app = express();

app.set('trust proxy', 1);

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

const bcrypt = require("bcryptjs");
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

const { check, validationResult } = require('express-validator');

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

// Helper functions
const loginPage = function(req, res, alert) {
  res.render("pages/login", { alert, user: undefined });
};
const errorPage = function(req, res, errorType) {
  const user = req.session.user;
  res.render("pages/error", { user, errorType });
};

// Main page
app.get("/", (req, res) => {
  const user = req.session.user;
  res.render("pages/main", { user });
});

// Login/signup page
app.get("/login", loginPage);

// Page for user's URLs
app.get("/urls", (req, res) => {
  const user = req.session.user;
  // Send 401 for accessing this page when not logged in
  if (!user) {
    errorPage(req, res, '401');
  }
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_index", templateVars);
});

// Page for adding a new url
app.get("/urls/new", (req, res) => {
  const user = req.session.user;
  // Send 401 for accessing this page when not logged in
  if (!user) {
    errorPage(req, res, '401');
  }
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_new", templateVars);
});

// Page for a specified url
app.get("/urls/:id", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  // Send 401 for accessing this page when not logged in and 404 for invalid id
  if ((!user) || (urlDatabase[user][id] === undefined)) {
    errorPage(req, res, (user) ? '404' : '401');
  }
  const templateVars = { id, url: urlDatabase[user], user };
  res.render("pages/urls_show", templateVars);
});

// Redirect to the longURL that the shortURL is hyperlinked to
app.get("/u/:id", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  // Send 401 for accessing this page when not logged in and 404 for invalid id
  if ((!user) || (urlDatabase[user][id] === undefined)) {
    errorPage(req, res, (user) ? '404' : '401');
  }
  res.redirect(urlDatabase[user][id]);
});

// After login button is pressed
app.post('/login', [
  check('email', 'Email field is required')
    .exists()
    .isLength({ min: 1 }),
  check('password', 'Password field is required')
    .exists()
    .isLength({ min: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  const email = req.body['email'];
  const hashedPassword = (users[email]) ? users[email] : '';
  // Error vs. sucessful login
  if (errors.isEmpty() && bcrypt.compareSync(req.body['password'], hashedPassword)) {
    req.session.user = email;
    res.redirect("/urls");
  } else {
    const alert = { login: errors.array() };
    const otherErrors = (email) ? [{ msg: (hashedPassword) ? "Incorrect Password" : "Account does not exists" }] : [];
    alert.login = alert.login.concat(otherErrors);
    return loginPage(req, res, alert);
  }
});

// After signup form is filled
app.post('/signup', [
  check('email', 'Email field is required/Invalid Email')
    .exists()
    .isEmail(),
  check('password', 'Password must be between 6 to 14 characters long')
    .isLength({ min: 6, max: 14 }),
], (req, res) => {
  const errors = validationResult(req);
  const email = req.body['email'];
  const alreadyExists = users[email];
  // Error vs. successful signup
  if (!errors.isEmpty() || alreadyExists) {
    const alert = { signup: errors.array() };
    const otherErrors = (alreadyExists) ? [{ msg: "Account already exists" }] : [];
    alert.signup = alert.signup.concat(otherErrors);
    return loginPage(req, res, alert);
  } else {
    users[email] = bcrypt.hashSync(req.body['password'], 10);
    urlDatabase[email] = {};
    req.session.user = email;
    res.redirect("/urls/new");
  }
});

// Redirect to /urls after a url is destroyed
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  delete urlDatabase[user][id];
  res.redirect("/urls");
});

// Redirect to /urls after an existing url is edited
app.post("/urls/:id/edit", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  urlDatabase[user][id] = req.body['longURL'];
  res.redirect("/urls");
});

// Redirect to /urls after a url is added
app.post("/urls/add", (req, res) => {
  const { longURL, longURLName } = req.body;
  let shortURL = longURLName;
  const user = req.session.user;
  if (shortURL === "" || shortURL === null || shortURL === undefined) {
    shortURL = generateRandomString();
  }
  urlDatabase[user][shortURL] = longURL;
  res.redirect("/urls");
});

// logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Custom 404 for all non-existing pages
app.get('*', function(req, res) {
  errorPage(req, res, '404');
});

// Start listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
