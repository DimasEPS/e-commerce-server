const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: { type: String, required: true },
        image: { type: String, default: "" },
        emoji: { type: String, default: "" },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    shippingMethod: {
      label: { type: String, default: "" },
      price: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      default: "qris",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
