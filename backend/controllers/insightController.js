/**
 * Insights Controller
 * Generates smart insights by comparing current vs previous transactions
 */

const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

/**
 * Generate smart insights based on transaction history
 * @route GET /api/insights/generate
 * @access Private
 */
const generateInsights = async (req, res) => {
  try {
    const insights = [];

    // Get current month and previous month data
    const currentDate = new Date();
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
    const previousMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );

    // Fetch transactions for current and previous month
    const [currentMonthTransactions, previousMonthTransactions, budgets] =
      await Promise.all([
        Transaction.find({
          user: req.user._id,
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        }),
        Transaction.find({
          user: req.user._id,
          date: { $gte: previousMonthStart, $lte: previousMonthEnd },
        }),
        Budget.find({ user: req.user._id }),
      ]);

    // Calculate totals
    const currentIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const previousIncome = previousMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpense = previousMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Insight 1: Compare total spending
    const expenseChange =
      ((currentExpense - previousExpense) / previousExpense) * 100;
    if (expenseChange > 10) {
      insights.push({
        type: "warning",
        title: "⚠️ Spending Alert",
        message: `Your spending has increased by ${expenseChange.toFixed(1)}% compared to last month. Consider reviewing your expenses.`,
        priority: "high",
      });
    } else if (expenseChange < -10) {
      insights.push({
        type: "success",
        title: "🎉 Great Job!",
        message: `You've reduced your spending by ${Math.abs(expenseChange).toFixed(1)}% compared to last month. Keep it up!`,
        priority: "low",
      });
    }

    // Insight 2: Find highest spending category
    const categorySpending = {};
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categorySpending[t.category] =
          (categorySpending[t.category] || 0) + t.amount;
      });

    let highestCategory = { category: null, amount: 0 };
    for (const [category, amount] of Object.entries(categorySpending)) {
      if (amount > highestCategory.amount) {
        highestCategory = { category, amount };
      }
    }

    if (highestCategory.category) {
      insights.push({
        type: "info",
        title: "💰 Top Spending Category",
        message: `Your highest spending this month is on ${highestCategory.category} ($${highestCategory.amount.toFixed(2)}).`,
        priority: "medium",
      });
    }

    // Insight 3: Budget alerts
    for (const budget of budgets) {
      const spent = categorySpending[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;

      if (percentage >= 100) {
        insights.push({
          type: "danger",
          title: `🚨 Budget Exceeded: ${budget.category}`,
          message: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}.`,
          priority: "high",
        });
      } else if (percentage >= 80) {
        insights.push({
          type: "warning",
          title: `⚠️ Budget Alert: ${budget.category}`,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. ${(budget.amount - spent).toFixed(2)} remaining.`,
          priority: "medium",
        });
      }
    }

    // Insight 4: Income vs Expense ratio
    const savingsRate =
      ((currentIncome - currentExpense) / currentIncome) * 100;
    if (savingsRate < 10 && currentIncome > 0) {
      insights.push({
        type: "warning",
        title: "💡 Savings Tip",
        message: `Your savings rate is only ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income.`,
        priority: "medium",
      });
    } else if (savingsRate > 20) {
      insights.push({
        type: "success",
        title: "🌟 Excellent Savings!",
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. You're on the right track!`,
        priority: "low",
      });
    }

    // Insight 5: Frequent small transactions
    const smallTransactions = currentMonthTransactions.filter(
      (t) => t.type === "expense" && t.amount < 20,
    ).length;

    if (smallTransactions > 15) {
      insights.push({
        type: "info",
        title: "💸 Small Expenses Add Up",
        message: `You have ${smallTransactions} small transactions (<$20) this month. These can add up quickly!`,
        priority: "low",
      });
    }

    // Insight 6: Unusual spending patterns (spike detection)
    const averageDailySpending = currentExpense / 30;
    const highSpendingDays = [];

    const dailySpending = {};
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const day = t.date.getDate();
        dailySpending[day] = (dailySpending[day] || 0) + t.amount;
      });

    for (const [day, amount] of Object.entries(dailySpending)) {
      if (amount > averageDailySpending * 2) {
        highSpendingDays.push(day);
      }
    }

    if (highSpendingDays.length > 0) {
      insights.push({
        type: "info",
        title: "📊 Spending Spike Detected",
        message: `Unusually high spending detected on day(s) ${highSpendingDays.join(", ")}. Check your transactions for these dates.`,
        priority: "low",
      });
    }

    // Sort insights by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    insights.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
    );

    res.status(200).json({
      success: true,
      data: {
        insights,
        summary: {
          totalIncome: currentIncome,
          totalExpense: currentExpense,
          savings: currentIncome - currentExpense,
          savingsRate: savingsRate.toFixed(1),
          transactionCount: currentMonthTransactions.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in generateInsights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate insights",
      error: error.message,
    });
  }
};

/**
 * Get spending comparison between two periods
 * @route GET /api/insights/compare
 * @access Private
 */
const getSpendingComparison = async (req, res) => {
  try {
    const { period1 = "current_month", period2 = "previous_month" } = req.query;

    // Define date ranges based on period parameters
    const getDateRange = (period) => {
      const now = new Date();
      switch (period) {
        case "current_month":
          return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
        case "previous_month":
          return {
            start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            end: new Date(now.getFullYear(), now.getMonth(), 0),
          };
        case "last_3_months":
          return {
            start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
            end: now,
          };
        case "last_6_months":
          return {
            start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
            end: now,
          };
        default:
          return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
      }
    };

    const range1 = getDateRange(period1);
    const range2 = getDateRange(period2);

    const [data1, data2] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: range1.start, $lte: range1.end },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: range2.start, $lte: range2.end },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const formatData = (data) => {
      const income = data.find((d) => d._id === "income")?.total || 0;
      const expense = data.find((d) => d._id === "expense")?.total || 0;
      return { income, expense, savings: income - expense };
    };

    res.status(200).json({
      success: true,
      data: {
        period1: { name: period1, ...formatData(data1) },
        period2: { name: period2, ...formatData(data2) },
        comparison: {
          expenseChange: (
            ((formatData(data1).expense - formatData(data2).expense) /
              formatData(data2).expense) *
            100
          ).toFixed(2),
          incomeChange: (
            ((formatData(data1).income - formatData(data2).income) /
              formatData(data2).income) *
            100
          ).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("Error in getSpendingComparison:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get spending comparison",
      error: error.message,
    });
  }
};

module.exports = {
  generateInsights,
  getSpendingComparison,
};
