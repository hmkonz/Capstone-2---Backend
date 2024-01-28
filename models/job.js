"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data sent along in req.body should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handlel }
   *
   * Throws BadRequestError if job is already in database.
   * */

  static async create(data) {
    // create a new job with the data passed in the req.body
    const result = await db.query(
        `INSERT INTO jobs
             (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [
        data.title,
        data.salary,
        data.equity,
        data.companyHandle,
      ],
    );

    let job = result.rows[0];

    return job;
  }


  /** Find all jobs (optional filter on minSalary, hasEquity, title).
   * 
   * optional filters on:
   * - minSalary
   * - hasEquity
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, company_handle, companyName }, ...]
   * */

  // optionally pass in query string key/value pairs from request URL:
  // example: GET /jobs/?minSalary=100000&hasEquity=true&title=Engineer, materials
  static async findAll({minSalary, hasEquity, title} = {}) {
    // // retrieve all jobs and corresponding companyNames in the database
    let query = `SELECT j.id,
                      j.title,
                      j.salary,
                      j.equity,
                      j.company_handle AS "companyHandle",
                      c.name AS "companyName"
                FROM jobs j 
                LEFT JOIN companies AS c ON c.handle = j.company_handle`;

    // whereExpressions will hold the keys sent in the query string and what they equal i.e. ['salary >= $1', 'equity > 0', 'title ILIKE $3']            
    let whereExpressions = [];

    // queryValues will hold the corresponding values sent in the query string i.e. [ 100000, true, '%Engineer, materials%' ] 
    let queryValues = [];

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }
    // queryValues = [ 100000 ]
    // whereExpressions [ 'salary >= $1' ]

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }
    // queryValues [ 100000, true ]
    // whereExpressions [ 'salary >= $1', 'equity > 0' ]
   

    if (title) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }
    //  queryValues [ 100000, true, '%Engineer, materials%' ]
    // whereExpressions [ 'salary >= $1', 'equity > 0', 'title ILIKE $2' ] 
   

    // if there are elements in the whereExpressions array add WHERE to the end of the SQL query ('query') and join the elements in the whereExpression array with AND (i.e. WHERE salary >= $1 AND equity > 0 AND title ILIKE $2)
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }
    
//  query += WHERE equals:
//          SELECT j.id,
                // j.title,
                // j.salary,
                // j.equity,
                // j.company_handle AS "companyHandle",
                // c.name AS "companyName"
                // FROM jobs j
                // LEFT JOIN companies AS c ON c.handle = j.company_handle WHERE salary >= $1  
                // AND equity > 0 AND title ILIKE $2
                
   
    // Add 'ORDER BY id' to the end of the SQL query ('query')

    query += " ORDER BY id";
//  query += "ORDER BY title" equals: 
//          SELECT j.id,
                // j.title,
                // j.salary,
                // j.equity,
                // j.company_handle AS "companyHandle",
                // c.name AS "companyName"
                // FROM jobs j
                // LEFT JOIN companies AS c ON c.handle = j.company_handle WHERE salary >= $1 AND equity > 0 AND title ILIKE $2 ORDER BY title 
  
    // pass in the SQL query generated above 'query' as well as the queryValues from the query string to get the resulting jobs that satisfy the search filters          
    const jobsRes = await db.query(query, queryValues);
    
    return jobsRes.rows;

    // jobsRes.rows [
        //   {
          //   id: 75,
          //   title: 'Engineer, materials',
          //   salary: 185000,
          //   equity: '0.081',
          //   companyHandle: 'garner-michael',
          //   companyName: 'Garner-Michael'
      // },
      //     {
          //   id: 136,
          //   title: 'Engineer, materials',
          //   salary: 140000,
          //   equity: '0.057',
          //   companyHandle: 'mitchell-brown',
          //   companyName: 'Mitchell-Brown'
      // }
    // ]

  }
 

   /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company}
   * where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    // retrieve the job data with the id found in request URL
    const jobRes = await db.query(
           `SELECT id,
                   title,
                   salary,
                   equity,
                   company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    // retrieve the companies that have the same handle as the job retrieved above
    const companiesRes = await db.query(
         `SELECT handle,
                 name,
                 description,
                 num_employees AS "numEmployees",
                 logo_url AS "logoUrl"
          FROM companies
          WHERE handle = $1`, [job.companyHandle]);

    // remove companyHandle from job object
    delete job.companyHandle;

    // add property "company" to job object and set it equal to search result above of companies with handle = job.companyHandle
    job.company = companiesRes.rows[0];
  
    return job;

    // {
    //   "job": {
    //     "id": 201,
    //     "title": "Conservator, clothing",
    //     "salary": 95000,
    //     "equity": "0",
    //     "company": {
    //       "handle": "watson-davis",
    //       "name": "Watson-Davis",
    //       "description": "Year join loss.",
    //       "numEmployees": 819,
    //       "logoUrl": "/logos/logo3.png"
    //     }
    //   }
    // }
  }


   /** Update job data with `data`.
    *
    * This is a "partial update" --- it's fine if data doesn't contain all the
    * fields; this only changes provided ones.
    *
    * Data can include: {title, salary, equity}
    *
    * Returns {id, title, salary, equity, companyHandle}
    *
    * Throws NotFoundError if not found.
    */

  static async update(id, data) {
    // This is data: { title: 'Conservator, clothing', salary: 90000, equity: '0' }
    // setCols = "title"=$1, "salary"=$2, "equity"=$3
    // values = values of key/value pairs in request body i.e. [ 'Conservator, clothing', 90000, '0' ]
    
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});

    // set column for where expression. idVarIdx: "id" = $4
    const idVarIdx = "$" + (values.length + 1);
    
     // create the SQL query for updating the jobs table
    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    
    
    // retrieve the results of the query above with the values in the request body 'values' and 'id' from the request URL passed in
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;

    // {
    //   "job": {
    //     "id": 201,
    //     "title": "Conservator, clothing",
    //     "salary": 90000,
    //     "equity": "0",
    //     "companyHandle": "watson-davis"
    //   }
    // }
  }

   /** Delete given job from database; returns undefined.
    *
    * Throws NotFoundError if job not found.
    **/

  static async remove(id) {
    const result = await db.query(
               `DELETE
                FROM jobs
                WHERE id = $1
                RETURNING id`,
            [id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }   
}


module.exports = Job;