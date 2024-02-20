"use strict";

// allows access to the process.env variables
require("dotenv").config();

/** Express app for Capstone 2 - Just Real Food */
const express = require("express");
// cors allows a front end client to make requests to a backend server
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateUserJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const stripeRoutes = require("./routes/stripe");
// morgan is used to log requests and errors to the console
const morgan = require("morgan");

const app = express();

app.use(cors());

// Set middleware of CORS
// app.use((req, res, next) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://capstone-2-frontend-tqq5.onrender.com"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   res.setHeader("Access-Control-Allow-Private-Network", true);
//   res.setHeader("Access-Control-Max-Age", 7200);

//   next();
// });

app.use(express.json());
// preferred by Stripe
app.use(express.static("public"));
app.use(express.static("src"));
app.use(morgan("tiny"));
// authenticateJWT runs before every request (route)
app.use(authenticateUserJWT);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
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
