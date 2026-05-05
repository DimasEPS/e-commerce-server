const express = require("express");
const {
  getWishlist,
  toggleWishlist,
} = require("../../controllers/shop/wishlist.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

module.exports = router;
