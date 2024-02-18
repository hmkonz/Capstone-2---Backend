"use strict";

/** Routes for Stripe */

//config() method on dotenv library puts all the variables in .env file and puts them in the process.env variable
require("dotenv").config();
const express = require("express");
const router = new express.Router();

// initializes a stripe client specifically for this account using the account's secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/** Handles Stripe checkout
 *
 * POST /api/stripe/checkout {items} => stripe session.url
 *
 * Creates a Stripe checkout session url
 *
 * {items} should be [{id:1, name: 'Beef & Salmon', price: 98.49, quantity:1}, {id:4, name: 'Bison', price: 98.49, quantity:2} ...]
 *
 * Returns session.url
 *
 */

router.post("/checkout", async function (req, res, next) {
  // data in req.body will look like: i.e. { items: [ { id: 'price_1OhYRmDDC8UyWYkq3ktrE7bQ', name: 'Beef & Salmon', price: 98.49, quantity: 1 }, ... ], userId: {id: 3, email: 'winston@gmail.com', name: null}}

  // Stripe wants the data to look like: [{price: price_1OhYRmDDC8UyWYkq3ktrE7bQ, quantity:2}, {price: price_12hYRmDDC8UyWYkq3ktrE7bQ, quantity:2} ...]
  const items = req.body.items;
  const userId = req.body.userId.id;

  // lineItems is an array with properly formated data that will be sent over to Stripe
  let lineItems = [];
  // for each item in 'items', add an object with 2 key/value pairs in the format that Stripe wants in order to process payments to 'lineItems'
  items.forEach((item) => {
    lineItems.push({
      price: item.id,
      quantity: item.quantity,
    });
  });

  //  create a customer in Stripe

  // 'items' and currentUser 'userId' are found in the req.body with 'items=req.body.items' and 'userId=req.body.userId.id', defined above

  const customer = await stripe.customers.create({
    metadata: {
      // items must be a string
      cart: JSON.stringify(items),
      userId: userId,
    },
  });

  // Stripe creates a 'payment' session using the properly formated 'lineItems' array
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "usd",
          },
          display_name: "Free shipping",
          // Delivers between 5-7 business days
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 1500,
            currency: "usd",
          },
          display_name: "Next day air",
          // Delivers in exactly 1 business day
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 1,
            },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    line_items: lineItems,
    mode: "payment",
    customer: customer.id,
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  return res.send({ url: session.url });
});

module.exports = router;
