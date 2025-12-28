const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const cloudinaryConfig = require("../config/cloudinary.config");

cloudinaryConfig;

const storage = multer.memoryStorage();

async function imageUploadUtils(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtils };
