CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  password TEXT NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients VARCHAR NOT NULL,
  calorie_count VARCHAR NOT NULL,
  category TEXT NOT NULL,
  price FLOAT NOT NULL,
  image_url1 TEXT,
  image_url2 TEXT,
  image_url3 TEXT 
);










