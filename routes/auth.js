"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const Admin = require("../models/admin");
const express = require("express");
const router = new express.Router();
const { createUserToken, createAdminToken } = require("../helpers/tokens");
const userAdminRegisterLoginSchema = require("../schemas/userAdminRegisterLogin.json");
const { BadRequestError } = require("../expressError");

/** POST /api/auth/user/register:   { user } => { token }
 *
 * user must include { email, firstName, lastName, password }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/user/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(
      req.body,
      userAdminRegisterLoginSchema
    );
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
    const validator = jsonschema.validate(
      req.body,
      userAdminRegisterLoginSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    console.log("THis is email in routes/auth", email);
    console.log("this is password in routes/auth.js", password);
    const user = await User.authenticateUser(email, password);
    console.log("This is user in routes/auth.js", user);
    const token = createUserToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /api/auth/admin/register:   { admin } => { token }
 *
 * admin must include { email, password, isAdmin }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

// router.post("/admin/register", async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(
//       req.body,
//       userAdminRegisterLoginSchema
//     );
//     if (!validator.valid) {
//       const errs = validator.errors.map((e) => e.stack);
//       throw new BadRequestError(errs);
//     }
//     const newAdmin = await Admin.register({ ...req.body, isAdmin: true });
//     const token = createAdminToken(newAdmin);
//     return res.status(201).json({ token });
//   } catch (err) {
//     return next(err);
//   }
// });

/** POST /api/auth/admin/signin:  { email, password* } => { token }
 *
 * *password is optional for new admins but required admins that have already signed once before
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/admin/signin", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(
      req.body,
      userAdminRegisterLoginSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    console.log("THis is req.body in routes/auth.js", req.body);
    const admin = await Admin.authenticateAdmin(email, password);
    console.log("THis is admin in routes/auth.js", admin);
    const token = createAdminToken(admin);
    console.log("THis is token in routes/auth.js", token);
    return res.json({ email, password });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
