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
// Route to add a new product
router.post("/add", addProduct);
// Route to fetch all products
router.get("/get", getAllProducts);
// Route to edit a product
router.put("/edit/:id", editProduct);
// Route to delete a product
router.delete("/delete/:id", deleteProduct);

module.exports = router;
