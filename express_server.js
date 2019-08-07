function random() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const urlDatabase = require('./database');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// parsing the information coming from the client
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// homepage
app.get("/", (req, res) => {
  res.redirect("/urls/new");
});

// page for new URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies["username"] });
});

// page for the URL list
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// page for URLs updating and posting
app.post("/urls", (req, res) => {
  var string = random();
  urlDatabase[string] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/" + String(string));
});

// the individual shortened URL pages
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  if (urlDatabase[req.params.id]) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_new");
  }
});

// editting and changing shortened URL pages
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

// redirecting to new pages
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// deleting old URLs
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Registering for new accounts
app.get("/register", (req, res) => {
  res.render("register", { username: req.cookies["username"] })
});

// logging in and out
app.get("/login", (req, res) => {
  res.render("login", { username: req.cookies["username"] })
});

app.post("/register", (req, res) => {
  userID = random();
  let users = {id: userID, email: req.body.email, password: req.body.password};
  res.cookie('user_id', userID);
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
