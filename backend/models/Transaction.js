const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    trim: true,
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
  },
  type: {
    type: String,
    required: [true, "Please specify transaction type"],
    enum: ["income", "expense"],
    default: "expense",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
