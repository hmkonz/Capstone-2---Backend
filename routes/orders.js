"use strict";

/** Routes for orders */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const Order = require("../models/order");

const orderNewSchema = require("../schemas/orderNew.json");

const router = new express.Router();

//CREATE ORDER

// createOrder is fired by stripe webhook

router.post("/", async (req, res) => {
  try {
    const validator = jsonschema.validate(req.body, orderNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }

    // create a new order
    const order = await Order.createOrder();
    return res.status(201).json({ order });
  } catch (err) {
    return next(err);
  }
});

/**
 *  GET /api/orders/:user_id  =>
 *   { orders: [{ id, date, productName, quantity, price, subtotal, paymentMethod,
 *                userId }, ...]}
 *
 *  Retrieves all orders of user with 'id'
 *
 */

router.get("/:user_id", async (req, res, next) => {
  try {
    // retrieve the orders of a specific user
    const orders = await Order.getUserOrders(req.params.id);
    console.log("THis is orders in backend/routes/orders", orders);
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
