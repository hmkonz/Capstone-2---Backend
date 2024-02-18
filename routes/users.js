// "use strict";

// /** Routes for users */

const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const User = require("../models/user");

const router = express.Router();

// /** GET /api/users/[email] => { user }
//  *
//  * Finds user with 'email'
//  *
//  * Returns { email, name }
//  *
//  * Authorization required: user must be logged in (middleware function ensureCorrectUserOrAdmin checks for this)
//  **/

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

module.exports = router;
