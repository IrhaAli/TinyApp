// Import the backend functions
const { generateRandomString } = require('./backend/genRandString');

// Set up the express web server
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
let loginStat = false;

// Init the lib
app.use(cookieParser());

// temporary database for users
const USERS = {
  'user1': 'password1',
  'user2': 'password2'
};

// routing for logout
app.get('/logout', (req, res) => {
  res.clearCookie('username');
  loginStat = false;
  const templateVars = { loginStat };
  res.render('/', templateVars);
});

// Starting database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Main page
app.get("/", (req, res) => {
  const templateVars = { loginStat };
  res.render("pages/main", templateVars);
});

// Page for user's URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, loginStat };
  res.render("pages/urls_index", templateVars);
});

// Get json of the url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Try out a page with html embedded in it
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Try out a page with html outsourced to .ejs file
app.get("/hellothere", (req, res) => {
  const templateVars = { greeting: "Hello World!", loginStat };
  res.render("pages/hello_world", templateVars);
});

// Page for adding a new url
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, loginStat };
  res.render("pages/urls_new", templateVars);
});

// Page for a specified url
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id] === undefined) {
    res.render("pages/404", loginStat);
  }
  const templateVars = { id, longURL: urlDatabase[id], loginStat };
  res.render("pages/urls_show", templateVars);
});

// Redirect to the longURL that the shortURL is hyperlinked to
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Redirect to login/signup page
app.get("/login", (req, res) => {
  loginStat = (loginStat) ? false : loginStat;
  const templateVars = { loginStat };
  res.render("pages/login", templateVars);
});

// After login form is filled
app.post('/login', (req, res) => {
  const email = req.body['email'];
  const password = USERS[email];
  if (password === req.body['password']) {
    loginStat = true;
    const templateVars = { urls: urlDatabase, loginStat };
    res.render("pages/urls_index", templateVars);
  } else {
    const templateVars = { loginStat };
    res.render("pages/login", templateVars);
  }
});

// After signup form is filled
app.post('/signup', (req, res) => {
  const email = req.body['email'];
  if (USERS[email] === undefined) {
    loginStat = true;
    USERS[email] = req.body['password'];
    res.render("pages/urls_new", loginStat);
  } else {
    res.render("pages/login", loginStat);
  }
});

// Redirect to /urls after a url is destroyed
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = { urls: urlDatabase, loginStat };
  res.render("pages/urls_index", templateVars);
});

// Redirect to /urls after an existing url is edited
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL'];
  const templateVars = { urls: urlDatabase, loginStat };
  res.render("pages/urls_index", templateVars);
});

// Redirect to /urls after a url is added
app.post("/urls/add", (req, res) => {
  let shortURL = req.body['longURLName'];
  if (shortURL === "" || shortURL === null || shortURL === undefined) {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = req.body['longURL'];
  const templateVars = { urls: urlDatabase, loginStat };
  res.render("pages/urls_index", templateVars);
});

// Custom 404 for all non-existing pages
app.get('*', function(req, res) {
  const templateVars = { loginStat };
  res.render("pages/404", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
