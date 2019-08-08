const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const sessionession = require("cookie-session");
const bcrypt = require("bcrypt");
const { getUserByEmail, urlsForUser, random } = require("./helpers");

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
app.use(
  sessionession({
    name: "session",
    keys: ["ilovelisa"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

// homepage
app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    let templateVars = { users: users[req.session.user_id] };
    res.redirect("/login");
    return;
  } else {
    res.redirect("/urls");
  }
});

// page for new URLs
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = { users: users[req.session.user_id] };
    res.render("urls_new", templateVars);
    return;
  } else {
    res.redirect("/login");
  }
});

// page for the URL list
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    users: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// page for URLs updating and posting
app.post("/urls", (req, res) => {
  const string = random(urlDatabase);
  urlDatabase[string] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("http://localhost:8080/urls/" + String(string));
});

// the individual shortened URL pages
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    users: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  if (urlDatabase[req.params.id].longURL) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_new");
  }
});

// editting and changing shortened URL pages
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

// redirecting to new pages
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// deleting old URLs
app.post("/urls/:id/delete", (req, res) => {
  if (
    users[req.session.user_id] &&
    urlDatabase[req.param.id].userID === req.session.user_id
  ) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(400).send("Cannot delete URL link");
  }
});

// Registering for new accounts
app.get("/register", (req, res) => {
  res.render("register", { users: users[req.session.user_id] });
});

// logging in and out
app.get("/login", (req, res) => {
  res.render("login", { users: users[req.session.user_id] });
});

// registering as a new user
app.post("/register", (req, res) => {
  const userID = random(users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let userVars = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };
  //if no email or password provided render 400 status
  if (!userVars.email || !userVars.password) {
    res.status(400).send("Email and password fields are empty");
    //if email provided is existing render 400 status
  } else if (getUserByEmail(req.body.email, users)) {
    res
      .status(400)
      .send("Existing user, please register with a different email");
  } else {
    users[userID] = userVars;
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// logging an user out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// logging in an user
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //if no email found in the database render 403 status
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send("Email address cannot be found");
    //if email provided is existing render 400 status
  } else {
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
    res.status(403).send("You have entered the incorrect password");
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp Listening on port ${PORT}!`);
});
