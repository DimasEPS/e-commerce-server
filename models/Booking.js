const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    petName: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      enum: ["kucing", "anjing", "kelinci"],
      required: true,
    },
    petAge: {
      type: String,
      default: "",
    },
    petWeight: {
      type: String,
      default: "",
    },
    ownerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    midtransToken: {
      type: String,
      default: "",
    },
    midtransRedirectUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
