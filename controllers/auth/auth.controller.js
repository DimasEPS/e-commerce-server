const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "Email already being used. please use another email!",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      createdAt: new Date(),
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "New account created successfully",
      user: {
        userName: newUser.userName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (e) {
    console.log("error user register: ", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// admin register
const registerAdmin = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "Email alredy being used by another admin",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      userName,
      email,
      password: hashPassword,
      role: "admin",
      createdAt: new Date(),
    });

    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: "New admin account created successfully",
      user: {
        userName: newAdmin.userName,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (e) {
    console.log("error admin register: ", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.json({
        success: false,
        message: "Email/User not found. please register first!",
      });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.json({
        success: false,
        message: "Invalid password. please try again!",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Login successfully",
      user: {
        id: checkUser._id,
        userName: checkUser.userName,
        email: checkUser.email,
        role: checkUser.role,
      },
    });
  } catch (e) {
    console.log("error user login: ", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// logout
const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: false });

    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (e) {
    console.error("Logout error:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

module.exports = { registerUser, registerAdmin, loginUser, logoutUser };
