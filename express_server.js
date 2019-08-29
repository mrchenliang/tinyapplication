const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const sessionession = require("cookie-session");
const cookieParser = require("cookie-parser");
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
    createdAt: "August 29th 2019, 6:39:50 am",
    totalCounter: 0,
    uniqueCounter: 0,
    visits: []
  }
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
  } else {
    // if logged in, redirect to urls
    res.redirect("/urls");
  }
});

// Page for the URL list
app.get("/urls", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status = 404;
    res.render("errorPage", { status: 404, description:"Not Found", message: "You are not logged in." });
  } else {
    // if logged in, render to URL page
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.session.user_id),
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
  } else {
    // if logged in, render to new URL page
    let templateVars = { users: users[req.session.user_id] };
    res.render("urls_new", templateVars);
    return;
  }
});

// Individual shortened URL pages
app.get("/urls/:id", (req, res) => {
  // if not logged in, display error
  if (!users[req.session.user_id]) {
    res.status = 404;
    res.render("errorPage", { status: 404, description:"Not Found", message: "You are not logged in." });
    } else if (!urlDatabase[req.params.id]) {
    // if URL doesn't exist, display error
    res.status = 404;
    res.render("errorPage", { status: 404, description:"Not Found", message: "URL does not exist." });
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
          uniqueCounter: urlDatabase[req.params.id].uniqueCounter,
          visits: urlDatabase[req.params.id].visits
        };
        res.render("urls_show", templateVars);
      }
    }
  } else {
    //it is not user's URL, display error
    res.status = 401;
    res.render("errorPage", { status: 401, description:"No Access", message: "Cannot Access URL Link." });
  }
});

// Redirecting to new pages
app.get("/u/:id", (req, res) => {
  // if not logged in, display error
  if (!urlDatabase[req.params.id]) {
    res.status = 404;
    res.render("errorPage", { status: 404, description:"Not Found", message: "You are not logged in." });
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
  // if not logged in, redirect to urls which will direct user to login
  if (users[req.session.user_id]) {
    res.redirect("urls");
  } else {
    // logging in user
    res.render("login", { users: users[req.session.user_id] });
  }
});

// Registering for new accounts
app.get("/register", (req, res) => {
  // if not logged in, redirect to urls which will direct user to login
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
    res.status = 404;
    res.render("errorPage", { status: 404, description:"Not Found", message: "You are not logged in." });
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
    res.redirect(`/urls/${String(string)}`);
  }
});

// editting and changing shortened URL page
app.put("/urls/:id", (req, res) => {
  // if not logged in, cannot edit/change url, dispaly error
  if (!users[req.session.user_id]) {
    res.status = 401;
    res.render("errorPage", { status: 401, description:"Not Found", message: "You Do Not Have Access." });
  } else if (
    //editting and changing the shortened URL page
    users[req.session.user_id] &&
    urlDatabase[req.params.id].userID === req.session.user_id
  ) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    //trying to delete someone else's link will result in error
    res.status = 401;
    res.render("errorPage", { status: 401, description:"Not Found", message: "You Do Not Have Access." });
  }
});

// deleting old URLs
app.delete("/urls/:id/delete", (req, res) => {
  // if not logged in, cannot edit/change url, dispaly error
  if (!users[req.session.user_id]) {
    res.status = 401;
    res.render("errorPage", { status: 401, description:"Not Found", message: "You Do Not Have Access." });
  } else if (
  // deleting old URLs
    users[req.session.user_id] &&
    urlDatabase[req.params.id].userID === req.session.user_id
  ) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    //trying to delete someone else's link will result in error
    res.status = 401;
    res.render("errorPage", { status: 401, description:"Not Found", message: "You Do Not Have Access." });
  }
});

// logging in an user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //if no email found in the database render 403 status
  if (!getUserByEmail(users, req.body.email)) {
    res.status = 401;
    res.render("errorPage", { status: 401, description:"Not Found", message: "Your Email Cannot Be Found." });
  } else {
    // logging in an user
    for (let item in users) {
      let user = users[item];
      if (email === user.email && bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect("/urls");
        return;
      }
    }
    //if email and password don't provided is existing render 404 status
    res.status = 401;
    res.render("errorPage", { status: 401, description:"Not Found", message: "You Have Entered the Incorrect Password." });
  }
});

// registering as a new user
app.post("/register", (req, res) => {
  // if not logged in, redirect to urls which will direct user to login
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    // registering as a new user
    const userID = random(users);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let userVars = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    //if no email or password provided render 400 status
    if (!userVars.email || !userVars.password) {
      res.status = 400;
      res.render("errorPage", { status: 400, description:"Not Found", message: "Your Email and Password Fields are Empty." });
    } else if (getUserByEmail(users, req.body.email)) {
      //if email provided is existing render 409 status
      res.status = 409;
      res.render("errorPage", { status: 409, description:"Not Found", message: "Existing User, Please Register Using a Different Email." });
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
