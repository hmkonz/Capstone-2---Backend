"use strict";

/** Routes for carts */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const Cart = require("../models/cart");

const cartNewSchema = require("../schemas/cartNew.json");

const router = new express.Router();

/** POST /api/cart =>
 *     {cart: {cartId, productId, productQuantity, productPrice, userId}
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

    // create a new cart with the data passed in
    const cart = await Cart.createCart(req.body);
    console.log("THis is cart in backend/routes/cart", cart);
    return res.status(201).json({ cart });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/cart  =>
 *   { cart: [{ cartId, productName, productQuantity, productPrice, userId, productId }, ...]}
 *
 *  Retrieves all carts
 *
 * Authorization required: user or admin must be logged in
 */

router.get("/", async function (req, res, next) {
  try {
    // retrieve the data of the cart of a specific user
    const cart = await Cart.getAllCarts();
    console.log("THis is cart in backend/routes/carts", cart);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
