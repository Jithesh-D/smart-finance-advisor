/**
 * Insights Service
 * Handles all API calls related to smart insights
 */

import axiosInstance from "./authService";

/**
 * Generate smart insights based on transaction history
 */
const generateInsights = async () => {
  try {
    const response = await axiosInstance.get("/insights/generate");
    return response.data;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Compare spending between different time periods
 * @param {string} period1 - First period (current_month, previous_month, last_3_months, last_6_months)
 * @param {string} period2 - Second period for comparison
 */
const getSpendingComparison = async (
  period1 = "current_month",
  period2 = "previous_month",
) => {
  try {
    const response = await axiosInstance.get("/insights/compare", {
      params: { period1, period2 },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting spending comparison:", error);
    throw error.response?.data || error.message;
  }
};

export { generateInsights, getSpendingComparison };
