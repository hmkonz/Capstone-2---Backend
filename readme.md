# Just Real Food Capstone Project

## About <br>
"Just Real Food" is a data-driven website developed in React and Node and powered off of both an API I built myself and the Stripe API.  This was a challenging project that incorporated all of the full-stack skills I learned in the Springboard Software Engineering Career Track bootcamp.

This website allows visitors to the site to browse through all available dog and cat food products and see the details of specific products (i.e. price, ingredients, guaranteed analysis and calorie count). 

Visitors can create a customer account, which gives them the ability to add products to their cart, increase/decrease the quantities of items in the cart and/or remove products from the cart altogether. When ready to checkout, the customer is directed to a Stripe checkout page where they enter their credit card and shipping and billing information and confirm their intent to purchase. Stripe will then process the payment and a confirmation of purchase is shown in the browser. Customers can also cancel their purchase and a confirmation of their cancelled purchase is shown in the browser.
<br><br>

## Website Features
**APIs**
<br>
* JustRealFoodApi, created by myself. Data was loaded into the API in the backend and API routes were created. <br>
* Stripe API for payment processing<br><br>


## Application Structure <br>
* This application consists of a NodeJS backend and a SQL database queried by Postgresql. <br>
* The NodeJS backend creates a server that can be accessed at http://localhost:3001. It features json schemas to handle verification of incoming requests, helper functions to create json web tokens for authentication purposes, middleware functions to authenticate customer credentials when logging in and routes and models to create a RESTful API. The JustRealFoodApi handles requests to show all products, to show only dog food or cat food products and to show specific product details. The Stripe API handles requests for creating a customer and handling checkouts. <br><br>

## API Endpoints <br>
### User Authorization
* POST /api/auth/user/register
* POST /api/auth/user/token

### Products
* GET /api/products
* GET /api/products/name/:name
* GET /api/products/category/:category

### Stripe
* POST /api/stripe/checkout <br><br>

## To Run This Application
 Run the app at server http://localhost:3001 <br>
 $ node server.js<br><br>
 
## Back End Tech Stack 
NodeJS, ExpressJS, SQL, PostgreSQL, Stripe


  


