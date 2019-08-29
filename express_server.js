const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const sessionession = require("cookie-session");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  urlsForUser,
  random,
  existingVisitor
} = require("./helpers");
const methodOverride = require("method-override");
const app = express();
const favicon = require("serve-favicon");
const path = require("path");
const moment = require("moment");

// contains url database
const urlDatabase = {
  //Empty at start of application

  asfdx8: {
    longURL: "https://www.google.ca",
    userID: "test12",
    createdAt: 'August 29th 2019, 6:39:50 am',
    totalCounter: 0,
    uniqueCounter: 0,
    visits: []
  },

};
// contains users database
const users = {
  //Empty at start of application
  test12: {
    id: "test12",
    email: "c@c.com",
    password: bcrypt.hashSync("a", 10)
  }
};
// contains temp visitors database
let visitors = {
  //Empty at start of application
  /*
  Example key-value pair:
  "visitorRandomID" : "visitorRandomID"
  */
};

// parsing the information coming from the client
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(
  sessionession({
    name: "session",
    keys: ["ilovelisa"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.use(cookieParser());

// ............................GET...........................//

// Homepage
app.get("/", (req, res) => {
  // if not logged in, redirect to login page
  if (!users[req.session.user_id]) {
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
    res
      .status(404)
      .send('Error: 404 Page not found. <a href="/"> Go Back </a>');
  }
  // if logged in, render to URL page
  else {
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.session.user_id),
      users: users[req.session.user_id],
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
    res
      .status(409)
      .send('Error: 409 User not found. <a href="/"> Go Back </a>');
    // if URL doesn't exist, display error
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send('Error: 404 Not found. <a href="/"> Go Back </a>');
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
          longURL: urlDatabase[req.params.id].longURL,
          createdAt: urlDatabase[req.params.id].createdAt,
          totalCounter: urlDatabase[req.params.id].totalCounter,
          uniqueCounter: urlDatabase[req.params.id].uniqueCounter
        };
        res.render("urls_show", templateVars);
      }
    }
  }
  //it not user's URL, display error
  else {
    res
      .status(401)
      .send('Error: 401 Cannot access URL link. <a href="/"> Go Back </a>');
  }
});

// Redirecting to new pages
app.get("/u/:id", (req, res) => {
  // if not logged in, display error
  if (!urlDatabase[req.params.id]) {
    res.status(404).send('Error: 404 URL Not found. <a href="/"> Go Back </a>');
  } else {
    urlDatabase[req.params.id].totalCounter++;
    const longURL = urlDatabase[req.params.id].longURL;
    let visitorID;
    //If visitor contains an existing visitorID cookie in the database, then proceed or else generate a new visitorID cookie and add it to the database.
    if (req.cookies["visitorID"] && visitors[req.cookies["visitorID"]]) {
      visitorID = req.cookies["visitorID"];
    } else {
      visitorID = random(visitors);
      visitors[visitorID] = visitorID;
      res.cookie("visitorID", visitorID);
    }

    //If the visitor is unique, add to unique counter
    if (!existingVisitor(urlDatabase, req.params.id, visitorID)) {
      urlDatabase[req.params.id].uniqueCounter++;
    }
    //Add the visit information to the short url object
    urlDatabase[req.params.id].visits.push({
      visitorId: visitorID,
      visitedTime: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
    });
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
    res
      .status(401)
      .send(
        'Error: 401 Unauthorized user not found. <a href="/"> Go Back </a>'
      );
  } else {
    const string = random(urlDatabase);
    urlDatabase[string] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      totalCounter: 0,
      uniqueCounter: 0,
      visits: []
    };
    console.log(urlDatabase[string]);
    res.redirect(`/urls/${String(string)}`);
  }
});

// editting and changing shortened URL page
app.put("/urls/:id", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res
      .status(401)
      .send(
        'Error: 401 Unauthorized user not found. <a href="/"> Go Back </a>'
      );
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
    res
      .status(401)
      .send(
        'Error: 401 Unauthorized Cannot delete URL link. <a href="/">Go Back </a>'
      );
  }
});

// deleting old URLs
app.delete("/urls/:id/delete", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res
      .status(401)
      .send(
        'Error: 401 Unauthorized user not found. <a href="/"> Go Back </a>'
      );
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
    res
      .status(401)
      .send(
        "Error: 401 Unauthorized Cannot delete URL link. <a href=" /
          "> Go Back </a>"
      );
  }
});

// logging in an user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //if no email found in the database render 403 status
  if (!getUserByEmail(users, req.body.email)) {
    res
      .status(403)
      .send(
        'Error: 403 Email address cannot be found. <a href="/"> Go Back </a>'
      );
  }
  // logging in an user
  else {
    for (let item in users) {
      user = users[item];
      if (email === user.email && bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect("/urls");
        return;
      }
    }
    //if email and password don't provided is existing render 400 status
    res
      .status(401)
      .send(
        'Error: 401 Unauthorized You have entered the incorrect password. <a href="/"> Go Back </a>'
      );
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
      res
        .status(400)
        .send(
          'Error: 400 Email and password fields are empty. <a href="/"> Go Back </a>'
        );
    }
    //if email provided is existing render 409 status
    else if (getUserByEmail(users, req.body.email)) {
      res
        .status(400)
        .send(
          'Error: 409 Existing user, please register with a different email. <a href="/"> Go Back </a>'
        );
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
  console.log(`TinyApp is listening on port ${PORT}!`);
});
