"use strict";

/** Routes for Stripe */

//config() method on dotenv library puts all the variables in .env file and puts them in the process.env variable
require("dotenv").config();
const express = require("express");

const router = new express.Router();
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");

const Order = require("../models/order");

const orderNewSchema = require("../schemas/orderNew.json");

// initializes a stripe client specifically for this account useing the account's secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/** Handles Stripe checkout
 *
 * POST /api/stripe/checkout {items} => stripe session.url
 *
 * Creates a Stripe checkout session url
 *
 * {items} should be [{id:1, quantity:1}, {id:2, quantity:3} ...]
 *
 * Returns session.url
 *
 */

router.post("/checkout", async function (req, res, next) {
  // data in req.body will look like: i.e. { items: [ { id: 'price_1OhYRmDDC8UyWYkq3ktrE7bQ', quantity: 1 }, ... ], userId: {id: 3, email: 'winston@gmail.com', name: null, stripe_customer_id: null}}
  // Stripe wants the data to look like: [{price: price_1OhYRmDDC8UyWYkq3ktrE7bQ, quantity:2}, {price:price_12hYRmDDC8UyWYkq3ktrE7bQ, quantity:2} ...]
  const items = req.body.items;
  const userId = req.body.userId.id;
  console.log("THis is req.body", req.body);
  console.log("THis is req.body.userId.id", req.body.userId.id);

  // lineItems is an array with properly formated data that will be sent over to Stripe
  let lineItems = [];
  // for each item in 'items', add an object with 2 line items in the format that Stripe wants in order to process payments to 'lineItems'
  items.forEach((item) => {
    lineItems.push({
      price: item.id,
      quantity: item.quantity,
    });
  });

  //   create a customer in Stripe

  // 'items' and currentUser 'userId' are found in the req.body with 'items=req.body.items' and 'userId=req.body.userId.id', defined above

  const customer = await stripe.customers.create({
    metadata: {
      cart: JSON.stringify(items),
      userId: userId,
    },
  });

  console.log("THis is customer", customer);

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

  console.log("THis is session", session);
  //   return res.status(201).json({ url: session.url });
  return res.send({ url: session.url });
});

// Create order function

const createOrder = async (customer, data) => {
  console.log("This is customer in routes/stripe/createOrder", customer);

  let customerCart = JSON.parse(customer.metadata.cart);
  console.log("THis is customerCart[0]", customerCart[0]);

  let newOrder = {
    user_id: customer.metadata.userId,
    stripe_customer_id: data.customer,
    payment_intent_id: data.payment_intent,
    product_id: customerCart[0].id,
    product_name: customerCart[0].name,
    product_price: customerCart[0].price,
    product_quantity: customerCart[0].quantity,
    subtotal: data.amount_subtotal,
    total: data.amount_total,
    shipping: data.customer_details,
    payment_status: data.payment_status,
  };

  console.log("THis is newOrder", newOrder);

  try {
    const createdOrder = await Order.createOrder(newOrder);
    console.log("Processed Order:", createdOrder);
    return createdOrder;
  } catch (err) {
    console.log(err);
  }
};

// Stripe webhoook

router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  async (req, res) => {
    // const payload = req.body;
    // const payloadString = JSON.stringify(payload, null, 2);
    // const header = stripe.webhooks.generateTestHeaderString({
    //   payload: payloadString,
    //   secret: JSON.stringify(process.env.STRIPE_WEBHOOK_SECRET_KEY),
    // });

    const payload = req.body;
    const payloadString = JSON.stringify(payload, null, 2);

    let data;
    let eventType;

    // Check if webhook signing is configured.
    let webhookSecret;
    // let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

    // if there is a Stripe webhook secret key, verify that the event that calls this webhook actually comes from Stripe
    if (webhookSecret) {
      let event;

      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          payloadString,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed:  ${err}`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event

    // if the eventType is 'checkout.session.completed', retrieve the customer data (of currentUser) and create an order
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer) //data.customer is the Stripe Customer Id
        .then(async (customer) => {
          console.log("THis is customer", customer);
          // after retrieving data of a customer with Stripe Customer Id, try creating an order with 'customer' (Stripe Customer Id) and 'data' (event.data.object) passed in as props
          try {
            // CREATE ORDER
            createOrder(customer, data); // call the createOrder function defined above
          } catch (err) {
            console.log(typeof createOrder);
            console.log(err.message);
          }
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);

module.exports = router;
