"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for accounts */

class Order {
  /** Create an order (from data), update db, return new order data.
   *
   * data should be { id, date, product_name, quantity, price, subtotal, payment_method, user_id }
   *
   * Returns { id, date, product_name, quantity, price, subtotal, payment_method, user_id  }
   *
   * Throws BadRequestError if order is already in database.
   * */

  static async createOrder({
    id,
    date,
    product_name,
    quantity,
    price,
    subtotal,
    payment_method,
    user_id,
  }) {
    // check to see if order id already exists before creating it
    const duplicateCheck = await db.query(
      `SELECT id
            FROM orders
            WHERE id = $1`,
      [id]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate order with id: ${id}`);

    // add new order data (from req.body) to database and return new product data
    const result = await db.query(
      `INSERT INTO orders
            (id, date, product_name, quantity, price, subtotal, payment_method, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, date, product_name, quantity, price, subtotal, payment_method, user_id`,
      [
        id,
        date,
        product_name,
        quantity,
        price,
        subtotal,
        payment_method,
        user_id,
      ]
    );
    const order = result.rows[0];

    return order;
  }

  /** Given a users 'userId', return their order
   *
   * Returns [{ id, date, product_name, quantity, price, subtotal, payment_method, *user_id }, ...]
   *
   **/

  static async getUserOrders(user_id) {
    const result = await db.query(
      `SELECT     id,
                  to_char(date, 'FMMonth DD, YYYY') AS date,
                  product_name,
                  quantity,
                  price,
                  subtotal,
                  payment_method,
                  user_id 
           FROM orders
           WHERE user_id = $1`,
      [user_id]
    );

    // set 'orders' equal to the result of the query
    const orders = result.rows;
    console.log("THis is orders in models/order", orders);

    // if there are no results from the query (orders is an empty array), throw an error
    if (!orders.length) throw new NotFoundError(`No orders have been made yet`);

    return orders;
  }
}

module.exports = Order;
