const express = require("express");
const {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  handleMidtransWebhook,
} = require("../../controllers/shop/orders.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

// Midtrans webhook - no auth required (called by Midtrans servers)
router.post("/webhook", handleMidtransWebhook);

// All other order routes require authentication
router.use(authMiddleware);

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
