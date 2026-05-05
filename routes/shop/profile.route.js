const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../../controllers/shop/profile.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/password", changePassword);

module.exports = router;
