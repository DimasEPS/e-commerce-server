const express = require("express");
const dns = require("node:dns");
// Force IPv4 first to prevent ETIMEDOUT errors in Docker/WSL with Node 18+
dns.setDefaultResultOrder("ipv4first");

// const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth.route");
require("dotenv").config();
const adminProductsRouter = require("./routes/admin/products.route");
const adminUsersRouter = require("./routes/admin/users.route");
const connectDB = require("./database/database");

// Shop routes
const shopProductsRouter = require("./routes/shop/products.route");
const shopCartRouter = require("./routes/shop/cart.route");
const shopOrdersRouter = require("./routes/shop/orders.route");
const shopAddressRouter = require("./routes/shop/address.route");
const shopProfileRouter = require("./routes/shop/profile.route");
const shopBookingRouter = require("./routes/shop/booking.route");
const shopWishlistRouter = require("./routes/shop/wishlist.route");

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionsSuccessStatus: 204,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "cache-control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRouter);

// Admin routes
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/users", adminUsersRouter);

// Shop (user) routes
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/orders", shopOrdersRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/profile", shopProfileRouter);
app.use("/api/shop/booking", shopBookingRouter);
app.use("/api/shop/wishlist", shopWishlistRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
