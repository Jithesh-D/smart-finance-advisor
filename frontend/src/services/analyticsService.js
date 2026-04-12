/**
 * Analytics Service
 * Handles all API calls related to analytics and charts
 */

import axiosInstance from "./authService";

/**
 * Get category-wise expense breakdown
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 */
const getCategoryWiseExpenses = async (month = null, year = null) => {
  try {
    const params = {};
    if (month && year) {
      params.month = month;
      params.year = year;
    }
    const response = await axiosInstance.get("/analytics/category-wise", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching category-wise expenses:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get monthly expense breakdown
 * @param {number} months - Number of months to fetch (default 6)
 */
const getMonthlyExpenses = async (months = 6) => {
  try {
    const response = await axiosInstance.get("/analytics/monthly", {
      params: { months },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly expenses:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get spending trends
 */
const getSpendingTrends = async () => {
  try {
    const response = await axiosInstance.get("/analytics/trends");
    return response.data;
  } catch (error) {
    console.error("Error fetching spending trends:", error);
    throw error.response?.data || error.message;
  }
};

export { getCategoryWiseExpenses, getMonthlyExpenses, getSpendingTrends };
