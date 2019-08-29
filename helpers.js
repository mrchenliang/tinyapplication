// checking for existing email
const getUserByEmail = function(database, email) {
  for (let user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
  return undefined;
};

// random generator
const random = function(database) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  if (!database[result]) {
    return result;
  } else {
    random(database);
  }
};

// filtering URLs based on userID
const urlsForUser = function(database, id) {
  let shortURL = {};
  for (let key in database) {
    if (id === database[key].userID) {
      shortURL[key] = {
        longURL: database[key].longURL,
        userID: id,
        createdAt: database[key].createdAt,
        totalCounter: database[key].totalCounter,
        uniqueCounter: database[key].uniqueCounter,
        visits: database[key].visits
      };
    }
  }
  return shortURL;
};

const existingVisitor = function(database, id, visitorID) {
  let visits = database[id].visits;
  for (const visit of visits) {
    if (visit.visitorId === visitorID) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail, urlsForUser, random, existingVisitor };
