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
function random() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// filtering URLs based on userID
function urlsForUser(id, database) {
  let shortURL = {};
  for (let key in database) {
    if (id === database[key].userID) {
      shortURL[key] = { longURL: database[key].longURL, userID: id };
    }
  }
  return shortURL;
}

module.exports = { getUserByEmail, urlsForUser, random };
