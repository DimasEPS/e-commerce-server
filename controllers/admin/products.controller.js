const { imageUploadUtils } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// This function handles the image upload request, converts the image buffer to a base64 string, and uploads it to Cloudinary.
const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:${req.file.mimetype};base64,${b64}`;
    const result = await imageUploadUtils(url);
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      result,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      stock,
    } = req.body;
    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      stock,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log("Error in addProduct:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to fetch all products for admin
const getAllProducts = async (req, res) => {
  try {
    const listofProducts = await Product.find({});
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: listofProducts,
    });
  } catch (e) {
    console.log("Error in fetchAllProducts:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, title, description, brand, price, salePrice, stock } =
      req.body;

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    } else {
      findProduct.image = image || findProduct.image;
      findProduct.title = title || findProduct.title;
      findProduct.description = description || findProduct.description;
      findProduct.category = category || findProduct.category;
      findProduct.brand = brand || findProduct.brand;
      findProduct.price = price || findProduct.price;
      findProduct.salePrice = salePrice || findProduct.salePrice;
      findProduct.stock = stock || findProduct.stock;

      await findProduct.save();
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: findProduct,
      });
    }
  } catch (e) {
    console.log("Error in editProduct:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    } else {
      await Product.findByIdAndDelete(id);
      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    }
  } catch (e) {
    console.log("Error in deleteProduct:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
};
