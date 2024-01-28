"use strict";

/** Routes for admins */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Admin = require("../models/admin");
const { createAdminToken } = require("../helpers/tokens");
const adminUpdateSchema = require("../schemas/adminUpdate.json");

const router = express.Router();

/** ROUTES USED BY ADMINS TO ADD, LIST, MODIFY OR DELETE ADMINS */

/** POST /api/admins  { admin }  => { admin, token }
 *
 * Adds a new admin. This is not the registration endpoint --- instead, this is
 * only for admin users to add new admin.
 *
 * admin = { email }
 *
 * This returns the newly created admin and an authentication token for them:
 *  {admin: { email}, token }
 *
 * Authorization required: only logged in admins can add new admins (middleware function ensureAdmin checks for this)
 **/

// router.post("/", ensureAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, adminNewSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map((e) => e.stack);
//       throw new BadRequestError(errs);
//     }

//     // create a new admin with the data in the requst body
//     const admin = await Admin.register(req.body);
//     const token = createToken(admin);
//     return res.status(201).json({ admin, token });
//   } catch (err) {
//     return next(err);
//   }
// });

/** GET /api/admins => { admins: [ {email, isAdmin }, ... ] }
 *
 * Returns list of all admins
 *
 * Authorization required: only logged Admins can get all users (middleware function ensureAdmin checks for this)
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const admins = await Admin.findAll();
    return res.json({ admins });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/admins/[email] => { admin }
 *
 * Returns specific admin with email => { email, isAdmin }
 *
 * Authorization required: log in. Getting information on a specific admin is only permitted by an admin (middleware function ensureAdmin checks for this)
 **/

router.get("/:email", async function (req, res, next) {
  try {
    // retrieve the data of the specific admin with the email sent in the request URL
    const admin = await Admin.get(req.params.email);
    return res.json({ admin });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /api/admins/[email] { admin } => { admin }
 *
 * Data can include:
 *   { email, password, isAdmin}
 *
 * Returns { email, isAdmin }
 *
 * Authorization required: log in. Updating the details of a specific admin is only permitted by an admin  (middleware function ensureAdmin checks for this)
 **/

router.patch("/:email", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, adminUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // update the specific admin with the email sent in the request URL with what's in the request body
    const admin = await Admin.update(req.params.email, req.body);
    return res.json({ admin });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /api/admins/[email]  =>  { deleted: email }
 *
 * Authorization required: log in. Deleting a specific admin is only permitted by an admin(middleware function ensureAdmin checks for this)
 **/

router.delete("/:email", ensureAdmin, async function (req, res, next) {
  try {
    await Admin.remove(req.params.email);
    return res.json({ deleted: req.params.email });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
