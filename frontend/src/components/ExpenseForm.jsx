import React, { useState } from "react";

const ExpenseForm = ({ onAddTransaction }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "Food",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Healthcare",
    "Education",
    "Other",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    await onAddTransaction(transactionData);

    // Reset form
    setFormData({
      amount: "",
      description: "",
      category: "Food",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    });
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h3>Add Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
