/**
 * Insights Component
 * Displays smart insights and recommendations based on transaction data
 */

import React, { useState, useEffect } from "react";
import { generateInsights } from "../services/insightService";

const Insights = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  const fetchInsights = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await generateInsights();
      if (response.success) {
        setInsights(response.data.insights);
        setSummary(response.data.summary);
      }
    } catch (err) {
      setError("Failed to generate insights");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "success":
        return "🎉";
      case "warning":
        return "⚠️";
      case "danger":
        return "🚨";
      case "info":
        return "💡";
      default:
        return "📊";
    }
  };

  const getClassForType = (type) => {
    switch (type) {
      case "success":
        return "insight-success";
      case "warning":
        return "insight-warning";
      case "danger":
        return "insight-danger";
      case "info":
        return "insight-info";
      default:
        return "insight-default";
    }
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <p>🤔 Analyzing your finances...</p>
      </div>
    );
  }

  return (
    <div className="insights-section">
      <div className="insights-header" onClick={() => setExpanded(!expanded)}>
        <h3>💡 Smart Insights</h3>
        <button className="expand-btn">{expanded ? "▼" : "▶"}</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Summary Cards */}
      {summary && expanded && (
        <div className="insights-summary">
          <div className="summary-card">
            <div className="summary-label">Total Income</div>
            <div className="summary-value income">
              ${summary.totalIncome.toFixed(2)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Expenses</div>
            <div className="summary-value expense">
              ${summary.totalExpense.toFixed(2)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Savings</div>
            <div
              className={`summary-value ${summary.savings >= 0 ? "positive" : "negative"}`}
            >
              ${summary.savings.toFixed(2)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Savings Rate</div>
            <div
              className={`summary-value ${summary.savingsRate >= 20 ? "positive" : "warning"}`}
            >
              {summary.savingsRate}%
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Transactions</div>
            <div className="summary-value">{summary.transactionCount}</div>
          </div>
        </div>
      )}

      {/* Insights List */}
      {expanded && (
        <div className="insights-list">
          {insights.length === 0 ? (
            <div className="no-insights">
              <p>
                ✨ No insights available yet. Add more transactions to get
                personalized insights!
              </p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className={`insight-card ${getClassForType(insight.type)}`}
              >
                <div className="insight-icon">
                  {getIconForType(insight.type)}
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                  {insight.priority && (
                    <span
                      className={`priority-badge priority-${insight.priority}`}
                    >
                      {insight.priority === "high"
                        ? "🔴 High Priority"
                        : insight.priority === "medium"
                          ? "🟡 Medium Priority"
                          : "🟢 Low Priority"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchInsights}
        className="btn-refresh"
        disabled={loading}
      >
        🔄 Refresh Insights
      </button>
    </div>
  );
};

export default Insights;
