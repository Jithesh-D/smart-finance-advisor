/**
 * Analytics Controller
 * Handles all analytics-related operations including category-wise and monthly expense analysis
 */

const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/**
 * Get category-wise expenses for a specific time period
 * @route GET /api/analytics/category-wise
 * @access Private
 */
const getCategoryWiseExpenses = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { month, year } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month, 1);
      endDate.setHours(0, 0, 0, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    // Aggregation pipeline to group expenses by category
    const categoryWiseData = await Transaction.aggregate([
      {
        $match: {
          user: userId, // Filter by logged-in user
          type: "expense", // Only expenses
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$category", // Group by category
          totalAmount: { $sum: "$amount" }, // Sum of amounts per category
          count: { $sum: 1 }, // Count of transactions per category
        },
      },
      {
        $project: {
          category: "$_id",
          totalAmount: 1,
          count: 1,
          percentage: 0, // Will calculate in frontend
          _id: 0,
        },
      },
      {
        $sort: { totalAmount: -1 }, // Sort by highest spending first
      },
    ]);

    // Calculate total expenses for percentage calculation
    const totalExpenses = categoryWiseData.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        categories: categoryWiseData,
        totalExpenses,
        period: { month, year },
      },
    });
  } catch (error) {
    console.error("Error in getCategoryWiseExpenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category-wise expenses",
      error: error.message,
    });
  }
};

/**
 * Get monthly expenses for the last 6 months or specified range
 * @route GET /api/analytics/monthly
 * @access Private
 */
const getMonthlyExpenses = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { months = 6 } = req.query; // Default to last 6 months
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Calculate date for last N months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    // Aggregation pipeline for monthly expenses
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: "Unknown",
            },
          },
          totalAmount: 1,
          transactionCount: 1,
          _id: 0,
        },
      },
    ]);

    // Also get income data for comparison
    const monthlyIncome = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "income",
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalIncome: { $sum: "$amount" },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalIncome: 1,
          _id: 0,
        },
      },
    ]);

    // Merge expense and income data
    const mergedData = monthlyData.map((expense) => {
      const incomeData = monthlyIncome.find(
        (inc) => inc.year === expense.year && inc.month === expense.month,
      );
      return {
        ...expense,
        totalIncome: incomeData ? incomeData.totalIncome : 0,
        savings:
          (incomeData ? incomeData.totalIncome : 0) - expense.totalAmount,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        monthlyBreakdown: mergedData,
        summary: {
          averageMonthlyExpense:
            mergedData.reduce((sum, item) => sum + item.totalAmount, 0) /
              mergedData.length || 0,
          highestExpenseMonth: mergedData.reduce(
            (max, item) => (item.totalAmount > max.totalAmount ? item : max),
            { totalAmount: 0 },
          ),
          lowestExpenseMonth: mergedData.reduce(
            (min, item) => (item.totalAmount < min.totalAmount ? item : min),
            { totalAmount: Infinity },
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error in getMonthlyExpenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly expenses",
      error: error.message,
    });
  }
};

/**
 * Get spending trends (week over week, month over month)
 * @route GET /api/analytics/trends
 * @access Private
 */
const getSpendingTrends = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1),
    );

    // Get current month expenses
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const currentMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    // Get previous month expenses
    const previousMonthStart = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth(),
      1,
    );
    const previousMonthEnd = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth() + 1,
      0,
    );

    const [currentMonthExpenses, previousMonthExpenses] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: "expense",
            date: { $gte: currentMonthStart, $lte: currentMonthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: "expense",
            date: { $gte: previousMonthStart, $lte: previousMonthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const currentTotal = currentMonthExpenses[0]?.total || 0;
    const previousTotal = previousMonthExpenses[0]?.total || 0;
    const percentageChange =
      previousTotal === 0
        ? 100
        : ((currentTotal - previousTotal) / previousTotal) * 100;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: currentTotal,
        previousMonth: previousTotal,
        percentageChange: percentageChange.toFixed(2),
        trend:
          percentageChange > 0
            ? "increasing"
            : percentageChange < 0
              ? "decreasing"
              : "stable",
      },
    });
  } catch (error) {
    console.error("Error in getSpendingTrends:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch spending trends",
      error: error.message,
    });
  }
};

module.exports = {
  getCategoryWiseExpenses,
  getMonthlyExpenses,
  getSpendingTrends,
};
