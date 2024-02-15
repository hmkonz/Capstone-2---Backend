"use strict";

const express = require("express");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");

const stripeCreateNewCustomerSchema = require("../schemas/stripeCreateNewCustomer.json");

const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

/** POST /stripe/customers { customer } =>  { customer }
 *
 * Adds a new customer to Stripe API.
 *
 * customer should be { "email", "name", "description", "phone", "homeAddressLine1", "homeAddressLine2", "homeCity", "homeState", "homePostal_code", "homeCountry", "shippingAddressLine1", "shippingAddressLine2", "shippingCity", "shippingState", "shippingPostal_code", "shippingCountry", "shippingName", "shippingPhone" }
 *
 * Returns {id, object, address, balance, created, currency, default_source, delinquent, description, discount, email, invoice_prefix, invoice_settings, livemode, metadata, name, next_invoice_sequence, phone, preferred_locals, shipping, tax_exempt, test_clock }
 *
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(
      req.body,
      stripeCreateNewCustomerSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }

    // create a new customer with the data in the request body
    const customer = await stripe.customers.create({
      email: req.body.email,
      name: req.body.name,
      description: req.body.description,
      phone: req.body.phone,
      address: {
        line1: req.body.homeAddressLine1,
        line2: req.body.homeAddressLine2,
        city: req.body.homeCity,
        state: req.body.homeState,
        postal_code: req.body.homePostal_code,
        country: req.body.homeCountry,
      },
      shipping: {
        address: {
          line1: req.body.shippingAddressLine1,
          line2: req.body.shippingAddressLine2,
          city: req.body.shippingCity,
          state: req.body.shippingState,
          postal_code: req.body.shippingPostal_code,
          country: req.body.shippingCountry,
        },
        name: req.body.shippingName,
        phone: req.body.shippingPhone,
      },
    });

    console.log("THis is customer in backend/routes/stripeCustomers", customer);
    return res.status(201).json({ customer });
  } catch (err) {
    return next(err);
  }
});

/** GET /stripe/customers => { customers: [ {id, object, address, balance, created, currency, description, email, invoice_prefix, default_payment_method, name, next_invoice_sequence, phone, shipping, balance }, { ...}, {...}, ... ] }
 *
 * Returns list of all customers
 *
 **/

router.get("/", async function (req, res, next) {
  try {
    // retrieve the data of all customers
    const customers = await stripe.customers.list();
    return res.json({ customers });
  } catch (err) {
    return next(err);
  }
});

/** GET /stripe/customers/[id] => { customer}
 *
 * Retrieve the data of a specific customer
 *
 * Returns  {id, object, address, balance, created, currency, description, email, invoice_prefix, default_payment_method, name, next_invoice_sequence, phone, shipping, balance }
 *
 **/

router.get("/:id", async function (req, res, next) {
  try {
    // retrieve the data of a specific customer with their id sent in the request URL
    const customer = await stripe.customers.retrieve(req.params.id);
    return res.json({ customer });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /api/customers/[id] { customer }=> { customer }
 *
 * Updates a specific customer's info
 *
 * Data can include:
 *   { name, email, address, phone, shipping }
 *
 * Returns {id, object, address, balance, created, currency, description, email, invoice_prefix, default_payment_method, name, next_invoice_sequence, phone, shipping, balance }
 *
 **/

router.patch("/:id", async function (req, res, next) {
  try {
    // update the specific customer with the id sent in the request URL with what's in the request body
    const customer = await stripe.customers.update(req.params.id, {
      email: req.body.email,
      name: req.body.name,
      description: req.body.description,
      phone: req.body.phone,
      address: {
        line1: req.body.homeAddressLine1,
        line2: req.body.homeAddressLine2,
        city: req.body.homeCity,
        state: req.body.homeState,
        postal_code: req.body.homePostal_code,
        country: req.body.homeCountry,
      },
      shipping: {
        address: {
          line1: req.body.shippingAddressLine1,
          line2: req.body.shippingAddressLine2,
          city: req.body.shippingCity,
          state: req.body.shippingState,
          postal_code: req.body.shippingPostal_code,
          country: req.body.shippingCountry,
        },
        name: req.body.shippingName,
        phone: req.body.shippingPhone,
      },
    });
    return res.json(customer);
  } catch (err) {
    return next(err);
  }
});

/** DELETE /customers/:id]  =>
 *
 * Returns i.e. {"id": "cus_NffrFeUfNV2Hib", "object": "customer", "deleted": true}
 *
 **/

router.delete("/:id", async function (req, res, next) {
  try {
    const deleted = await stripe.customers.del(req.params.id);
    return res.json(deleted);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
