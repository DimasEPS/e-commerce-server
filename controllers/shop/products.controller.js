const Product = require("../../models/Product");

// Get all products (public) with optional filters
const getProducts = async (req, res) => {
  try {
    const { hewan, search, sort, minPrice, maxPrice } = req.query;
    const filter = {};

    if (hewan) filter.hewan = hewan;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { kat: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    switch (sort) {
      case "harga-asc":
        sortOption = { price: 1 };
        break;
      case "harga-desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "terlaris":
        sortOption = { sold: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log("Error in getProducts:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single product by ID (public)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log("Error in getProductById:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getProducts, getProductById };
