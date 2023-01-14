// Import the backend functions
const { generateRandomString } = require('./backend/helperFunctions');

// Set up the express web server
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
  'user1': bcrypt.hashSync('123', 10),
  'user2': bcrypt.hashSync('456', 10),
};

// Starting database for urls of users
const urlDatabase = {
  'user1': { "b2xVn2": "http://www.lighthouselabs.ca" },
  'user2': { "9sm5xK": "http://www.google.com" }
};

// Helper function for login page
const loginPage = function(req, res, alert) {
  res.render("pages/login", { alert, user: undefined });
};

// Main page
app.get("/", (req, res) => {
  const user = req.session.user;
  res.render("pages/main", { user });
});

// Redirect to login/signup page
app.get("/login", loginPage);

// Page for user's URLs
app.get("/urls", (req, res) => {
  const user = req.session.user;
  if (!user) {
    res.redirect("/404");
  }
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_index", templateVars);
});

// Page for adding a new url
app.get("/urls/new", (req, res) => {
  const user = req.session.user;
  if (!user) {
    res.redirect("/404");
  }
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_new", templateVars);
});

// Page for a specified url
app.get("/urls/:id", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  if ((!user) || (urlDatabase[user][id] === undefined)) {
    res.redirect("pages/404");
  }
  const templateVars = { id, url: urlDatabase[user], user };
  res.render("pages/urls_show", templateVars);
});

// Redirect to the longURL that the shortURL is hyperlinked to
app.get("/u/:id", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  if (!user) {
    res.redirect("pages/404");
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
  // Empty fields alert
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = { login: errors.array() };
    return loginPage(req, res, alert);
  }
  // Verifying email and password fields
  const email = req.body['email'];
  const hashedPassword = (users[email]) ? users[email] : '';
  if (bcrypt.compareSync(req.body['password'], hashedPassword)) {
    req.session.user = email;
    res.redirect("/urls");
  } else {
    const loginAlert = { msg: (hashedPassword) ? "Incorrect Password" : "Account does not exists" };
    const alert = { login: [loginAlert] };
    return loginPage(req, res, alert);
  }
});

// After signup form is filled
app.post('/signup', [
  check('email', 'Email field is required')
    .exists()
    .isLength({ min: 1 }),
  check('password', 'A password field is required')
    .exists()
    .isLength({ min: 1 }),
], (req, res) => {
  // Empty fields alert
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = { signup: errors.array() };
    return loginPage(req, res, alert);
  }
  // Verifying email availibility
  const email = req.body['email'];
  if (users[email]) {
    const signupAlert = { msg: "Account already exists" };
    const alert = { signup: [signupAlert] };
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
  const { user } = req.session;
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
  const user = req.session.user;
  res.render("pages/404", { user });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
