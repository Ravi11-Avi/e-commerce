# AURA LUXE — Full-Stack E-Commerce Platform

A state-of-the-art, full-featured **E-Commerce Platform** built from **A to Z** with **Node.js, Express, React 18, MongoDB**, and **Docker**.

---

## 🌟 Key Features (A to Z)

### 1. 🛍️ Product Catalog & Deep Discovery
* **16 Curated Premium Products**: Electronics, High-End Audio, Fashion & Watches, Home & Living, and Travel Accessories.
* **Smart Filter & Search**: Instant keyword search, category pills, price range slider ($0 - $2,000), "In Stock Only" toggle.
* **Sorting Engine**: Sort by Featured, Price (Low to High / High to Low), Customer Rating, or Newest Arrivals.
* **Deep Product Details Modal**:
  * Multi-image gallery with interactive thumbnail switcher.
  * Technical specifications table and key features checklist.
  * Live stock indicator and MSRP discount comparison.
  * Verified customer reviews and review submission system.

### 2. 🔐 Authentication & Per-User Isolation
* **Secure JWT & Bcrypt Authentication**: Registration and login with salted hash password security.
* **Isolated Carts & Wishlists in MongoDB**: Each user has their own distinct cart and wishlist stored and synced directly in the database.
* **Pre-Seeded Demo Accounts**:
  * **Customer**: `john@example.com` / `password123` (Name: *John Doe*)
  * **Store Admin**: `admin@example.com` / `admin123` (Name: *Store Administrator*)
* **1-Click Demo Login**: One-click fill buttons in the login modal for effortless testing.

### 3. 💖 Per-User Wishlist & 🛒 Shopping Cart
* **Wishlist**: Add/remove any product with the heart icon. Synchronized per user in MongoDB.
* **Shopping Cart**:
  * Real-time quantity increment/decrement and item removal.
  * Free Express Shipping progress bar (Free shipping on orders over $100).
  * **Promo Code Engine**: Try `SAVE10` (10% off), `WELCOME20` (20% off), or `LUXE50` ($50 off orders over $250).
  * Transparent financial breakdown: Subtotal, Shipping, 8% Tax, Discount, Grand Total.

### 4. 📦 Checkout, Order List & Real-Time Tracking
* **3-Step Checkout Flow**:
  1. Contact & shipping address (autofills from user profile).
  2. Payment method (Credit/Debit Card, UPI / QR Code, Cash on Delivery, PayPal).
  3. Order summary review.
* **Live 5-Stage Order Tracking Stepper**:
  * Real-time visual progress bar tracking every milestone:
    1. *Order Placed & Payment Verified*
    2. *Quality Checked & Packed*
    3. *Shipped & In Transit (FedEx Express with Tracking Number)*
    4. *Out for Delivery*
    5. *Package Delivered*
* **Order History & Printable Invoice**:
  * Filter past orders by status (All, Processing, Shipped, Delivered).
  * Itemized receipt with 1-click printable invoice view.

### 5. ⚡ Admin Order Controller
* Admins can view all customer orders and change order statuses (*Processing -> Confirmed -> Shipped -> Out for Delivery -> Delivered*), allowing real-time testing of the live tracker!

---

## 🚀 Running the Project

### Option 1: Running Locally with `.env` (Recommended)

1. **Verify your `.env` file** in the project root:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_db
   JWT_SECRET=aura_ecommerce_ultra_secure_jwt_token_key_2026_x89f2
   NODE_ENV=development
   CLIENT_URL=http://localhost:5000
   ```
   *(You can point `MONGO_URI` to local MongoDB, MongoDB Atlas Cloud, or any MongoDB server)*

2. **Start the application**:
   ```bash
   npm start
   ```
   *or from the backend folder:*
   ```bash
   cd backend && npm start
   ```

3. **Open in your browser**:
   ```
   http://localhost:5000
   ```

---

### Option 2: Running with Docker Compose (Single Command)

To run the complete full-stack application and an isolated MongoDB container simultaneously:

```bash
docker compose up --build
```

* Both the **Node.js Web Application** (Port `5000`) and **MongoDB** (Port `27017`) will start automatically with persistent database volume storage!
* Stop anytime with `docker compose down`.

---

### Option 3: Building & Running Standalone Docker Container

```bash
# Build the Docker image
docker build -t aura-luxe-ecommerce .

# Run container with your .env configuration
docker run -p 5000:5000 --env-file .env aura-luxe-ecommerce
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health diagnostic & database connection status |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Get current logged-in user profile (Bearer token) |
| `PUT` | `/api/auth/profile` | Update profile details and shipping address |
| `GET` | `/api/products` | Query products with category, search, and sorting |
| `GET` | `/api/products/:id` | Fetch single product with reviews & specifications |
| `POST` | `/api/products/:id/review` | Submit customer review with star rating |
| `GET` | `/api/cart` | Get authenticated user's cart from MongoDB |
| `POST` | `/api/cart` | Add / increment item in user's MongoDB cart |
| `PUT` | `/api/cart/item` | Update cart item quantity |
| `DELETE` | `/api/cart/:id` | Remove item from cart |
| `GET` | `/api/wishlist` | Get user's wishlist from MongoDB |
| `POST` | `/api/wishlist/toggle` | Toggle product in user's wishlist |
| `POST` | `/api/orders` | Place order & initialize tracking timeline |
| `GET` | `/api/orders/my-orders` | Get past orders for logged-in user |
| `GET` | `/api/orders/track/:id` | Real-time tracking data & 5-stage timeline |
| `GET` | `/api/orders/:id` | Detailed order invoice receipt |
| `PUT` | `/api/admin/orders/:id/status` | Update order status & advance live stepper |
| `POST` | `/api/coupons/validate` | Validate promo discount codes |
