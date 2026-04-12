const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: [
      "Food",
      "Transport",
      "Entertainment",
      "Shopping",
      "Bills",
      "Healthcare",
      "Education",
      "Other",
    ],
    unique: true,
  },
  amount: {
    type: Number,
    required: [true, "Please add budget amount"],
    min: 0,
  },
  month: {
    type: Number,
    required: true,
    default: new Date().getMonth(),
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one budget per category per month for a user
BudgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true },
);

module.exports = mongoose.model("Budget", BudgetSchema);
