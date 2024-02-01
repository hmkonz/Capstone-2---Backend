"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  //   NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for admins */

class Admin {
  /** authenticate admin with {email, password}
   *
   * Returns { email }
   *
   * Throws UnauthorizedError is admin not found or wrong password.
   **/

  static async authenticateAdmin(email, password) {
    // try to find the admin first by seaching for their email
    const result = await db.query(
      `SELECT email,
              password
           FROM admins
           WHERE email = $1`,
      [email]
    );

    const admin = result.rows[0];
    console.log("THis is admin in models/Admin", admin);
    console.log("This is admin.password in models/Admin", admin.password);
    if (admin) {
      // if admin and their password are both in the database, compare hashed password in db to a new hash from password entered in req.body
      const isValid = await bcrypt.compare(password, admin.password);
      if (isValid === true) {
        // for security, delete the logged in admin's password
        delete admin.password;
        console.log("THis is admin in models/Admin if statement", admin);

        return admin;
      }
      // else if admin is in the database and they don't have a password saved but they sent one in req.body (entered in AdminSigninForm), assign password to the hashed value
      // else if (admin && !admin.password) {
      //   if (password) {
      //     password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      //   }
      //   // setCols equals "password"=$1
      //   // values = password in request body i.e. ['qwerty1234']
      //   const { setCols, values } = sqlForPartialUpdate(data, {
      //     password: "password",
      //   });

      // set column for WHERE expression. emailVarIdx: "email" = $2
      //   const emailVarIdx = "$" + (values.length + 1);

      //   // create the SQL query for updating the users table
      //   const querySql = `UPDATE admins
      //                         SET ${setCols}
      //                         WHERE email = ${emailVarIdx}
      //                         RETURNING email,
      //                                   password
      //                         `;

      //   // retrieve the results of the query above with the values in the request body 'values' and 'email' from the request URL passed in
      //   const result = await db.query(querySql, [...values, email]);
      //   const admin = result.rows[0];
      //   console.log("THis is admin in models/Admin else if statement", admin);
      //   if (!admin) throw new NotFoundError(`No admin with email: ${email}`);

      //   delete admin.password;
      //   return admin;
      // }

      // Throws UnauthorizedError if admin not found or wrong password
      throw new UnauthorizedError("Invalid email/password");
    }
  }

  /** Register admin with data sent in request.body.
   *
   *  data = {email, password}
   *
   * Returns { email }
   *
   * Throws BadRequestError on duplicates.
   **/

  // static async register({ email, password }) {
  //   // make sure email sent in register form (req.body) is not already in the database
  //   const duplicateCheck = await db.query(
  //     `SELECT email
  //      FROM admins
  //      WHERE email = $1`,
  //     [email]
  //   );

  //   if (duplicateCheck.rows[0]) {
  //     throw new BadRequestError(`Duplicate email: ${email}`);
  //   }

  //   // hash the password sent in register form (request.body)
  //   const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

  //   // create a new admin by inserting the data from the form (req.body) into the admins table
  //   const result = await db.query(
  //     `INSERT INTO admins
  //          (email,
  //           password
  //           )
  //     VALUES ($1, $2)
  //     RETURNING email`,
  //     [email, hashedPassword]
  //   );

  //   const admin = result.rows[0];

  //   return admin;
  // }

  /** Find all admins
   *
   * Returns [{ email }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT email,
       FROM admins
       ORDER BY email`
    );

    return result.rows;
  }

  /** Given an email, return data about admin
   *
   * Returns { email}
   *
   * Throws NotFoundError if admin not found.
   **/

  static async get(email) {
    // retrieve the admin data with 'email' sent in the request URL
    const adminRes = await db.query(
      `SELECT email
           FROM admins
           WHERE email = $1`,
      [email]
    );

    const admin = adminRes.rows[0];

    if (!admin) throw new NotFoundError(`No admin with email: ${email}`);

    return admin;
  }

  /** Update admin data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { email, password}
   *
   * Returns { email }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or serious security risks are opened.
   */

  static async update(email, data) {
    // if password is sent in req.body, reset the password by hashing it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    // setCols equals "password"=$1
    // values = data in request body i.e. ['qwerty1234']
    const { setCols, values } = sqlForPartialUpdate(data, {
      password: "password",
    });

    // set column for WHERE expression. emailVarIdx: "email" = $2
    const emailVarIdx = "$" + (values.length + 1);

    // create the SQL query for updating the users table
    const querySql = `UPDATE admins 
                      SET ${setCols} 
                      WHERE email = ${emailVarIdx} 
                      RETURNING email,
                                password
                      `;

    // retrieve the results of the query above with the values in the request body 'values' and 'email' from the request URL passed in
    const result = await db.query(querySql, [...values, email]);
    const admin = result.rows[0];

    if (!admin) throw new NotFoundError(`No admin with email: ${email}`);

    delete admin.password;
    return admin;
  }

  /** Delete given admin from database; returns undefined. */

  static async remove(email) {
    let result = await db.query(
      `DELETE
           FROM admins
           WHERE email = $1
           RETURNING email`,
      [email]
    );
    const admin = result.rows[0];

    if (!admin) throw new NotFoundError(`No admin with email: ${email}`);
  }
}

module.exports = Admin;
