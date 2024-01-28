"use strict";

/** Express app for Capstone 2 - just real food */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const {
  authenticateUserJWT,
  authenticateAdminJWT,
} = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/orders");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admins");
const productsRoutes = require("./routes/products");
const cartsRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const stripeCustomers = require("./routes/stripeCustomers");
const stripeCardToken = require("./routes/stripeCardToken");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
// authenticateJWT runs before every request (route)
app.use(authenticateUserJWT);
// app.use(authenticateAdminJWT);

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/cart", cartsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/stripe/customers", stripeCustomers);
app.use("/stripe/cardToken", stripeCardToken);

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
