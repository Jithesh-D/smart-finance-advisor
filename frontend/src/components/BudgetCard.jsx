/**
 * BudgetCard Component
 * Displays budget information with progress bars and management interface
 */

import React, { useState, useEffect } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";

const BudgetCard = ({ refreshTrigger }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: "Food",
    amount: "",
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

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
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchBudgets();
  }, [refreshTrigger]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await getBudgets(formData.month, formData.year);
      if (response.success) {
        setBudgets(response.data);
      }
    } catch (err) {
      setError("Failed to load budgets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: formData.year,
      };

      if (editingBudget) {
        await updateBudget(editingBudget._id, { amount: budgetData.amount });
      } else {
        await createBudget(budgetData);
      }

      resetForm();
      await fetchBudgets();
    } catch (err) {
      setError(err.message || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(id);
        await fetchBudgets();
      } catch (err) {
        setError("Failed to delete budget");
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({
      category: "Food",
      amount: "",
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "#dc3545";
    if (percentage >= 80) return "#ffc107";
    return "#28a745";
  };

  const getStatusText = (percentage, spent, remaining) => {
    if (percentage >= 100)
      return `⚠️ Exceeded by $${Math.abs(remaining).toFixed(2)}`;
    if (percentage >= 80) return `⚠️ ${remaining.toFixed(2)} remaining`;
    return `✅ ${remaining.toFixed(2)} remaining`;
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setFormData({ ...formData, month: newMonth });
    // Refresh budgets when month changes
    setTimeout(() => fetchBudgets(), 100);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setFormData({ ...formData, year: newYear });
    setTimeout(() => fetchBudgets(), 100);
  };

  if (loading && budgets.length === 0) {
    return <div className="budget-loading">Loading budgets...</div>;
  }

  return (
    <div className="budget-section">
      <div className="budget-header">
        <h3>💰 Budget Management</h3>
        <div className="budget-controls">
          <select value={formData.month} onChange={handleMonthChange}>
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={formData.year}
            onChange={handleYearChange}
            min="2020"
            max="2030"
            style={{ width: "80px", marginLeft: "10px" }}
          />
          <button onClick={() => setShowForm(!showForm)} className="btn-add">
            {showForm ? "Cancel" : "+ Add Budget"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Budget Form */}
      {showForm && (
        <div className="budget-form">
          <h4>{editingBudget ? "Edit Budget" : "Create New Budget"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={editingBudget}
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
                <label>Budget Amount ($)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Saving..." : editingBudget ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="no-budgets">
          <p>
            No budgets set for this month. Click "Add Budget" to start tracking!
          </p>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map((budget) => {
            const percentage = Math.min(budget.percentage, 100);
            const progressColor = getProgressColor(percentage);
            const statusText = getStatusText(
              percentage,
              budget.spent,
              budget.remaining,
            );

            return (
              <div key={budget._id} className="budget-card">
                <div className="budget-card-header">
                  <h4>{budget.category}</h4>
                  <div className="budget-actions">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="icon-btn edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="icon-btn delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="amount-item">
                    <span>Budget:</span>
                    <strong>${budget.amount.toFixed(2)}</strong>
                  </div>
                  <div className="amount-item">
                    <span>Spent:</span>
                    <strong style={{ color: "#dc3545" }}>
                      ${budget.spent.toFixed(2)}
                    </strong>
                  </div>
                  <div className="amount-item">
                    <span>Remaining:</span>
                    <strong
                      style={{
                        color: budget.remaining >= 0 ? "#28a745" : "#dc3545",
                      }}
                    >
                      ${budget.remaining.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span className="status">{statusText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
