# Project Development Notes and Team Guide

## Project Name
E-Commerce Platform for Home-Based Women Sellers

## Purpose of This File
This file documents what we built in the project, why we made those choices, what changed over time, and what the team must remember in the future.

It is meant to help the team:
- understand the full project clearly
- remember the important architectural decisions
- track the major modules we implemented
- avoid repeating old mistakes
- explain the project easily during demo, report writing, and discussion

---

## 1. Project Goal

The goal of this project is to build a web-based e-commerce platform that supports:
- buyers
- sellers
- administrators

The platform allows:
- buyers to browse products, add them to favorites, add them to cart, and place orders
- sellers to create and manage products, and follow seller-related orders
- admins to monitor users, sellers, products, and orders

The project was first built as a normal REST API + web frontend application, then later improved by introducing a hybrid architecture using:
- MongoDB for products
- SQL for transactional modules

---

## 2. Main Technologies Used

### Backend
- Laravel
- Laravel Sanctum
- REST API architecture
- MySQL/SQLite for transactional data during development
- MongoDB for products in the hybrid phase

### Frontend
- React
- React Router
- Axios
- Context API
- Tailwind CSS

### Other Tools
- Postman for API testing
- Git and GitHub for version control
- VS Code / Codex for assisted implementation and review

---

## 3. Core Architectural Choice

We used a layered backend structure:

**Controller -> Service -> Repository -> Model**

### Why this was important
- keeps controllers clean
- separates business logic from data access
- makes the project easier to understand academically
- makes future modifications safer

---

## 4. Roles in the System

### Guest
Can:
- browse products
- view product details

Cannot:
- use cart
- use favorites
- place orders
- access seller/admin pages

### Buyer
Can:
- register and login
- browse products
- add to favorites
- add to cart
- update cart
- checkout
- view own orders

### Seller
Can:
- register and login
- create products
- update products
- delete products
- view seller orders
- update seller order status

### Admin
Can:
- login separately
- view users
- view sellers
- approve sellers
- view products
- view orders

---

## 5. Modules We Built

### 5.1 Authentication
Implemented:
- register
- login
- logout
- me/current user
- role middleware

Important decisions:
- public registration allows buyer and seller only
- admin is not publicly registered
- Sanctum token authentication is used

Important note:
frontend auth had to be aligned with backend response shape because backend returned user and token inside `data`.

---

### 5.2 Products
Implemented:
- public product list
- product details
- seller create product
- seller update product
- seller delete product
- search
- filter

Important decisions:
- products later moved to MongoDB
- product API response was normalized to return `id` instead of raw Mongo `_id`

Important note:
frontend must always use `product.id`, not `_id`.

---

### 5.3 Seller Product Management
Implemented:
- seller products list
- add product page
- edit product page
- delete product

Important note:
ownership checks are important. Sellers must only modify their own products.

---

### 5.4 Favorites
Implemented:
- add favorite
- remove favorite
- list favorites

Important decisions:
- favorites stay in SQL
- product lookup comes from MongoDB
- `product_id` must be treated as string

Important note:
frontend favorite requests must send:
```json
{
  "product_id": "..."
}
```

---

### 5.5 Cart
Implemented:
- get cart
- add to cart
- update cart item quantity
- remove cart item

Important decisions:
- cart stays in SQL
- product lookup comes from MongoDB
- `cart_items.product_id` changed from SQL foreign key style to string
- cart responses still include product details from MongoDB

Important note:
inactive or missing MongoDB products must be rejected.

---

### 5.6 Checkout and Buyer Orders
Implemented:
- checkout
- get buyer orders
- get one buyer order

Important decisions:
- orders stay in SQL
- `order_items.product_id` changed to string
- order responses attach product details from MongoDB
- pricing and totals remain stored in SQL

Important note:
checkout must fail if cart contains products missing from MongoDB or products that became inactive.

---

### 5.7 Seller Orders
Implemented:
- seller orders list
- seller order details
- seller order status update

Important decisions:
- seller only sees items related to their own products
- seller order response attaches MongoDB product details

---

### 5.8 Admin Module
Implemented:
- admin dashboard
- users list
- sellers list
- approve seller
- products list
- orders list

Important decisions:
- admin product list reads from MongoDB through repository layer
- seller info still comes from SQL users table
- admin orders attach product details from MongoDB

---

## 6. Frontend Improvements

We improved the frontend to make the project cleaner and demo-ready.

Implemented improvements:
- role-aware navbar
- cleaner home page
- better product cards
- add to cart buttons
- favorite buttons
- improved seller pages
- improved admin pages
- more consistent spacing and titles
- better UI feedback messages
- better route protection

Important note:
frontend pages should continue to rely on stable API shapes:
- product has `id`
- order items may include `product`
- cart items may include `product`

---

## 7. Why We Switched to Hybrid Architecture

Originally, the project worked with a more traditional relational flow.

Later, we chose a hybrid architecture because:
- products are flexible and better suited for MongoDB
- transactional modules are safer in SQL
- future mobile integration benefits from clear REST API boundaries
- this gives a better academic and technical explanation for our system

### Final hybrid split

### MongoDB
- products

### SQL
- users
- auth tokens
- favorites
- carts
- cart_items
- orders
- order_items
- admin transactional logic

---

## 8. Important Hybrid Rules

These rules are very important and should not be forgotten.

### Rule 1
Products are no longer treated like SQL rows.

### Rule 2
Do not use SQL validation like:
- `exists:products,id`

for modules that depend on products.

### Rule 3
Use MongoDB product lookup through:
- `ProductRepositoryInterface`

### Rule 4
Store `product_id` as string in:
- favorites
- cart_items
- order_items

### Rule 5
Do not expose raw MongoDB `_id` in API responses.
Expose normalized `id`.

### Rule 6
Do not rebuild direct SQL relations like:
- `belongsTo(Product::class)`
for runtime product loading in hybrid flow.

### Rule 7
Frontend must use:
- `product.id`
not:
- `product._id`

---

## 9. Important Problems We Faced

### 9.1 Auth response mismatch
Frontend expected token/user at top level, but backend returned them inside `data`.

### 9.2 Database driver problems
At first, migration problems happened because correct PHP database drivers were missing or wrong connection settings were cached.

### 9.3 MongoDB package setup
Hybrid work did not start immediately because:
- MongoDB Laravel package was not installed
- PHP MongoDB extension was missing
- MongoDB connection config was initially wrong

### 9.4 Favorites frontend bug
Favorites backend worked, but browser requests failed because frontend request formatting was wrong.

### 9.5 Product response normalization
MongoDB returned `_id`, but frontend expected `id`, so we normalized product responses.

### 9.6 SQL assumptions in cart/orders/admin
Many modules originally assumed products came from SQL, so they had to be updated one by one.

---

## 10. What the Team Must Always Remember

### Always remember
- products are in MongoDB
- transactions are in SQL
- API consumers should not care where data comes from
- repository/service layer hides the storage logic

### Before changing any module, ask:
1. Does this module depend on product lookup?
2. Is it still assuming SQL Product model?
3. Does it store `product_id` as string?
4. Does the frontend use `id` and not `_id`?

---

## 11. Recommended Testing Order

When something breaks, test in this order:

1. `GET /api/products`
2. `GET /api/products/{id}`
3. cart add/get/update/delete
4. favorites add/get/delete
5. checkout
6. buyer orders
7. seller orders
8. admin products
9. admin orders

This order helps identify whether the issue is:
- MongoDB product problem
- SQL transaction problem
- integration problem
- frontend request problem

---

## 12. Current Final State of the Project

At the final stable stage, the project includes:

### Working backend areas
- auth
- roles middleware
- products in MongoDB
- cart hybrid integration
- favorites hybrid integration
- checkout hybrid integration
- buyer orders hybrid integration
- seller orders hybrid integration
- admin product and order hybrid integration

### Working frontend areas
- auth pages
- products pages
- product details
- cart page
- favorites page
- checkout page
- buyer order pages
- seller pages
- admin pages
- role-based navigation

---

## 13. Suggested Git Commit Message for This Phase

Example:

```bash
git commit -m "Finalize hybrid architecture with MongoDB products and SQL transactional modules"
```

Another good option:

```bash
git commit -m "Complete MVP with hybrid database integration, frontend fixes, and final API alignment"
```

---

## 14. Small Message to Our Future Team

If we come back to this project later, remember these points:

- do not rush into changing the database structure again unless it is necessary
- do not replace the REST API shape without checking frontend compatibility
- always verify product-related modules after any MongoDB change
- test browser behavior, not only Postman
- keep commits clear and descriptive
- document every major change before forgetting why it was done

Most of our difficult bugs came from:
- old SQL assumptions
- response shape mismatches
- frontend sending wrong request payloads
- hidden configuration/cache problems

So in the future:
**test carefully, document clearly, and change one layer at a time**

---

## 15. Final Summary

This project started as a classic Laravel + React e-commerce MVP, then evolved into a more advanced architecture with:
- clean REST API design
- layered backend structure
- role-based access control
- hybrid MongoDB + SQL integration

This made the system:
- more scalable
- more flexible
- more realistic
- stronger academically

---

## 16. Suggested Future Improvements

If we continue this project later, possible next steps are:
- product attributes and variants in MongoDB
- image upload system
- better search and filtering
- analytics dashboard
- delivery tracking
- notifications
- mobile app integration using the same REST API
- stronger admin analytics

---

## 17. Team Reminder Checklist

Before any future update, verify:

- [ ] MongoDB connection still works
- [ ] Product API still returns `id`
- [ ] Cart still accepts Mongo product IDs
- [ ] Favorites still accept Mongo product IDs
- [ ] Checkout still rejects unavailable products
- [ ] Buyer orders still include product details
- [ ] Seller orders still include product details
- [ ] Admin products/orders still work
- [ ] Frontend still uses `product.id`
- [ ] Role-based access still works

---

**End of team documentation file**
