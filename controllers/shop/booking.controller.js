const Booking = require("../../models/Booking");
const snap = require("../../config/midtrans");

// Get user's bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: bookings });
  } catch (e) {
    console.log("Error in getBookings:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const {
      service,
      date,
      time,
      petName,
      petType,
      petAge,
      petWeight,
      ownerName,
      phone,
      notes,
      price,
    } = req.body;

    // Check for duplicate booking on same date/time
    const existing = await Booking.findOne({
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Time slot is already booked",
      });
    }

    const booking = new Booking({
      userId: req.user.id,
      service,
      date,
      time,
      petName,
      petType,
      petAge: petAge || "",
      petWeight: petWeight || "",
      ownerName,
      phone,
      notes: notes || "",
      price: price || 0,
    });

    await booking.save();

    // Generate Midtrans Snap token
    let snapToken = "";
    let snapRedirectUrl = "";

    try {
      const midtransParams = {
        transaction_details: {
          order_id: booking._id.toString(),
          gross_amount: booking.price,
        },
        item_details: [
          {
            id: `SVC-${booking.service}`,
            price: booking.price,
            quantity: 1,
            name: `Grooming: ${booking.service}`.substring(0, 50),
          }
        ],
        customer_details: {
          first_name: booking.ownerName,
          phone: booking.phone,
        },
      };

      const snapResponse = await snap.createTransaction(midtransParams);
      snapToken = snapResponse.token;
      snapRedirectUrl = snapResponse.redirect_url;

      // Save token to booking
      booking.midtransToken = snapToken;
      booking.midtransRedirectUrl = snapRedirectUrl;
      await booking.save();
    } catch (midtransError) {
      console.log("Midtrans token generation failed:", midtransError.message);
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
      snapToken,
      snapRedirectUrl,
    });

  } catch (e) {
    console.log("Error in createBooking:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (e) {
    console.log("Error in cancelBooking:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get booked slots for a date (public - no auth needed)
const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const bookings = await Booking.find({
      date,
      status: { $in: ["pending", "confirmed"] },
    }).select("time");

    const bookedTimes = bookings.map((b) => b.time);
    res.status(200).json({ success: true, data: bookedTimes });
  } catch (e) {
    console.log("Error in getBookedSlots:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getBookings, createBooking, cancelBooking, getBookedSlots };
