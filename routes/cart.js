"use strict";

/** Routes for carts */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const Cart = require("../models/cart");

const cartNewSchema = require("../schemas/cartNew.json");

const router = new express.Router();

/** POST /api/cart =>
 *     {cart: {id, product_name, product_quantity, product_price, user_id, product_id}
 *
 *  Adds a cart
 *
 *  Authorization required: user or admin must be logged in
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, cartNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }

    // create a new cart row with the data passed in and return an array with all the carts in the table
    const cart = await Cart.addItemToCart(req.body);
    console.log("THis is cart in backend/routes/cart", cart);
    return res.status(201).json({ cart });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/cart =>
 *   { cart: [{ id, product_name, product_quantity, product_price, user_id, product_id }, ...]}
 *
 *  Retrieves all carts
 *
 * Authorization required: user or admin must be logged in
 */

router.get("/", async function (req, res, next) {
  try {
    // retrieve the data of the cart of a specific user
    const carts = await Cart.listCarts();
    console.log("THis is carts in backend/routes/carts/GET request", carts);
    return res.json({ carts });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/cart/[user_id] =>
 *   { cart: [{ id, product_name, product_quantity, product_price, user_id, product_id }, ...]}
 *
 *  Retrieves all carts for a user with 'userId'
 *
 * Authorization required: user or admin must be logged in
 */

router.get("/:user_id", async function (req, res, next) {
  try {
    // retrieve the data of the cart of a specific user
    const cart = await Cart.getUserCarts(req.params.user_id);
    console.log(
      "THis is req.params.user_id in backend/routes/carts/router.GET",
      req.params.user_id
    );
    console.log("THis is carts in backend/routes/carts/GET request", cart);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /api/cart/[user_id]  =>  { deleted: ... }
 *
 * Authorization: login and logged in user must be an Admin (middleware function ensureAdmin checks for this)
 */

router.delete("/:user_id", async function (req, res, next) {
  try {
    let removedCarts = await Cart.removeUserCarts(req.params.user_id);
    console.log("THis is removedCarts from backend/routes/cart", removedCarts);
    // Since all params are strings, unary operator (+) converts req.params.id to a number
    return res.json({ deleted: removedCarts });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
