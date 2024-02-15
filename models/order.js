"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for accounts */

class Order {
  /** create an order (from data), add it to the db and return new order data.
   *
   * data should be { user_id, stripe_customer_id, payment_intent_id, product_id, product_name, product_price, product_quantity, subtotal, total,  shipping, delivery_status, payment_status, timestamp}
   *
   * Returns { id, user_id, stripe_customer_id, payment_intent_id, product_id, product_name, product_price, product_quantity, subtotal, total,  shipping, delivery_status, payment_status, timestamp}
   *
   * Throws BadRequestError if order is already in database.
   * */

  static async createOrder({
    user_id,
    stripe_customer_id,
    payment_intent_id,
    product_id,
    product_name,
    product_price,
    product_quantity,
    subtotal,
    total,
    shipping,
    delivery_status,
    payment_status,
    timestamp,
  }) {
    // check to see if order id already exists before creating it
    // const duplicateCheck = await db.query(
    //   `SELECT id
    //         FROM orders
    //         WHERE id = $1`,
    //   [id]
    // );

    // if (duplicateCheck.rows[0])
    //   throw new BadRequestError(`Duplicate order with id: ${id}`);

    // add new order data (from req.body) to database and return new order data
    const result = await db.query(
      `INSERT INTO orders
            (user_id, stripe_customer_id, payment_intent_id, product_id, 
              product_name, product_price, product_quantity, subtotal, total, shipping, delivery_status, payment_status, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, user_id, stripe_customer_id, payment_intent_id, product_id, 
            product_name, product_price, product_quantity, subtotal, total, shipping, delivery_status, payment_status, timestamp`,
      [
        user_id,
        stripe_customer_id,
        payment_intent_id,
        product_id,
        product_name,
        product_price,
        product_quantity,
        subtotal,
        total,
        shipping,
        delivery_status,
        payment_status,
        timestamp,
      ]
    );
    const order = result.rows[0];

    return order;
  }

  /** Given a users 'user_id', return their order
   *
   * Returns [{ id, user_id, stripe_customer_id, payment_intent_id, product_id, product_name, product_price, product_quantity, subtotal, total, shipping, delivery_status, payment_status, timestamp }, ...]
   *
   **/

  static async getUserOrders(user_id) {
    const result = await db.query(
      `SELECT     id,
                  user_id,
                  stripe_customer_id,
                  payment_intent_id,
                  product_id, 
                  product_name, 
                  product_price, 
                  product_quantity,
                  subtotal,
                  total,
                  shipping,
                  delivery_status,
                  payment_status,
                  timestamp  
           FROM orders
           WHERE user_id = $1`,
      [user_id]
    );

    // set 'orders' equal to the result of the query
    const orders = result.rows;
    console.log("THis is result in models/order", result);

    // if there are no results from the query (orders is an empty array), throw an error
    if (!orders.length) throw new NotFoundError(`No orders have been made yet`);

    return orders;
  }
}

module.exports = Order;
