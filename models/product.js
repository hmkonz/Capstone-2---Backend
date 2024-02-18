"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for products */

class Product {
  /** Find all products (optional filter on name, category)
   *
   * optional filters on:
   * - name (will find case-insensitive, partial matches)
   * - category (will find case-insensitive, partial matches)
   *
   * Returns [{ name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3 }, ...]
   * */

  // optionally pass in query string key/value pairs from request URL:
  // example: GET /products/?name=Bison&category=DogFood
  static async findAll({ name, category } = {}) {
    // retrieve all products in the database
    let query = `SELECT id,
                        name,
                        ingredients,
                        calorie_count,
                        category,
                        price,
                        image_url1,
                        image_url2,
                        image_url3
                 FROM products`;

    // whereExpressions will hold the keys sent in the query string and what they equal i.e. ['name ILIKE $1', 'category ILIKE $2']
    let whereExpressions = [];

    // queryValues will hold the corresponding values sent in the query string i.e. [ '%Bison%', '%DogFood%' ]
    let queryValues = [];

    // For each possible search term, add to queryValues and whereExpressions so we can
    // generate the right SQL

    // queryValues = [ Bison ]
    // whereExpressions [ 'name ILIKE $1' ]

    //  queryValues [ %Bison%, '%DogFood%' ]
    // whereExpressions [ 'name ILIKE $1', 'category ILIKE $2' ]
    if (name) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (category) {
      queryValues.push(`%${category}%`);
      whereExpressions.push(`category ILIKE $${queryValues.length}`);
    }

    // if there are elements in the whereExpressions array add WHERE to the end of the SQL query ('query') and join the elements in the whereExpression array with AND (i.e. WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3)
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }
    //  query += " WHERE " + whereExpressions.join(" AND ") equals:
    //          SELECT  name,
    //                  ingredients,
    //                  calorie_count,
    //                  category,
    //                  price,
    //                  image_url1,
    //                  image_url2,
    //                  image_url3
    //          FROM products`
    //          WHERE name ILIKE $1 AND category ILIKE $2

    // Add 'ORDER BY name' to the end of the SQL query ('query')

    query += " ORDER BY category DESC";
    //  query += "ORDER BY name" equals:
    //          SELECT  name,
    //                  ingredients,
    //                  calorie_count,
    //                  category,
    //                  price,
    //                  image_url,
    //                  image_url2,
    //                  image_url3
    //         FROM products`
    //         WHERE name ILIKE $1 AND category ILIKE $2
    //         ORDER BY name

    // pass in the SQL query generated above 'query' as well as the queryValues from the query string to get the resulting companies that satisfy the search filters
    const productsRes = await db.query(query, queryValues);
    // set 'products' equal to the result of the query
    const products = productsRes.rows;

    // if there are no results from the query (products is an empty array), throw an error
    if (!products.length && !name)
      throw new NotFoundError(`No product with category: ${category}`);

    if (!products.length && !category)
      throw new NotFoundError(`No name with name: ${name}`);

    if (!products.length && name && category)
      throw new NotFoundError(
        `No product with name: ${name} and/or category: ${category}`
      );

    return products;

    // "products": [
    // 	{
    //    "id": "1"
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
    //     "id" : "4"
    // 	   "name": "Bison",
    // 	   "ingredients": "Bison, bison liver, egg, flaxseed, organic green beans, organic spinach, organic pumpkin, whole ground krill, organic beets, coconut oil, whole ground eggshell, potassium salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), sage, guava",
    // 	   "calorie_count": "367 kcal/cup",
    // 	   "category": "DogFood",
    // 	   "price": 55.49,
    // 	   "image_url1": "/images/DogFood_Bison.png",
    //     "image_url2": "images/Just_Real_Food.png",
    //     "images_url3": "/images/BisonIngredients&GuaranteedAnalysis_.jpg"
    //   },
    // ]
  }

  /** Given a product category (DogFood or CatFood), return data of the products in that category
   *
   * Returns [{ id, name, image_url1, image_url2, image_url3  }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async getProductByCategory(category) {
    // retrieve all the products of a given category
    const productRes = await db.query(
      `SELECT id,
              name,
              image_url1,
              image_url2,
              image_url3  
      FROM products
      WHERE category = $1`,
      [category]
    );
    // set 'products' equal to the result of the query
    const products = productRes.rows;

    // if there are no results from the query (products is an empty array), throw an error
    if (!products.length) throw new NotFoundError(`No category: ${category}`);

    return products;
  }

  /** Given a product name, return data about that product
   *
   * Returns [{ id, name, ingredients, calorie_count, category, price, image_url2, image_url3  }, ...]
   *
   * Throws NotFoundError if name not found.
   **/

  static async getProductByName(name) {
    // retrieve the product data with the 'name' found in request URL
    const productRes = await db.query(
      `SELECT id,
              name,
              ingredients,
              calorie_count,
              category,
              price,
              image_url2,
              image_url3
        FROM products
        WHERE name = $1`,
      [name]
    );
    // set 'product' equal to the result of the query
    const product = productRes.rows;

    // if there are no results from the query (product is an empty array), throw an error
    if (!product.length)
      throw new NotFoundError(`No product with name ${name}`);

    return product;
  }
}

module.exports = Product;
