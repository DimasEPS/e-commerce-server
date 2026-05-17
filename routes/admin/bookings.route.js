const express = require("express");
const {
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
} = require("../../controllers/admin/bookings.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");
const adminMiddleware = require("../../middlewares/admin/admin.middleware");

const router = express.Router();

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware);

router.get("/get", getAllBookings);
router.get("/stats", getBookingStats);
router.put("/status/:id", updateBookingStatus);

module.exports = router;
