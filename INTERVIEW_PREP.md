# EasyCart - Technical Interview Preparation Guide

This document is designed to help you prepare for technical interviews based on the EasyCart project. It covers the architecture, data flow, key concepts, and common questions you might be asked.

## 1. Project Overview & Architecture

### What is the tech stack and why did you choose it?
**Answer:** The project uses the **MERN** stack (MongoDB, Express.js, React.js, Node.js).
- **MongoDB:** A NoSQL database that provides flexibility for e-commerce data structures (like products with varying variants and specifications).
- **Express & Node.js:** Provides a fast, asynchronous backend runtime environment ideal for handling RESTful API requests and I/O heavy operations.
- **React.js & Vite:** React provides a component-based UI for dynamic state management (like Cart and Wishlist), and Vite provides a lightning-fast development environment and optimized production builds.
- **Tailwind CSS:** Used for utility-first styling, enabling rapid UI development without writing custom CSS files.

### How does the Frontend communicate with the Backend?
**Answer:** The frontend communicates with the backend via **HTTP REST APIs** using `axios`.
1. **Frontend Request:** A user performs an action (e.g., clicks "Add to Cart"). The React component calls a function in the Context API (e.g., `CartContext`).
2. **Axios Call:** The Context function uses `axios` to send an HTTP POST request to the backend route (e.g., `/api/cart/items`).
3. **Backend Routing:** Express intercepts the request at `/api/cart` and passes it to the `cartController`.
4. **Middleware:** Before hitting the controller, the request passes through `authMiddleware` to verify the user's JWT token via cookies.
5. **Database Operation:** The controller uses Mongoose to update the Cart document in MongoDB.
6. **Response:** The controller sends back a JSON response. The React Context updates its local state based on this response, causing the UI to re-render.

## 2. Authentication & Authorization

### How is Authentication implemented?
**Answer:** Authentication is handled using **JSON Web Tokens (JWT)**.
1. When a user logs in, the backend verifies their hashed password using `bcryptjs`.
2. A JWT is generated containing the user's ID.
3. Crucially, the JWT is sent to the client inside an **HTTP-Only Cookie**. This is highly secure because JavaScript cannot access the cookie, preventing XSS (Cross-Site Scripting) attacks.

### How is Role-Based Authorization handled?
**Answer:** We have two roles: `customer` and `admin`.
- **Backend:** A custom `adminMiddleware` checks if `req.user.role === 'admin'`. If not, it throws a 403 Forbidden error.
- **Admin Registration:** Admin accounts can only be created by providing a secret `ADMIN_ACCESS_CODE` during registration. This ensures customers cannot arbitrarily create admin accounts.
- **Frontend:** Protected routes use wrappers (`<ProtectedRoute>` and `<AdminRoute>`). If a regular user tries to access `/admin`, they are redirected.

## 3. Key E-Commerce Concepts

### How do you handle Product Variants (Size, Color)?
**Answer:** Instead of treating every size/color as a completely different product, the `Product` model contains an array of `variants`. 
Each variant has its own `stock`, `price`, `discountPrice`, `color`, and `size`. When an item is added to the cart, the cart document stores both the `product` (ObjectId reference) and the specific `variantId`. This allows accurate inventory tracking per variant.

### How is Cart and Checkout pricing calculated?
**Answer:** Security Rule: **Never trust the frontend for pricing.**
When a user submits a checkout request, the frontend only sends the product IDs, variant IDs, and quantities. 
The backend retrieves the actual prices from the database, applies any valid `Coupon` discounts (checking minimum order values and limits), adds shipping costs, and calculates the final total server-side before creating the `Order`.

### How do you handle Stock Management?
**Answer:** 
1. **Validation:** Before placing an order, the backend checks if the requested quantity exceeds the available `variant.stock`.
2. **Deduction:** Upon successful order creation, the stock for that specific variant is decremented in the database.
3. **Restoration:** If an order is cancelled or successfully returned, the stock is incremented back.

## 4. Database & Mongoose

### Can you explain how you use Mongoose `populate()`?
**Answer:** MongoDB is NoSQL, meaning data is non-relational. However, we often need relational data.
For example, the `Cart` model only stores the user's ObjectId and an array of product ObjectIds. 
When fetching the cart, we use `.populate('items.product', 'name images brandName variants')`. This tells Mongoose to fetch the full product details from the Products collection and inject them into the Cart response, allowing the frontend to display product names and images.

## 5. Important Commands to Know

* **Start Development Servers (Root):** `npm run dev` (Runs both client and server concurrently)
* **Start Server Only:** `cd server && npm run dev`
* **Start Client Only:** `cd client && npm run dev`
* **Seed Database:** `cd server && npm run data:import` (Wipes existing DB and loads dummy data)
* **Build Frontend for Production:** `cd client && npm run build`

## 6. Potential Interview Questions to Practice

1. *"Why did you use Context API instead of Redux?"*
   - **Answer:** Context API is built into React and is perfectly sufficient for the global state needs of this MVP (Auth, Cart, Wishlist). Redux would add unnecessary boilerplate for a project of this scale.
   
2. *"What happens if two people try to buy the last item in stock at the exact same time?"*
   - **Answer:** In a high-scale production app, this requires database transactions and optimistic concurrency control (like checking `stock: { $gte: quantity }` during the update query). In this MVP, we validate the stock right before creating the order.

3. *"How does the search and filter mechanism work?"*
   - **Answer:** The frontend collects filter parameters (category, price range, search keyword) and passes them as URL query strings (e.g., `?keyword=shirt&category=123`). The backend Express controller parses `req.query`, builds a dynamic MongoDB query object using regex (for search) and `$gte`/`$lte` (for prices), and returns the filtered results along with pagination metadata.
