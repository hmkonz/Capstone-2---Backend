"use strict";

/** Routes for products */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Product = require("../models/product");

const productNewSchema = require("../schemas/productNew.json");
const productUpdateSchema = require("../schemas/productUpdate.json");
const productSearchSchema = require("../schemas/productSearch.json");

const router = new express.Router();

/** POST /api/products { product } =>  { product }
 *
 * Adds a new product. This is only for admins to add a new product
 *
 * product should be { name, ingredients, calorieCount, category, price, weight, imageUrl }
 *
 * Returns { name, ingredients, calorieCount, category, price, weight, imageUrl }
 *
 * Authorization required: only logged in admins can add new products (ensureAdmin middleware checks for that)
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, productNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }

    // create a new product with the data in the requst body
    const product = await Product.create(req.body);
    return res.status(201).json({ product });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/products  =>
 *   { products: [ { name, ingredients, calorieCount, category, price, weight, imageUrll }, ...] }
 *
 *  Find all products
 *
 * Returns [{ name, ingredients, calorieCount, category, price, weight, imageUrl }, ...]
 *
 * Authorization required: None
 * */

// optionally pass in query string key/value pairs from request URL:
// example: GET /api/products/?name=Bison&category=DogFood

router.get("/", async function (req, res, next) {
  // example: GET /api/products/?name=Bison&category=DogFood
  // grab the key/value pairs from the query string
  // i.e. q={ name: 'Bison', category: 'DogFood' ] }
  const q = req.query;

  try {
    // validate 'q' against productSearchSchema to see if they match
    const validator = jsonschema.validate(q, productSearchSchema);
    //   if they don't match, throw errors
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    // if they do match, pass in 'q' object with 'name' and 'category' as keys to filter out the products that match that query
    const products = await Product.findAll(q);
    console.log("THis is products in routes/products, products");
    return res.json({ products });

    // "products": [
    // 	{
    // 		"name": "Beef & Salmon",
    // 		"ingredients": "Grass-raised beef, wild-caught salmon, grass-raised beef liver, flaxseed, grass-raised beef heart, organic carrots, organic cranberries, wild-caught whole ground krill, organic green peas, whole ground pumpkin seeds, organic spinach, organic ginger, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)",
    // 		"calorieCount": "369 kcal/cup",
    // 		"category": "DogFood",
    // 		"price": 275.49,
    // 		"weight": "288 oz",
    // 		"imageUrl": "/images/DogFood_BeefSalmon.jpg"
    // 	},
    //   {
    // 	"name": "Bison",
    // 	"ingredients": "Bison, bison liver, egg, flaxseed, organic green beans, organic spinach, organic pumpkin, whole ground krill, organic beets, coconut oil, whole ground eggshell, potassium salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), sage, guava",
    // 	"calorieCount": "367 kcal/cup",
    // 	"category": "DogFood",
    // 	"price": 55.49,
    // 	"weight": "48 oz",
    // 	"imageUrl": "/images/DogFood_Bison.png"
    // },
    // ]
  } catch (err) {
    return next(err);
  }
});

/** GET /api/products/name/[name]  =>  { products }
 *
 *  products are [{ name, ingredients, calorieCount, category, price, weight, imageUrl }, ...]
 *
 *  Finds all products with "name"
 *
 * Authorization required: none
 */

router.get("/name/:name", async function (req, res, next) {
  try {
    // retrieve the data of the specific product with the 'name' sent in the request URL
    const products = await Product.getProductByName(req.params.name);

    return res.json({ products });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/products/category/[category]  =>  { products }
 *
 *  products are [{ name, ingredients, calorieCount, category, price, weight, imageUrl }, ...]
 *
 *  Finds all products in "category"
 *
 * Authorization required: none
 */

router.get("/category/:category", async function (req, res, next) {
  try {
    // retrieve the data of specific products with 'category' sent in the request URL
    const products = await Product.getProductByCategory(req.params.category);
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /api/products/[name] { fld1, fld2, ... } => { product }
 *
 * Updates the data of product with specific name
 *
 * fields can be: { name, ingredients, calorieCount, category, price, imageUrl }
 *
 * Returns { name, ingredients, calorieCount, category, price,  imageUrl }
 *
 * Authorization required: Only logged in admins can update products (ensureAdmin middleware checks for that)
 */

router.patch("/:name/:weight", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, productUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((err) => err.stack);
      throw new BadRequestError(errs);
    }

    // update the specific product with the name sent in the request URL with what's in the request body
    const products = await Product.update(req.params.name, req.body);
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /api/products/[name]  =>  { deleted: name }
 *
 * Deletes product with 'name'
 *
 * Authorization: only logged in admins can delete a product (ensureAdmin middleware checks for that)
 */

router.delete("/:name", ensureAdmin, async function (req, res, next) {
  try {
    await Product.removeName(req.params.name);
    return res.json({ deleted: req.params.name });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /api/products/[name]/[weight]  =>  { deleted: name, weight }
 *
 * Authorization: login and logged in user must be an Admin (ensureAdmin middleware checks for that)
 */

router.delete("/:name/:weight", ensureAdmin, async function (req, res, next) {
  try {
    await Product.removeNameAndWeight(req.params.name, req.params.weight);
    return res.json({ deleted: req.params.name, weight: req.params.weight });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
