const express = require("express");
const {
  handleImageUpload,
  addProduct,
  getAllProducts,
  editProduct,
  deleteProduct,
} = require("../../controllers/admin/products.controller");
const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// Route to handle image upload
router.post("/upload-image", upload.single("imageFile"), handleImageUpload);

// CRUD routes products
router.post("/add", addProduct);
router.get("/get", getAllProducts);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;
