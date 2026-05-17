const Booking = require("../../models/Booking");

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("userId", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (e) {
    console.log("Error in admin getAllBookings:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update booking status (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id).populate(
      "userId",
      "userName email"
    );

    res.status(200).json({
      success: true,
      message: `Booking status updated to "${status}"`,
      data: updated,
    });
  } catch (e) {
    console.log("Error in admin updateBookingStatus:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get booking stats
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({});
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      },
    });
  } catch (e) {
    console.log("Error in getBookingStats:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getAllBookings, updateBookingStatus, getBookingStats };
