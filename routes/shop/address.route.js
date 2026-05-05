const express = require("express");
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../../controllers/shop/address.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.put("/:id/default", setDefaultAddress);

module.exports = router;
