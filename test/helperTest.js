const { assert } = require("chai");
const bcrypt = require('bcrypt');
const { getUserByEmail, urlsForUser, random } = require("../helpers.js");

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

describe("random", function() {
  it("it should return random 6 digit alphanumeric id", function() {
    const user = random(urlDatabase);
    assert.equal(6, user.length);
  });
});

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });

  it("should return undefined with invalid email", function() {
    const user = getUserByEmail("c@example.com", users);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});

describe("urlsForUser", function() {
  it("should return urls database when input session id", function() {
    const user = urlsForUser("aJ48lW", urlDatabase);
    const expectedOutput =  { 
      sgq3y6: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
    };
    assert.deepStrictEqual(user, expectedOutput);
  });
  it("should return undefined with invalid email", function() {
    const user = getUserByEmail("sadifs", urlDatabase);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, undefined);
  });
});
