"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user
 *
 * If a token was provided, verify this was a token signed with our secret key SECRET_KEY, and, if valid, store the token payload on res.locals (this will include the email field)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateUserJWT(req, res, next) {
  try {
    // set authHeader to the Bearer token in req.headers.authorization (i.e. Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJsb3Nzb21rb256QGdtYWlsLmNvbSIsImlhdCI6MTcwMzAzMDY4MH0.Z15h0kxfz3UoV822-eaTeQ1s_5EHflh6lvuUECblB9U)
    const authHeader = req.headers && req.headers.authorization;

    if (authHeader) {
      // if there is a Bearer token in authHeader, remove "Bearer" and assign the remainder to 'token' (i.e. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJsb3Nzb21rb256QGdtYWlsLmNvbSIsImlhdCI6MTcwMzAzMDY4MH0.Z15h0kxfz3UoV822-eaTeQ1s_5EHflh6lvuUECblB9U)

      // trim() method removes whitespace from both ends of the string and returns a new string, without modifying the original string
      const token = authHeader.replace(/^[Bb]earer /, "").trim();

      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when user must be logged in
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    // if token submitted with request is not valid, throw an error
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when user must provide a valid token & be the user with a username matching
 *  username provided in params URL
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    // the logged in user (the one with the token submitted with request) must be the same user as the name in the params
    // 'user.username' is the logged in user (whose token is being provided)
    // req.params.username is the user's name sent along in the params URL

    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateUserJWT,
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
};
