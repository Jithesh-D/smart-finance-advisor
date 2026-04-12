/**
 * Charts Component
 * Displays pie chart for category-wise expenses and bar chart for monthly expenses
 */

import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import {
  getCategoryWiseExpenses,
  getMonthlyExpenses,
} from "../services/analyticsService";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

const Charts = ({ refreshTrigger }) => {
  const [categoryData, setCategoryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Color palette for charts
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#C9CBCF",
    "#7CFFB2",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
  ];

  useEffect(() => {
    fetchChartData();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const fetchChartData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch both category and monthly data in parallel
      const [categoryRes, monthlyRes] = await Promise.all([
        getCategoryWiseExpenses(selectedMonth, selectedYear).catch((err) => ({
          success: false,
          error: err,
        })),
        getMonthlyExpenses(6).catch((err) => ({
          success: false,
          error: err,
        })),
      ]);

      console.log("Category Response:", categoryRes);
      console.log("Monthly Response:", monthlyRes);

      // Process category data for pie chart
      if (categoryRes?.success && categoryRes?.data?.categories?.length > 0) {
        const categories = categoryRes.data.categories;
        setCategoryData({
          labels: categories.map((cat) => cat.category),
          datasets: [
            {
              data: categories.map((cat) => cat.totalAmount),
              backgroundColor: colors.slice(0, categories.length),
              borderWidth: 1,
            },
          ],
        });
      } else {
        setCategoryData(null);
      }

      // Process monthly data for bar chart
      if (
        monthlyRes?.success &&
        monthlyRes?.data?.monthlyBreakdown?.length > 0
      ) {
        const monthly = monthlyRes.data.monthlyBreakdown;
        setMonthlyData({
          labels: monthly.map((m) => `${m.monthName} ${m.year}`),
          datasets: [
            {
              label: "Expenses",
              data: monthly.map((m) => m.totalAmount),
              backgroundColor: "#FF6384",
              borderColor: "#FF6384",
              borderWidth: 1,
            },
            {
              label: "Income",
              data: monthly.map((m) => m.totalIncome),
              backgroundColor: "#36A2EB",
              borderColor: "#36A2EB",
              borderWidth: 1,
            },
            {
              label: "Savings",
              data: monthly.map((m) => (m.savings > 0 ? m.savings : 0)),
              backgroundColor: "#4BC0C0",
              borderColor: "#4BC0C0",
              borderWidth: 1,
            },
          ],
        });
      } else {
        setMonthlyData(null);
      }
    } catch (err) {
      console.error("Chart fetch error:", err);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="chart-loading">
        <p>Loading charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container">
        <div className="error-message">{error}</div>
        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          Charts will display once you have expense data.
        </p>
      </div>
    );
  }

  return (
    <div className="charts-container">
      {error && <div className="error-message">{error}</div>}

      {/* Month/Year Filter for Category Chart */}
      <div className="chart-filter">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          <option value={1}>January</option>
          <option value={2}>February</option>
          <option value={3}>March</option>
          <option value={4}>April</option>
          <option value={5}>May</option>
          <option value={6}>June</option>
          <option value={7}>July</option>
          <option value={8}>August</option>
          <option value={9}>September</option>
          <option value={10}>October</option>
          <option value={11}>November</option>
          <option value={12}>December</option>
        </select>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          min="2020"
          max="2030"
        />
        <button onClick={fetchChartData} className="btn-small">
          Update
        </button>
      </div>

      {/* Pie Chart - Category-wise Expenses */}
      <div className="chart-card">
        <h3>Category-wise Expenses</h3>
        {categoryData ? (
          <div className="pie-chart-container">
            <Pie data={categoryData} options={pieChartOptions} />
          </div>
        ) : (
          <p className="no-data">No expense data available for this period</p>
        )}
      </div>

      {/* Bar Chart - Monthly Expenses */}
      <div className="chart-card">
        <h3>Monthly Income vs Expenses</h3>
        {monthlyData ? (
          <div className="bar-chart-container">
            <Bar data={monthlyData} options={barChartOptions} />
          </div>
        ) : (
          <p className="no-data">No monthly data available</p>
        )}
      </div>
    </div>
  );
};

export default Charts;
