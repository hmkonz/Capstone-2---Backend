"use strict";
/** Database setup for JustRealFoods */
const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "just_real_food_test";
} else {
  DB_URI = "just_real_food";
}

let db = new Client({
  host: "/var/run/postgresql/",
  database: DB_URI,
});

db.connect();

module.exports = db;
