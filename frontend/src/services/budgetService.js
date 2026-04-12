/**
 * Budget Service
 * Handles all API calls related to budget management
 */

import axiosInstance from "./authService";

/**
 * Get all budgets for the user
 * @param {number} month - Month (0-11)
 * @param {number} year - Year (YYYY)
 */
const getBudgets = async (month = null, year = null) => {
  try {
    const params = {};
    if (month !== null) params.month = month;
    if (year !== null) params.year = year;

    const response = await axiosInstance.get("/budgets", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Create a new budget
 * @param {Object} budgetData - Budget data (category, amount, month, year)
 */
const createBudget = async (budgetData) => {
  try {
    const response = await axiosInstance.post("/budgets", budgetData);
    return response.data;
  } catch (error) {
    console.error("Error creating budget:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update an existing budget
 * @param {string} id - Budget ID
 * @param {Object} budgetData - Updated budget data
 */
const updateBudget = async (id, budgetData) => {
  try {
    const response = await axiosInstance.put(`/budgets/${id}`, budgetData);
    return response.data;
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a budget
 * @param {string} id - Budget ID
 */
const deleteBudget = async (id) => {
  try {
    const response = await axiosInstance.delete(`/budgets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting budget:", error);
    throw error.response?.data || error.message;
  }
};

export { getBudgets, createBudget, updateBudget, deleteBudget };
