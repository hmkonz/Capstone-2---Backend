"use strict";

/** Routes for orders */

const express = require("express");
// const { BadRequestError } = require("../expressError");
const Order = require("../models/order");

const router = new express.Router();

/**
 *  GET /api/account/orders  =>
 *   { orders: [{ id, date, productName, quantity, price, subtotal, paymentMethod,
 *                userId }, ...]}
 *
 *  Retrieves all orders
 *
 * Authorization required: user or admin must be logged in
 */

router.get("/orders", async function (req, res, next) {
  try {
    // retrieve the data of orders
    const orders = await Order.getUserOrders();
    console.log("THis is orders in backend/routes/orders", orders);
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
