"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for carts */

class Cart {
  /** Create a cart, update db, return new cart data.
   *
   * data should be { cartId, productName, productQuantity, productPrice, userId, productId }
   *
   * Returns { cartId, productName, productQuantity, productPrice, userId, productId }
   *
   * Throws BadRequestError if cart is already in database.
   * */

  static async createCart({
    cartId,
    productName,
    productQuantity,
    productPrice,
    userId,
    productId,
  }) {
    // check to see if cart id already exists before creating it
    const duplicateCheck = await db.query(
      `SELECT id
            FROM carts
            WHERE id = $1`,
      [cartId]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate cart with id: ${idd}`);

    // add new cart data to database and return new cart data
    const result = await db.query(
      `INSERT INTO carts
            (id, product_name, product_quantity, product_price , user_id, product_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id AS cartId, product_name AS productName, product_quantity AS productQuantity, product_price AS productPrice, user_id AS userId, product_id AS productId`,
      [cartId, productName, productQuantity, productPrice, userId, productId]
    );
    const cart = result.rows[0];

    return cart;
  }

  /** Get all carts
   *
   * Returns [{ cartId, productName, productQuantity, productPrice, userId, productId }, ...]}
   **/

  static async getAllCarts() {
    const result = await db.query(
      `SELECT     id AS cartId,
                  product_name AS productName,
                  product_quantity AS productQuantity,
                  product_price AS productPrice,
                  user_id AS userId,
                  product_id AS productId
           FROM carts`,

      []
    );

    // set 'carts' equal to the result of the query
    const cart = result.rows;

    // if there are no results from the query (carts is an empty array), throw an error
    if (!cart.length)
      throw new NotFoundError(`There are no carts in this user's account`);

    return cart;
  }

  /** Update cart with 'data'.
   *
   * This is a "partial update" --- it's fine if 'data' doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { cartId, productName, productQuantity, productPrice, userId, productId}
   *
   * Returns { cartId, productName, productQuantity, productPrice, userId, productId }
   *
   * Throws NotFoundError if not found.
   *
   */

  static async updateCart(cartId, data) {
    // setCols equals "productName"=$1, "productQuantity"=$2, "productPrice"=$3, "userId"=$4, "productId"=$5

    // values = data in request body i.e. [ 'Beef & Salmon - Dog Food', '2', '98.49', '3', '1' ]
    const { setCols, values } = sqlForPartialUpdate(data, {
      productName: product_name,
      productQuantity: product_quantity,
      productPrice: product_price,
      userId: user_id,
      productId: product_id,
    });

    // set column for WHERE expression. cartIdVarIdx: "cartId" = $6
    const cartIdVarIdx = "$" + (values.length + 1);

    // create the SQL query for updating the carts table
    const querySql = `UPDATE carts 
                      SET ${setCols} 
                      WHERE id = ${cartIdVarIdx} 
                      RETURNING id AS "cartId",
                                product_name AS "productName",
                                product_quantity AS "productQuantity",
                                product_price AS "productPrice",
                                user_id AS "userId",
                                product_id AS "productId"`;

    // retrieve the results of the query above with the values in the request body 'values' and 'cartId' from the request URL passed in
    const result = await db.query(querySql, [...values, cartId]);
    const cart = result.rows[0];

    if (!cart) throw new NotFoundError(`No cart with id: ${cartId}`);

    return cart;
  }

  /** Delete given cart with 'cartId' from database; returns undefined. */

  static async remove(cartId) {
    let result = await db.query(
      `DELETE
           FROM carts
           WHERE cartId = $1
           RETURNING cartId`,
      [cartId]
    );
    const cart = result.rows[0];

    if (!cart) throw new NotFoundError(`No cart with id: ${cartId}`);
  }
}

module.exports = Cart;
