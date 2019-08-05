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
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect('/urls/new');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var string = random();
  urlDatabase[string] = req.body.longURL;
  res.redirect('http://localhost:8080/urls/' + String(string)) ;
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars =  { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  }
  else {
    res.render("urls_new");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});









