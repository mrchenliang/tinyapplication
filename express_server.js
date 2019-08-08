const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const sessionession = require("cookie-session");
const bcrypt = require("bcrypt");
const { getUserByEmail, urlsForUser, random } = require("./helpers");
const methodOverride = require("method-override");
const app = express();
const favicon = require('serve-favicon');
const path = require('path');

const urlDatabase = {
  sgq3y6: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  asfdx8: { longURL: "https://www.google.ca", userID: "test12" },
  csdsf2: { longURL: "https://www.youtube.ca", userID: "test12" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  test12: {
    id: "test12",
    email: "c@c.com",
    password: bcrypt.hashSync("a", 10)
  }
};

// parsing the information coming from the client
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(
  sessionession({
    name: "session",
    keys: ["ilovelisa"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

exports.index = function(req, res) {
  // send moment to your ejs
  res.render('index', { moment: moment });
}

// ............................GET...........................//

// Homepage
app.get("/", (req, res) => {
  // if not logged in, redirect to login page
  if (!users[req.session.user_id]) {
    let templateVars = { users: users[req.session.user_id] };
    res.redirect("/login");
    return;
  }
  // if logged in, redirect to urls
  else {
    res.redirect("/urls");
  }
});

// Page for the URL list
app.get("/urls", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status(404).send("Page not found");
  }
  // if logged in, render to URL page
  else {
    let templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      users: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

// Page for new URLs
app.get("/urls/new", (req, res) => {
  // if not logged in, redirect to login page
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  // if logged in, render to new URL page
  else {
    let templateVars = { users: users[req.session.user_id] };
    res.render("urls_new", templateVars);
    return;
  }
});

// Individual shortened URL pages
app.get("/urls/:id", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status(409).send("409 User not found");
    // if URL doesn't exist, display error
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send("404 Not found");
  } else if (
    users[req.session.user_id] &&
    urlDatabase[req.params.id] &&
    urlDatabase[req.params.id].userID === req.session.user_id
  ) {
    // display the URL page
    for (let item in urlDatabase) {
      if (req.params.id === item) {
        let templateVars = {
          users: users[req.session.user_id],
          shortURL: req.params.id,
          longURL: urlDatabase[req.params.id].longURL
        };
        res.render("urls_show", templateVars);
      }
    }
  } 
  //it not user's URL, display error
  else {
    res.status(401).send("401 Cannot access URL link");
  }
});

// Redirecting to new pages
app.get("/u/:id", (req, res) => {
  // if not logged in, display error
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("404 URL Not found");
  } else {
    let longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

// Logging in
app.get("/login", (req, res) => {
  // if not logged in, display error
  if (users[req.session.user_id]) {
    res.redirect("urls");
  } 
  // logging in user
  else {
    res.render("login", { users: users[req.session.user_id] });
  }
});

// Registering for new accounts
app.get("/register", (req, res) => {
  // if not logged in, display error
  if (users[req.session.user_id]) {
    res.redirect("urls");
  } else {
    res.render("register", { users: users[req.session.user_id] });
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlsForUser(req.session.user_id, urlDatabase));
});

// ............................POST...........................//

// page for URLs updating and posting
app.post("/urls", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status(401).send("401 Unauthorized user not found");
  } else {
    const string = random(urlDatabase);
    urlDatabase[string] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("http://localhost:8080/urls/" + String(string));
  }
});

// editting and changing shortened URL page
app.put("/urls/:id", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status(401).send("401 Unauthorized user not found");
  }
  //editting and changing the shortened URL page
  else if (
    users[req.session.user_id] &&
    urlDatabase[req.params.id].userID === req.session.user_id
  ) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
  //trying to delete someone else's link will result in error
  else {
    res.status(401).send("401 Unauthorized Cannot delete URL link");
  }
});

// deleting old URLs
app.delete("/urls/:id/delete", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status(401).send("401 Unauthorized user not found");
  }
  // deleting old URLs
  else if (
    users[req.session.user_id] &&
    urlDatabase[req.params.id].userID === req.session.user_id
  ) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
  //trying to delete someone else's link will result in error
  else {
    res.status(401).send("401 Unauthorized Cannot delete URL link");
  }
});

// logging in an user
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //if no email found in the database render 403 status
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send("403 Email address cannot be found");
  }
  // logging in an user
  else {
    for (let item in users) {
      user = users[item];
      if (
        req.body.email === user.email &&
        bcrypt.compareSync(req.body.password, user.password)
      ) {
        req.session.user_id = user.id;
        res.redirect("/urls");
        return;
      }
    }
    //if email and password don't provided is existing render 400 status
    res
      .status(401)
      .send("401 Unauthorized You have entered the incorrect password");
  }
});

// registering as a new user
app.post("/register", (req, res) => {
  // if not logged in, display error
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  // registering as a new user
  else {
    const userID = random(users);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let userVars = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    //if no email or password provided render 400 status
    if (!userVars.email || !userVars.password) {
      res.status(400).send("400 Email and password fields are empty");
    }
    //if email provided is existing render 409 status
    else if (getUserByEmail(req.body.email, users)) {
      res
        .status(400)
        .send("409 Existing user, please register with a different email");
    } else {
      users[userID] = userVars;
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

// logging an user out
app.delete("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`TinyApp Listening on port ${PORT}!`);
});
