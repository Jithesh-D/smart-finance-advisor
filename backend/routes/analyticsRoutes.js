/**
 * Analytics Routes
 * Routes for all analytics-related endpoints
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getCategoryWiseExpenses,
  getMonthlyExpenses,
  getSpendingTrends,
} = require("../controllers/analyticsController");

// All analytics routes are protected (require authentication)
router.use(protect);

// Get category-wise expense breakdown
router.get("/category-wise", getCategoryWiseExpenses);

// Get monthly expense breakdown
router.get("/monthly", getMonthlyExpenses);

// Get spending trends
router.get("/trends", getSpendingTrends);

module.exports = router;
