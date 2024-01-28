"use strict";

/** Routes for payments */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");

const stripeCreateCardTokenSchema = require("../schemas/stripeCreateCardToken.json");

const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

/** POST /stripe/cardToken { card } =>  { token }
 *
 * Creates a credit card token 
 *
 * card should be { "card": {"number", "exp_month", "exp_year", "cvc"}
 *
 * Returns i.e. {"id": "tok_1N3T00LkdIwHu7ixt44h1F8k", "object": "token",
                 "card": {  "id": "card_1N3T00LkdIwHu7ixRdxpVI1Q",
                            "object": "card",
                            "address_city": null,
                            "address_country": null,
                            "address_line1": null,
                            "address_line1_check": null,
                            "address_line2": null,
                            "address_state": null,
                            "address_zip": null,
                            "address_zip_check": null,
                            "brand": "Visa",
                            "country": "US",
                            "cvc_check": "unchecked",
                            "dynamic_last4": null,
                            "exp_month": 5,
                            "exp_year": 2024,
                            "fingerprint": "mToisGZ01V71BCos",
                            "funding": "credit",
                            "last4": "4242",
                            "metadata": {},
                            "name": null,
                            "tokenization_method": null,
                            "wallet": null
                        },
                "client_ip": "52.35.78.6",
                "created": 1683071568,
                "livemode": false,
                "type": "card",
                "used": false
                }
 *
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(
      req.body,
      stripeCreateCardTokenSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }

    // create a credit card token with the data in the request body
    const token = await stripe.tokens.create({
      card: {
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
        name: req.body.name,
        address_line1: req.body.addressLine1,
        address_line2: req.body.addressLine2,
        address_city: req.body.addressCity,
        address_state: req.body.addressState,
        address_zip: req.body.addressZip,
        address_country: req.body.addressCountry,
      },
    });
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
