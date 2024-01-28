"use strict";

const db = require("../db");

const { BadRequestError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for products */

class Stripe {
  /** Create a customer (from data), update db, return new customer data.
   *
   * data should be { name, email }
   *
   * Returns {id, object, address, balance, created, currency, description, email, invoice_prefix, default_payment_method, name, next_invoice_sequence, phone, shipping, balance }
   *
   * Throws BadRequestError if customer already in database.
   * */

  static async create({ name, email }) {
    // check to see if customer name already exists before creating it
    const duplicateCheck = await db.query(
      `SELECT name
            FROM payments
            WHERE name = $1`,
      [name]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate customer: ${name}`);

    // add new customer data (from req.body) to database and return new customer data
    const result = await db.query(
      `INSERT INTO payments
            (name, email)
            VALUES ($1, $2)
            RETURNING  "id", "object", "address", "balance", "created", "currency", "description", "email", "invoice_prefix", "default_payment_method", "name",
            "next_invoice_sequence", "phone", "shipping", "balance"`,
      [
        id,
        object,
        address,
        balance,
        created,
        currency,
        description,
        email,
        invoice_prefix,
        default_payment_method,
        name,
        next_invoice_sequence,
        phone,
        shipping,
        balance,
      ]
    );
    const customer = result.rows[0];

    console.log(customer);

    return customer;
  }
}

module.exports = Stripe;
