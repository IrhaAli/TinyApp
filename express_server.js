// Import the backend functions
const { generateRandomString } = require('./backend/helperFunctions');

// Set up the express web server
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// temporary database for users
const users = {
  'user1': 'password1',
  'user2': 'password2'
};

// Starting database
const urlDatabase = {
  'user1': { "b2xVn2": "http://www.lighthouselabs.ca" },
  'user2': { "9sm5xK": "http://www.google.com" }
};

// Main page
app.get("/", (req, res) => {
  const user = req.cookies.user;
  res.render("pages/main", { user });
});

// Page for user's URLs
app.get("/urls", (req, res) => {
  const user = req.cookies.user;
  const templateVars = { urls: (user) ? urlDatabase[user] : {}, user };
  res.render("pages/urls_index", templateVars);
});

// Page for adding a new url
app.get("/urls/new", (req, res) => {
  const user = req.cookies.user;
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_new", templateVars);
});

// Page for a specified url
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = req.cookies.user;
  if ((!user) || (urlDatabase[user][id] === undefined)) {
    res.render("pages/404", user);
  }
  const templateVars = { id, longURL: urlDatabase[user][id], user };
  res.render("pages/urls_show", templateVars);
});

// Redirect to the longURL that the shortURL is hyperlinked to
app.get("/u/:id", (req, res) => {
  const user = req.cookies.user;
  const longURL = urlDatabase[user][req.params.id];
  res.redirect(longURL);
});

// Redirect to login/signup page
app.get("/login", (req, res) => {
  let user = req.cookies.user;
  if (user) {
    res.clearCookie('email');
    const user = req.cookies.user;
    res.render('pages/main', { user });
  } else {
    res.render("pages/login", { user });
  }
});

// After login form is filled
app.post('/login', (req, res) => {
  const email = req.body['email'];
  const password = users[email];
  if (password === req.body['password']) {
    res.cookie('user', email);
    const user = req.cookies.user;
    const templateVars = { urls: urlDatabase[user], user };
    res.render("pages/urls_index", templateVars);
  } else {
    res.render("pages/login", { undefined });
  }
});

// After signup form is filled
app.post('/signup', (req, res) => {
  const email = req.body['email'];
  if (users[email] === undefined) {
    const user = req.cookies.user;
    users[email] = req.body['password'];
    res.cookie('user', email);
    res.render("pages/urls_new", { user });
  } else {
    res.render("pages/login", { undefined });
  }
});

// Redirect to /urls after a url is destroyed
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[user][req.params.id];
  const user = req.cookies.user;
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_index", templateVars);
});

// Redirect to /urls after an existing url is edited
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[user][req.params.id] = req.body['longURL'];
  const user = req.cookies.user;
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_index", templateVars);
});

// Redirect to /urls after a url is added
app.post("/urls/add", (req, res) => {
  let shortURL = req.body['longURLName'];
  if (shortURL === "" || shortURL === null || shortURL === undefined) {
    shortURL = generateRandomString();
  }
  const user = req.cookies.user;
  urlDatabase[user][shortURL] = req.body['longURL'];
  const templateVars = { urls: urlDatabase[user], user };
  res.render("pages/urls_index", templateVars);
});

// Custom 404 for all non-existing pages
app.get('*', function(req, res) {
  const user = req.cookies.user;
  res.render("pages/404", { user });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
