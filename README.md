# 🛒 SeaBasket Backend

Backend API for **SeaBasket**, an e-commerce platform that allows users to browse products, manage their accounts, add products to a cart, place orders, make payments, and track their orders.

The backend is built using **NestJS** with **PostgreSQL** as the database.

---

## 🚀 Tech Stack

* **NestJS** — Backend framework
* **TypeScript** — Programming language
* **PostgreSQL** — Relational database
* **TypeORM / Prisma** — Database ORM *(depending on implementation)*
* **Stripe** — Payment gateway
* **Git** — Version control
* **REST API** — API architecture

---

#  Modules

The SeaBasket backend consists of the following major modules:

```text
Authentication
User / Profile
Products
Categories
Search & Filters
Cart
Orders
Payments
Reviews & Ratings
Password Recovery
```

#  Authentication

## Sign Up

Users can create an account using:

* Name
* Email
* Password

### Requirements

* Email must be unique.
* Password must never be stored as plain text.
* Password should be securely hashed/encrypted before storing it in the database.
* User verification should be supported through email or phone number.

## Login

Users can log in using:

* Email + Password
* Phone Number + Password

### Requirements

* Credentials must be validated.
* Email/phone number must exist in the system.
* Password must be verified against the stored hashed password.
* Authentication should use a secure token-based mechanism.

### Example

```http
POST /auth/login
```

---

## User Verification

Users should be verified through:

* Email verification
* Phone number verification

Only verified users should be allowed to access protected functionality where required.

---

#  Home

The Home module provides APIs required for the application's home page.

### Features

* Search products by name
* Search products by category
* Get trending products
* Get product categories
* Get products for the home-page carousel

### Example APIs

```http
GET /products/search
GET /products/trending
GET /categories
```

---

#  Product Listing

Products can be viewed by both authenticated and unauthenticated users.

### Features

* Get all products
* Get products by category
* Search products
* Filter products
* Sort products
* Pagination

### Filters

Users can filter products based on:

* Price range
* Rating
* Discount
* Category

### Sorting

Products can be sorted by:

* Price — Low to High
* Price — High to Low
* Name — A to Z
* Name — Z to A

### Example

```http
GET /products
```

Example query:

```text
GET /products?category=fruits&minPrice=100&maxPrice=500&rating=4&sort=price_asc
```

---

#  Product Details

Users can access detailed information about an individual product.

### Product information may include

* Product name
* Description
* Images
* Price
* Discount
* Category
* Stock availability
* Average rating
* Reviews
* Product specifications

### Example

```http
GET /products/:id
```

---

#  Reviews & Ratings

Users should be able to access product reviews and ratings.

### Features

* Get product reviews
* Get average product rating
* Add a review
* Add/update rating

Only users who have purchased a product should be allowed to review it.

### Example

```http
GET /products/:id/reviews

POST /products/:id/reviews
```

---

#  Cart

Authenticated users can manage their shopping cart.

### Features

* Add product to cart
* View cart
* Update product quantity
* Remove product from cart
* Clear cart
* Calculate cart total

### Example APIs

```http
POST /cart
GET /cart
PATCH /cart/:itemId
DELETE /cart/:itemId
DELETE /cart
```

---

#  Checkout & Payment

SeaBasket uses **Stripe Payment Gateway** for processing payments.

### Checkout Flow

```text
Cart
  ↓
Checkout
  ↓
Create Payment
  ↓
Stripe
  ↓
Payment Confirmation
  ↓
Create Order
  ↓
Order Confirmation
```

### Requirements

* Calculate the final order amount.
* Create a Stripe payment/session.
* Process payment securely.
* Handle successful payments.
* Handle failed payments.
* Create an order only after successful payment.
* Store payment transaction information.

### Example

```http
POST /payments/create
POST /orders
```

> Stripe secret keys must be stored in environment variables and must never be committed to Git.

---

#  Profile

Authenticated users can manage their profile.

### Features

* View profile
* Update profile details
* Change password
* View previous orders

### Example APIs

```http
GET /users/profile
PATCH /users/profile
GET /users/orders
```

---

#  Orders

Users can access their previously placed orders.

### Features

* Create order after successful payment
* Get all user orders
* Get individual order details
* Track order status
* Cancel order

### Order Status

A typical order lifecycle can be:

PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```