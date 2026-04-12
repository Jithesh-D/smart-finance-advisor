import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, transactionService } from "../services/authService";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import Charts from "../components/Charts";
import BudgetCard from "../components/BudgetCard";
import Insights from "../components/Insights";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    fetchTransactions();
  }, [navigate, refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const transactionsRes = await transactionService.getAll();
      setTransactions(transactionsRes.data);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await transactionService.create(transactionData);
      // Trigger refresh for all components
      setRefreshTrigger((prev) => prev + 1);
      setActiveTab("transactions");
    } catch (err) {
      setError("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionService.delete(id);
      // Trigger refresh for all components
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError("Failed to delete transaction");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading && transactions.length === 0) {
    return <div className="container">Loading...</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "budget", label: "Budget", icon: "💰" },
    { id: "insights", label: "Insights", icon: "💡" },
    { id: "transactions", label: "Transactions", icon: "💳" },
  ];

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1>Smart Finance Advisor</h1>
        <div className="navbar-right">
          <span className="welcome-text">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="tab-pane active">
              <h2>Financial Overview</h2>
              <Charts refreshTrigger={refreshTrigger} />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="tab-pane active">
              <h2>Detailed Analytics</h2>
              <Charts refreshTrigger={refreshTrigger} />
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === "budget" && (
            <div className="tab-pane active">
              <h2>Budget Management</h2>
              <BudgetCard refreshTrigger={refreshTrigger} />
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === "insights" && (
            <div className="tab-pane active">
              <h2>Smart Insights</h2>
              <Insights refreshTrigger={refreshTrigger} />
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="tab-pane active">
              <div className="transactions-section">
                <div className="form-section">
                  <h3>Add New Transaction</h3>
                  <ExpenseForm onAddTransaction={handleAddTransaction} />
                </div>
                <div className="list-section">
                  <h3>Recent Transactions</h3>
                  <ExpenseList
                    transactions={transactions}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
