const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user/admin data */

function createUserToken(user) {
  // console.assert(
  //   user.isAdmin !== undefined,
  //   "createToken passed user without isAdmin property so assigned isAdmin=false"
  // );

  let payload = {
    email: user.email,
  };

  return jwt.sign(payload, SECRET_KEY);
}

function createAdminToken(admin) {
  let payload = {
    email: admin.email,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createUserToken, createAdminToken };
