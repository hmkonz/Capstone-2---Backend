CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  first_name_billing TEXT,
  last_name_billing TEXT,
  billing_address VARCHAR,
  first_name_shipping TEXT,
  last_name_shipping TEXT,
  shipping_address VARCHAR,
  phone VARCHAR,
  password TEXT NOT NULL,
  stripe_customer_id VARCHAR unique
);

CREATE TABLE admins (
  email TEXT UNIQUE PRIMARY KEY,
  password TEXT 
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
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
  date DATE NOT NULL,
  product_name VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  price FLOAT NOT NULL,
  subtotal FLOAT,
  payment_method VARCHAR NOT NULL,
  user_id INTEGER REFERENCES users(id) 
);

CREATE TABLE product_order(
  product_id INTEGER REFERENCES products(id),
  order_id INTEGER REFERENCES orders(id),
  PRIMARY KEY(product_id, order_id)
);

CREATE TABLE carts (
  id VARCHAR PRIMARY KEY,
  product_name VARCHAR NOT NULL,
  product_quantity INTEGER DEFAULT '2',
  product_price FLOAT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id)
);

CREATE TABLE product_cart (
  product_id INTEGER REFERENCES products(id),
  cart_id VARCHAR REFERENCES carts(id),
  PRIMARY KEY (product_id, cart_id)
);






