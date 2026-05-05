const Wishlist = require("../../models/Wishlist");

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate(
      "products"
    );
    if (!wishlist) {
      wishlist = { products: [] };
    }
    res.status(200).json({ success: true, data: wishlist });
  } catch (e) {
    console.log("Error in getWishlist:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Toggle product in wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [productId] });
      await wishlist.save();
      const populated = await Wishlist.findById(wishlist._id).populate(
        "products"
      );
      return res.status(200).json({
        success: true,
        message: "Added to wishlist",
        added: true,
        data: populated,
      });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();
      const populated = await Wishlist.findById(wishlist._id).populate(
        "products"
      );
      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        added: false,
        data: populated,
      });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      const populated = await Wishlist.findById(wishlist._id).populate(
        "products"
      );
      return res.status(200).json({
        success: true,
        message: "Added to wishlist",
        added: true,
        data: populated,
      });
    }
  } catch (e) {
    console.log("Error in toggleWishlist:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getWishlist, toggleWishlist };
