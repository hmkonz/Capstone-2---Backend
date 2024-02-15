"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password.
   *
   * Returns { email, name, password, stripe_customer_id}
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticateUser(email, password) {
    // try to find the user first by seaching for their email
    const result = await db.query(
      `SELECT email,
              name,
              password,
              stripe_customer_id
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    console.log("This is user in models/user", user);

    if (user) {
      // if user is in the database, compare hashed password in db to a new hash from password entered in req.body
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        // for security, delete the logged in user's password
        delete user.password;
        return user;
      }
    }

    // Throws UnauthorizedError if user not found or wrong password
    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with email, password entered in register form
   *
   * Returns { email }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ email, password }) {
    // make sure email entered in form is not already in the database
    const duplicateCheck = await db.query(
      `SELECT email
           FROM users
           WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    // hash the password sent in register form
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // create a new user by inserting the data entered in register form into the users table
    const result = await db.query(
      `INSERT INTO users 
           (email,
            password)
      VALUES ($1, $2)
      RETURNING email`,
      [email, hashedPassword]
    );

    const user = result.rows[0];
    console.log("THis is user in models/user", user);

    return user;
  }

  /** Find all users
   *
   * Returns [{ email, name, password, stripe_customer_id}, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT   id,
                email,
                name,
                stripe_customer_id
           FROM users
           ORDER BY email`
    );

    return result.rows;
  }

  /** Given a user email, return data about user
   *
   * Returns { email, name, password, stripe_customer_id}
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(email) {
    // retrieve the data of user with 'email' sent in the request URL
    const userRes = await db.query(
      `SELECT id,
              email,
              name,
              stripe_customer_id
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user with email: ${email}`);

    return user;
  }

  /** Update user with 'email' with `data`.
   *
   * This is a "partial update" --- it's fine if 'data' doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { email, name, password, stripe_customer_id}
   *
   * Returns { id, email, name, password, stripe_customer_id}
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

    // setCols equals "id"=$1, "name"=$2, "password"=$3, "stripeCustomerId"=$4

    // values = data in request body i.e. [ '1', 'blossomkonz@gmail.com', 'Blossom', 'Konz', '1000 Main Street Boston, MA 02215', 'Blossom', 'Konz', '1000 Main Street Boston, MA 02215', '515-555-1000', 'qwerty', 'zxcvbn123456' ]
    const { setCols, values } = sqlForPartialUpdate(data, {
      id: id,
      name: "name",
      password: "password",
      stripe_customer_id: "stripe_customer_id",
    });

    // set column for WHERE expression. emailVarIdx: "id" = $5
    const emailVarIdx = "$" + (values.length + 1);

    // create the SQL query for updating the users table
    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE email = ${emailVarIdx} 
                      RETURNING id,
                                name",
                                stripe_customer_id`;

    // retrieve the results of the query above with the values in the request body 'values' and 'email' from the request URL passed in
    const result = await db.query(querySql, [...values, email]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user with email: ${email}`);

    delete user.password;
    return user;
  }

  /** Delete given user with 'email' from database; returns undefined. */

  static async remove(email) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE email = $1
           RETURNING email`,
      [email]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user with email: ${email}`);
  }
}

module.exports = User;
