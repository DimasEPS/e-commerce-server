const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Get user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    if (!cart) {
      cart = { items: [] };
    }
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (e) {
    console.log("Error in getCart:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const quantity = qty || 1;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += quantity;
    } else {
      cart.items.push({ productId, qty: quantity });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: populated,
    });
  } catch (e) {
    console.log("Error in addToCart:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    if (qty < 1) {
      cart.items.pull(itemId);
    } else {
      item.qty = qty;
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: populated,
    });
  } catch (e) {
    console.log("Error in updateCartItem:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items.pull(itemId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: populated,
    });
  } catch (e) {
    console.log("Error in removeCartItem:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
