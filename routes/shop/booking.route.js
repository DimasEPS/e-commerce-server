const express = require("express");
const {
  getBookings,
  createBooking,
  cancelBooking,
  getBookedSlots,
} = require("../../controllers/shop/booking.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

// Public route - get booked slots for a date
router.get("/slots", getBookedSlots);

// Protected routes
router.use(authMiddleware);
router.get("/", getBookings);
router.post("/", createBooking);
router.put("/:id/cancel", cancelBooking);

module.exports = router;
