"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createUserToken } = require("../helpers/tokens");
const userRegisterLoginSchema = require("../schemas/userRegisterLogin.json");
const { BadRequestError } = require("../expressError");

/** POST /api/auth/user/register:   { user } => { token }
 *
 * user must include { email, password }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/user/register", async function (req, res, next) {
  try {
    // check to make sure login info in Register Form matches the data required
    const validator = jsonschema.validate(req.body, userRegisterLoginSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const newUser = await User.register(req.body);
    const token = createUserToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /api/auth/user/token:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/user/token", async function (req, res, next) {
  try {
    // check to make sure login info in Login Form matches the data required
    const validator = jsonschema.validate(req.body, userRegisterLoginSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    const user = await User.authenticateUser(email, password);
    const token = createUserToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
