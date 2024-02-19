"use strict";

/** Shared config for application; can be required many places. */

//config() method on dotenv library puts all the variables in .env file and puts them in the process.env variable
require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///just_real_food_test"
    : process.env.DATABASE_URL || "postgresql:///just_real_food";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Just Real Food Config:".green);
console.log("PORT:".yellow, PORT.toString());
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
