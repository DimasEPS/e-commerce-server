const express = require("express");
const {
  getProducts,
  getProductById,
} = require("../../controllers/shop/products.controller");

const router = express.Router();

// Public routes - no auth required
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
