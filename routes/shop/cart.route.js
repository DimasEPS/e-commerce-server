const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../../controllers/shop/cart.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeCartItem);

module.exports = router;
