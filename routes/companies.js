"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companySearchSchema = require("../schemas/companySearch.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login and logged in user must be an Admin (ensureAdmin middleware checks for that)
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // create a new company with the data in the requst body
    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  // example: GET /companies/?name=smith&minEmployees=300&maxEmployees=950
  // grab the key/value pairs from the query string
  // i.e. q={ name: 'smith', minEmployees: '300', maxEmployees: '950' }
  const q = req.query;

  // values arrive as strings from querystring, but we want minEmployees and maxEmployees as integers. Unary operator (+) converts q.minEmployees and q.maxEmployees to numbers

  // i.e. q={ name: 'smith', minEmployees: 300, maxEmployees: 950 }
  if (q.minEmployees !== undefined) q.minEmployees = +q.minEmployees;
  if (q.maxEmployees !== undefined) q.maxEmployees = +q.maxEmployees;

  try {
    const validator = jsonschema.validate(q, companySearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    // pass in q with name and any numbers as integers to filter out the companies that match that query
    const companies = await Company.findAll(q);
    return res.json({ companies });
    // companies = [
    //   {
    //     handle: 'gillespie-smith',
    //     name: 'Gillespie-Smith',
    //     description: 'Candidate ability democratic make drug. Player themselves like front. Over through style loss win very when.',
    //     numEmployees: 302,
    //     logoUrl: '/logos/logo1.png'
    //   },
    //   {
    //     handle: 'smith-llc',
    //     name: 'Smith LLC',
    //     description: 'Statement use per mission method. Order truth method.',
    //     numEmployees: 908,
    //     logoUrl: null
    //   }
    // ]
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    // retrieve the data of the specific company with the handle sent in the request URL
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login and logged in user must be an Admin (ensureAdmin middleware checks for that)
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // update the specific company with the handle sent in the request URL with what's in the request body
    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login and logged in user must be an Admin (ensureAdmin middleware checks for that)
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
