const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data */

function createUserToken(user) {
  let payload = {
    email: user.email,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createUserToken };
