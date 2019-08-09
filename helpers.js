// checking for existing email
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
  return undefined;
};

// random generator
function random(database) {
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
}

// filtering URLs based on userID
function urlsForUser(id, database) {
  let shortURL = {};
  for (let key in database) {
    if (id === database[key].userID) {
      shortURL[key] = { longURL: database[key].longURL, userID: id, counter: database[key].counter};
    }
  }
  return shortURL;
}

module.exports = { getUserByEmail, urlsForUser, random };
