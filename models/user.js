"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
// const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password
   *
   * Returns { email, name }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticateUser(email, password) {
    // try to find the user first by seaching for their email
    const result = await db.query(
      `SELECT email,
              name,
              password
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

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
    // make sure user with 'email' entered in form is not already in the database
    const duplicateCheck = await db.query(
      `SELECT email
           FROM users
           WHERE email = $1`,
      [email]
    );

    // if email is already in the database, throw an error
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    // hash the password sent in register form
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // create a new user by inserting the data entered in Register Form into the users table
    const result = await db.query(
      `INSERT INTO users 
           (email,
            password)
      VALUES ($1, $2)
      RETURNING email`,
      [email, hashedPassword]
    );
    const user = result.rows[0];

    return user;
  }

  /** Find all users
   *
   * Returns [{ email, name}, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT   id,
                email,
                name,
           FROM users
           ORDER BY email`
    );

    return result.rows;
  }

  /** Given a user email, return data about user
   *
   * Returns { email, name }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(email) {
    // retrieve the data of user with 'email' sent in the request URL
    const userRes = await db.query(
      `SELECT id,
              email,
              name
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user with email: ${email}`);

    return user;
  }
}

module.exports = User;
