const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user.id };

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query);

    // Get current spending for each budget category
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth();
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: "expense",
      date: { $gte: startDate, $lte: endDate },
    });

    const budgetsWithSpending = budgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget.toObject(),
        spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100,
      };
    });

    res.status(200).json({
      success: true,
      count: budgetsWithSpending.length,
      data: budgetsWithSpending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    // Check if budget already exists for this category and month
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month: month || new Date().getMonth(),
      year: year || new Date().getFullYear(),
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this category this month",
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount,
      month: month || new Date().getMonth(),
      year: year || new Date().getFullYear(),
    });

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
