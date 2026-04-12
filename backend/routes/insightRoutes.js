/**
 * Insights Routes
 * Routes for all insights-related endpoints
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  generateInsights,
  getSpendingComparison,
} = require("../controllers/insightController");

// All insight routes are protected (require authentication)
router.use(protect);

// Generate smart insights
router.get("/generate", generateInsights);

// Compare spending between periods
router.get("/compare", getSpendingComparison);

module.exports = router;
