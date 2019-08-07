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
const cookieParser = require("cookie-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

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
  res.render("urls_new", {users: users[req.cookies["user_id"]]});
});

// page for the URL list
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, users: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

// page for URLs updating and posting
app.post("/urls", (req, res) => {
  const string = random();
  urlDatabase[string] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/" + String(string));
});

// the individual shortened URL pages
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
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
  res.render("register",{users: users[req.cookies["user_id"]]});
});

// logging in and out
app.get("/login", (req, res) => {
  res.render('login', {users: users[req.cookies["user_id"]]});
});

// checking for existing email
function existingEmail(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
    return false;
  }
}
// registering as a new user
app.post("/register", (req, res) => {
  const userID = random();
  let userVars = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  //if no email or password provided render 400 status
  if (!userVars.email || !userVars.password) {
    res.status(400).send("Email and password fields are empty");
    //if email provided is existing render 400 status
  } else if (existingEmail(req.body.email)) {
    res.status(400).send("Existing user, please register with a different email");
  } else {
    users[userID] = userVars;
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

// logging an user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

function findPassword(email, password) {
  for (let item in users) {
    user = users[item];
    if (email === user.email && password === user.password) {
      return true;
    }
    return false;
}
};

// logging in an user
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //if no email found in the database render 403 status
  if (!existingEmail(req.body.email)) {
    res.status(403).send("Email address cannot be found");
    //if email provided is existing render 400 status
  } else if (!findPassword(req.body.email, req.body.password)) {
    res.status(403).send("You have entered the incorrect password");
  } else {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
};
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
