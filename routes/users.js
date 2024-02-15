"use strict";

/** Routes for users */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST /api/user  { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * user = { email, name, stripeCustomerId }
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { email, name, stripeCustomerId }, token }
 *
 * Authorization required: login and user logged in must be an Admin (middleware function
 * ensureAdmin checks for this)
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create a new user with the data in the request body
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/users => [{ email, name, stripeCustomerId }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login and logged in user must be an Admin to get all users (middleware function ensureAdmin checks for this)
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/users/[email] => { user }
 *
 * Finds user with 'email'
 *
 * Returns { email, name, stripeCustomerId }
 *
 * Authorization required: log in. Getting information on a specific user is only permitted by an admin or that user (middleware function ensureCorrectUserOrAdmin checks for this)
 **/

router.get(
  "/:email",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      // retrieve the data of the specific user with the id sent in the request URL
      const user = await User.get(req.params.email);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /api/users/[email] { user } => { user }
 *
 * Data can include: { email, name, password, stripeCustomerId }
 *
 * Updates data for user with 'email'
 *
 * Returns { email, name, password, stripeCustomerId }
 *
 * Authorization required: log in. Updating the details of a specific user is only permitted by an admin or by that user (middleware function ensureCorrectUserOrAdmin checks for this)
 **/

router.patch(
  "/:email",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      // update the specific user with the id sent in the request URL with what's in the request body
      const user = await User.update(req.params.email, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /api/users/[email]  =>  { deleted: email }
 *
 * Deletes user with 'email'
 *
 * Authorization required: admin or same-user-with-:id (middleware function ensureCorrectUserOrAdmin checks for this)
 **/

router.delete(
  "/:email",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(req.params.email);
      return res.json({ deleted: req.params.email });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
