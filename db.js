"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
// const { getDatabaseUri } = require("./config");

let DB_URI;

// if (process.env.NODE_ENV === "production") {
//   db = new Client({
//     connectionString: getDatabaseUri(),
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });
// } else {
//   db = new Client({
//     connectionString: getDatabaseUri()
//   });
// }

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
