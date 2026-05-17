const express = require("express");
const {
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  getOrderStats,
} = require("../../controllers/admin/orders.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");
const adminMiddleware = require("../../middlewares/admin/admin.middleware");

const router = express.Router();

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware);

router.get("/get", getAllOrders);
router.get("/stats", getOrderStats);
router.get("/detail/:id", getOrderDetail);
router.put("/status/:id", updateOrderStatus);

module.exports = router;
