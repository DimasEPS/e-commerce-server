const express = require("express");
const {
  getAllUsers,
  deleteUser,
  getDashboardStats,
} = require("../../controllers/admin/users.controller");
const authMiddleware = require("../../middlewares/auth/auth.middleware");
const adminMiddleware = require("../../middlewares/admin/admin.middleware");

const router = express.Router();

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware);

router.get("/get", getAllUsers);
router.delete("/delete/:id", deleteUser);
router.get("/dashboard", getDashboardStats);

module.exports = router;
