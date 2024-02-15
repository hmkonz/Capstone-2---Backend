"use strict";

// allows access to the process.env variables
require("dotenv").config();

/** Express app for Capstone 2 - just real food */
const express = require("express");
const cors = require("cors");
// // initializes a stripe client specifically for this account useing the account's secret key
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { NotFoundError } = require("./expressError");

const {
  authenticateUserJWT,
  authenticateAdminJWT,
} = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admins");
const productsRoutes = require("./routes/products");
const cartsRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const stripeRoutes = require("./routes/stripe");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
// preferred by Stripe
app.use(express.static("public"));
app.use(morgan("tiny"));
// authenticateJWT runs before every request (route)
app.use(authenticateUserJWT);
// app.use(authenticateAdminJWT);

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stripe", stripeRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
