CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  password TEXT NOT NULL,
  stripe_customer_id VARCHAR unique
);

CREATE TABLE admins (
  email TEXT UNIQUE PRIMARY KEY,
  password TEXT 
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

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  stripe_customer_id VARCHAR NOT NULL,
  payment_intent_id VARCHAR,
  product_id VARCHAR,    
  product_name VARCHAR,
  product_price VARCHAR,
  product_quantity INTEGER,
  subtotal FLOAT,
  total FLOAT,
  shipping VARCHAR,
  delivery_status VARCHAR,
  payment_status VARCHAR,
  timestamp VARCHAR
);

CREATE TABLE product_order(
  product_id TEXT REFERENCES products(id),
  order_id INTEGER REFERENCES orders(id),
  PRIMARY KEY(product_id, order_id)
);









