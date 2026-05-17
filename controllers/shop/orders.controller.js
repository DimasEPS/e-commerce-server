const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Booking = require("../../models/Booking");
const snap = require("../../config/midtrans");

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

// Create order from cart + generate Midtrans Snap token
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

    // Normalize shippingAddress: FE may send 'street' instead of 'address'
    const normalizedAddress = {
      name: shippingAddress?.name || "",
      phone: shippingAddress?.phone || "",
      address: shippingAddress?.address || shippingAddress?.street || "",
      city: shippingAddress?.city || "",
      province: shippingAddress?.province || "",
      postalCode: shippingAddress?.postalCode || "",
    };

    const order = new Order({
      userId: req.user.id,
      items,
      shippingAddress: normalizedAddress,
      shippingMethod: shippingMethod || {},
      paymentMethod: paymentMethod || "qris",
      subtotal,
      shippingCost,
      total,
    });

    await order.save();

    // Generate Midtrans Snap token
    let snapToken = "";
    let snapRedirectUrl = "";

    try {
      const midtransItems = items.map((i) => ({
        id: i.productId.toString(),
        price: i.price,
        quantity: i.qty,
        name: i.title.substring(0, 50), // Midtrans max 50 chars
      }));

      // Add shipping as an item if present
      if (shippingCost > 0) {
        midtransItems.push({
          id: "SHIPPING",
          price: shippingCost,
          quantity: 1,
          name: shippingMethod?.label || "Ongkos Kirim",
        });
      }

      const midtransParams = {
        transaction_details: {
          order_id: order._id.toString(),
          gross_amount: total,
        },
        item_details: midtransItems,
        customer_details: {
          first_name: normalizedAddress.name,
          phone: normalizedAddress.phone,
          shipping_address: {
            first_name: normalizedAddress.name,
            phone: normalizedAddress.phone,
            address: normalizedAddress.address,
            city: normalizedAddress.city,
            postal_code: normalizedAddress.postalCode,
          },
        },
      };

      const snapResponse = await snap.createTransaction(midtransParams);
      snapToken = snapResponse.token;
      snapRedirectUrl = snapResponse.redirect_url;

      // Save token to order
      order.midtransToken = snapToken;
      order.midtransRedirectUrl = snapRedirectUrl;
      await order.save();
    } catch (midtransError) {
      console.log("Midtrans token generation failed:", midtransError.message);
      // Order is still created, payment can be retried
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
      snapToken,
      snapRedirectUrl,
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

// Midtrans Webhook / Notification handler
const handleMidtransWebhook = async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let isOrder = true;
    let document = await Order.findById(orderId);
    
    if (!document) {
      document = await Booking.findById(orderId);
      isOrder = false;
    }

    if (!document) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Map Midtrans statuses
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept" || !fraudStatus) {
        document.status = "confirmed";
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Restore stock on payment failure if it's an order
      if (isOrder && document.status === "pending") {
        for (const item of document.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.qty, sold: -item.qty },
          });
        }
      }
      document.status = "cancelled";
    } else if (transactionStatus === "pending") {
      document.status = "pending";
    }

    await document.save();
    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (e) {
    console.log("Error in handleMidtransWebhook:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  handleMidtransWebhook,
};
