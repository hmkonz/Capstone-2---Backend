"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    // check to see if company handle already exists before creating it
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    // add new company data (from req.body) to database and return new company data
    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies (optional filter on minEmployees, maxEmployees, name).
   *
   * optional filters on:
   * - minEmployees
   * - maxEmployees
   * - name (will find case-insensitive, partial matches)
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  // optionally pass in query string key/value pairs from request URL:
  // example: GET /companies/?name=smith&minEmployees=300&maxEmployees=950
  static async findAll({ minEmployees, maxEmployees, name } = {}) {
    // retrieve all companies in the database
    let query = `SELECT handle,
                        name,
                        description,
                        num_employees AS "numEmployees",
                        logo_url AS "logoUrl"
                 FROM companies`;
    // whereExpressions will hold the keys sent in the query string and what they equal i.e. ['num_employees >= $1', 'num_employees <= $2', 'name ILIKE $3']
    let whereExpressions = [];

    // queryValues will hold the corresponding values sent in the query string i.e. [ 300, 950, '%smith%' ]
    let queryValues = [];

    if (minEmployees > maxEmployees) {
      throw new BadRequestError(
        "Min employees cannot be greater than max employees"
      );
    }

    // For each possible search term, add to queryValues and whereExpressions so we can
    // generate the right SQL

    // queryValues = [ 300 ]
    // whereExpressions [ 'num_employees >= $1' ]
    if (minEmployees !== undefined) {
      queryValues.push(minEmployees);
      whereExpressions.push(`num_employees >= $${queryValues.length}`);
    }

    // queryValues [ 300, 950 ]
    // whereExpressions [ 'num_employees >= $1', 'num_employees <= $2' ]
    if (maxEmployees !== undefined) {
      queryValues.push(maxEmployees);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    //  queryValues [ 300, 950, '%smith%' ]
    // whereExpressions [ 'num_employees >= $1', 'num_employees <= $2', 'name ILIKE $3' ]
    if (name) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    // if there are elements in the whereExpressions array add WHERE to the end of the SQL query ('query') and join the elements in the whereExpression array with AND (i.e. WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3)
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }
    //  query += WHERE equals:
    //          SELECT handle,
    //                 name,
    //                 description,
    //                 num_employees AS "numEmployees",
    //                 logo_url AS "logoUrl"
    //          FROM companies
    //          WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3

    // Add 'ORDER BY name' to the end of the SQL query ('query')

    query += " ORDER BY name";
    //  query += "ORDER BY name" equals:
    //          SELECT handle,
    //                 name,
    //                 description,
    //                 num_employees AS "numEmployees",
    //                 logo_url AS "logoUrl"
    //          FROM companies
    //          WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3
    //          ORDER BY name

    // pass in the SQL query generated above 'query' as well as the queryValues from the query string to get the resulting companies that satisfy the search filters
    const companiesRes = await db.query(query, queryValues);

    return companiesRes.rows;

    // companiesRes.rows [
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
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    // retrieve the company data with the handle found in request URL
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    // retrieve the jobs with a company_handle that's the same as 'handle'
    const jobsRes = await db.query(
      `SELECT id, title, salary, equity
           FROM jobs
           WHERE company_handle = $1
           ORDER BY id`,
      [handle]
    );
    // adds a 'jobs' property on company object and set it equal to search result above of jobs with the handle passed in
    company.jobs = jobsRes.rows;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    // setCols equals "name"=$1, "description"=$2, "num_employees"=$3, "logo_url"=$4
    // values = values of key/value pairs of data in request body
    // i.e. [
    //   'Bechtel Corporation',
    //   'Engineering, Construction and Project Management',
    //   2100,
    //   'https:/example.com/logos/logo45.png'
    // ]
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });

    // set column for WHERE expression. handleVarIdx: "handle" = $5
    const handleVarIdx = "$" + (values.length + 1);

    // create the SQL query for updating the companies table
    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;

    // retrieve the results of the query above with the values in the request body 'values' and 'handle' from the request URL passed in
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
