const { assert } = require("chai");
const bcrypt = require("bcrypt");
const {
  getUserByEmail,
  urlsForUser,
  random,
  existingVisitor
} = require("../helpers.js");

const urlDatabase = {
  asfdx8: {
    longURL: "https://www.google.ca",
    userID: "test12",
    createdAt: "August 29th 2019, 6:39:50 am",
    totalCounter: 0,
    uniqueCounter: 0,
    visits: [
      {
        visitorId: "123456",
        visitedTime: "August 29th 2019, 6:39:50 am"
      },
      {
        visitorId: "123458",
        visitedTime: "August 29th 2019, 6:39:50 am"
      }
    ]
  }
};

const users = {
  test12: {
    id: "test12",
    email: "c@c.com",
    password: bcrypt.hashSync("a", 10)
  }
};

describe("random", function() {
  it("it should return random 6 digit alphanumeric id", function() {
    const user = random(urlDatabase);
    assert.strictEqual(6, user.length);
  });
});

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail(users, "c@c.com");
    const expectedOutput = "test12";
    assert.strictEqual(user, expectedOutput);
  });

  it("should return undefined with invalid email", function() {
    const user = getUserByEmail(users, "c@example.com");
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("should return urls database when input session id", function() {
    const user = urlsForUser(urlDatabase, "test12");
    const expectedOutput = {
      asfdx8: {
        createdAt: "August 29th 2019, 6:39:50 am",
        longURL: "https://www.google.ca",
        userID: "test12",
        totalCounter: 0,
        uniqueCounter: 0,
        visits: [
          {
            visitorId: "123456",
            visitedTime: "August 29th 2019, 6:39:50 am"
          },
          {
            visitorId: "123458",
            visitedTime: "August 29th 2019, 6:39:50 am"
          }
        ]
      }
    };
    assert.deepStrictEqual(user, expectedOutput);
  });
  it("should return undefined with invalid email", function() {
    const user = getUserByEmail(urlDatabase, "sadifs");
    assert.equal(user, undefined);
  });
});

describe("existingVisitor", function() {
  it("should return true for a vistor who has visited the shortURL", function() {
    assert.equal(existingVisitor(urlDatabase, "asfdx8", "123456"), true);
  });

  it("should return false for a vistor who has not visited the shortURL", function() {
    assert.equal(existingVisitor(urlDatabase, "asfdx8", "asd231"), false);
  });
});
