const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Get user's orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log("Error in getOrders:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log("Error in getOrderById:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, shippingMethod, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty" });
    }

    // Build order items from cart
    const items = cart.items.map((item) => ({
      productId: item.productId._id,
      title: item.productId.title,
      image: item.productId.image || "",
      emoji: item.productId.emoji || "",
      price: item.productId.price,
      qty: item.qty,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = shippingMethod?.price || 0;
    const total = subtotal + shippingCost;

    // Decrease stock
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Stok "${product.title}" tidak cukup (sisa: ${product.stock})`,
        });
      }
    }

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.qty, sold: item.qty },
      });
    }

    const order = new Order({
      userId: req.user.id,
      items,
      shippingAddress,
      shippingMethod: shippingMethod || {},
      paymentMethod: paymentMethod || "qris",
      subtotal,
      shippingCost,
      total,
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (e) {
    console.log("Error in createOrder:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty, sold: -item.qty },
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (e) {
    console.log("Error in cancelOrder:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getOrders, getOrderById, createOrder, cancelOrder };
