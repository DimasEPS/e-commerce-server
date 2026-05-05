const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  phone: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  province: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
