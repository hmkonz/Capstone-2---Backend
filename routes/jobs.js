"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and logged in user must be an Admin (middleware function ensureAdmin checks for this)
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      
      // create a new job with the data in the requst body
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });

  /** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 * 
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    // example: GET /jobs/?title=astronomer&minSalary=140000&hasEquity=false
    // grab the key/value pairs from the query string
    // i.e. q={ title: 'astronomer', minSalary: '140000', hasEquity=false }
    const q = req.query;
   
    // values arrive as strings from querystring, but we want minSalary as an integer and hasEquity as a boolean. Unary operator (+) converts q.minSalary to a number
    
    // i.e. q={ title: 'astronomer', minSalary: 140000, hasEquity=false }
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";

  try {
    const validator = jsonschema.validate(q, jobSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    // pass in q with title, minSalary as an integer and hasEquity as boolean to filter out the jobs that match that query
    const jobs = await Job.findAll(q);
    return res.json({ jobs });
    // jobs = [
    //   {
    //     id: 47,
    //     title: 'astronomer',
    //     salary: 143000,
    //     equity: null,
    //     companyHandle: 'watson-davis'
    //   },
    //   {
    //     id: ,
    //     title: '',
    //     salary: ,
    //     equity: null,
    //     companyHandle: '',
    //     
    //   }
    // ]

  } catch (err) {
    return next(err);
  }
});


/** GET /[jobId]  =>  { job }
 * 
 * Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    try {
      // retrieve the data of the specific job with the id sent in the request URL
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

  /** PATCH /[jobId] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and logged in user must be an Admin (middleware function ensureAdmin checks for this)
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }

      // update the specific job with the id sent in the request URL with what's in the request body 
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

  /** DELETE /[jobId]  =>  { deleted: jobId }
 *
 * Authorization: login and logged in user must be an Admin (middleware function ensureAdmin checks for this)
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      // Since all params are strings, unary operator (+) converts req.params.id to a number
      return res.json({ deleted: +req.params.id });
    } catch (err) {
      return next(err);
    }
  });
  
  
  module.exports = router;
  
  