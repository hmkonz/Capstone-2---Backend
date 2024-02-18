"use strict";

/** Routes for products */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const Product = require("../models/product");

const productSearchSchema = require("../schemas/productSearch.json");

const router = new express.Router();

/** GET /api/products  =>
 *   { products: [{ name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3  }, ...] }
 *
 *  Find all products
 *
 * Returns [{ name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3  }, ...]
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
    return res.json({ products });

    // "products": [
    // 	{
    // 		"id": "1"
    // 		"name": "Beef & Salmon",
    // 		"ingredients": "Grass-raised beef, wild-caught salmon, grass-raised beef liver, flaxseed, grass-raised beef heart, organic carrots, organic cranberries, wild-caught whole ground krill, organic green peas, whole ground pumpkin seeds, organic spinach, organic ginger, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)",
    // 		"calorie_count": "369 kcal/cup",
    // 		"category": "DogFood",
    // 		"price": 275.49,
    // 		"image_url1": "/images/DogFood_BeefSalmon.jpg",
    //    "image_url2": "/images/Beef&SalmonActualIngredients.jpg",
    //    "image_url3": "/images/Beef&SalmonGuaranteedAnalysis.jpg",
    // 	},
    //   {
    // 	"id" : "4"
    // 	   "name": "Bison",
    // 	   "ingredients": "Bison, bison liver, egg, flaxseed, organic green beans, organic spinach, organic pumpkin, whole ground krill, organic beets, coconut oil, whole ground eggshell, potassium salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), sage, guava",
    // 	   "calorie_count": "367 kcal/cup",
    // 	   "category": "DogFood",
    // 	   "price": 55.49,
    // 	   "image_url1": "/images/DogFood_Bison.png",
    //     "image_url2": "images/Just_Real_Food.png",
    //     "images_url3": "/images/BisonIngredients&GuaranteedAnalysis_.jpg"
    // },
    // ]
  } catch (err) {
    return next(err);
  }
});

/** GET /api/products/name/[name]  =>  { products }
 *
 *  products are [{ name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3  }, ...]
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
 *  products are [{ name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3  }, ...]
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

module.exports = router;
