"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for carts */

class Cart {
  /** Adds a row to cart table with item data
   *
   * data should be { product_name, product_price, user_id, product_id }
   *
   * Returns { id, product_name, product_price, user_id, product_id }
   *
   * */

  static async addItemToCart({
    product_name,
    product_price,
    user_id,
    product_id,
  }) {
    // add a new row of cart data to database and return all user carts
    await db.query(
      `INSERT INTO carts
            (product_name, product_price, user_id, product_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, product_name, product_price, user_id, product_id`,
      [product_name, product_price, user_id, product_id]
    );

    const result = await db.query(
      `SELECT     product_name,
                  product_price,
                  user_id,
                  product_id
           FROM carts
           WHERE user_id = $1`,
      [user_id]
    );

    // set 'userCart' equal to the result of the query
    const userCarts = result.rows;
    console.log("THis is userCarts in models/cart", userCarts);

    // if there are no results from the query (userCarts is an empty array), return an empty array
    if (!userCarts.length) return [];

    return userCarts;

    // return getUserCarts(user_id);
  }

  /** List all carts
   *
   * Returns [{ id, product_name, product_price, user_id, product_id }, ...]}
   *
   * Throws NotFoundError if not found.
   *
   **/

  static async listCarts() {
    const result = await db.query(
      `SELECT     product_name,
                  product_price,
                  user_id,
                  product_id
           FROM carts`
    );

    // set 'allCarts' equal to the result of the query
    const allCarts = result.rows;
    console.log("THis is all Carts in models/cart", allCarts);

    // if there are no results from the query (userCart is an empty array), throw an error
    if (!allCarts.length) return [];

    return allCarts;
  }

  /** Given a users 'user_id', return all cart items
   *
   * Returns [{ id, product_name, product_quantity, product_price, user_id, product_id }, ...]}
   *
   * Returns an empty array there are no cart items
   *
   **/

  static async getUserCarts(user_id) {
    // retrieve all the cart data for the user with 'user_id' found in request URL
    const result = await db.query(
      `SELECT     product_name,
                  product_price,
                  user_id,
                  product_id
           FROM carts
           WHERE user_id = $1`,
      [user_id]
    );

    // set 'userCart' equal to the result of the query
    const userCarts = result.rows;
    console.log("THis is userCarts in models/cart", userCarts);

    // if there are no results from the query (userCarts is an empty array), return an empty array
    if (!userCarts.length) return [];
    console.log("THis is userCarts in models/carts", userCarts);

    return userCarts;
  }

  /** Update cart with 'data'.
   *
   * This is a "partial update" --- it's fine if 'data' doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { id, product_name, product_quantity, product_price, user_id, product_id}
   *
   * Returns { id, product_name, product_quantity, product_price, user_id, product_id }
   *
   * Throws NotFoundError if not found.
   *
   */

  static async updateCart(user_id, data) {
    // setCols equals "product_name"=$1, "product_quantity"=$2, "product_price"=$3, "user_id"=$4, "product_id"=$5

    // values = data in request body i.e. [ 'Beef & Salmon', '2', '98.49', '3', '1' ]
    const { setCols, values } = sqlForPartialUpdate(data, {
      product_name: "product_name",
      product_quantity: "product_quantity",
      product_price: "product_price",
      product_id: "product_id",
    });

    // set column for WHERE expression. cartIdVarIdx: "id" = $6
    const cartIdVarIdx = "$" + (values.length + 1);

    // create the SQL query for updating the carts table
    const querySql = `UPDATE carts 
                      SET ${setCols} 
                      WHERE id = ${cartIdVarIdx} 
                      RETURNING id,
                                product_name,
                                product_quantity,
                                product_price,
                                user_id,
                                product_id`;

    // retrieve the results of the query above with the values in the request body 'values' and 'id' from the request URL passed in
    const result = await db.query(querySql, [...values, id]);
    const cart = result.rows[0];

    if (!cart) throw new NotFoundError(`No cart with user id: ${user_id}`);

    return cart;
  }

  /** Delete the carts of a user with user_id' from database; returns the carts removed */

  static async removeUserCarts(user_id) {
    let result = await db.query(
      `DELETE
           FROM carts
           WHERE user_id = $1
           RETURNING id,
                     product_name,
                     product_price,
                     user_id,
                     product_id`,
      [user_id]
    );
    const carts = result.rows;

    if (!carts) throw new NotFoundError(`No carts of user with id: ${user_id}`);
    console.log("THis is carts in models/cart/removeUserCarts", carts);

    return carts;
  }
}

module.exports = Cart;
