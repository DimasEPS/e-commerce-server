const Order = require("../../models/Order");
const User = require("../../models/User");

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log("Error in admin getAllOrders:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single order detail (admin)
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "userName email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log("Error in admin getOrderDetail:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Prevent changing status of already cancelled/completed orders
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a cancelled order",
      });
    }

    if (order.status === "completed" && status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a completed order",
      });
    }

    // If cancelling, restore product stock
    if (status === "cancelled" && order.status !== "cancelled") {
      const Product = require("../../models/Product");
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty, sold: -item.qty },
        });
      }
    }

    order.status = status;
    await order.save();

    const updated = await Order.findById(order._id).populate(
      "userId",
      "userName email"
    );

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: updated,
    });
  } catch (e) {
    console.log("Error in admin updateOrderStatus:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get order stats for dashboard
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({
      status: { $in: ["confirmed", "processing"] },
    });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["completed", "shipped", "processing", "confirmed"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
      },
    });
  } catch (e) {
    console.log("Error in getOrderStats:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  getOrderStats,
};
