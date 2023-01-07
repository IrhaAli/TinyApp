// Set up the express web server
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Starting database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Main page
app.get("/", (req, res) => {
  res.send("Welcom to Tiny URL App where anything is possible if you believe");
});

// My URLs/TinyApp page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

// Adding a new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// URL page for a specified url
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id] === undefined) {
    res.render("404");
  }
  const templateVars = { id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

// Redirect to /urls after an existing url has been edited
app.post("/urls", (req, res) => {
  let shortURL = req.body['longURLName'];
  urlDatabase[shortURL] = req.body['longURL'];
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

// Redirect to the longURL that the shortURL is hyperlinked to
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Redirect to urls after a url is destroyed
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Redirect to urls after an existing url is edited
app.post("/urls/:id/edit", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Redirect to urls after a url is added
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL'];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Custom 404 for all non-existing pages
app.get('*', function(req, res) {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
