import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};

const transactionService = {
  getAll: async () => {
    const response = await axiosInstance.get("/transactions");
    return response.data;
  },

  create: async (transactionData) => {
    const response = await axiosInstance.post("/transactions", transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const response = await axiosInstance.put(
      `/transactions/${id}`,
      transactionData,
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/transactions/${id}`);
    return response.data;
  },

  getSummary: async () => {
    const response = await axiosInstance.get("/transactions/summary");
    return response.data;
  },
};

const budgetService = {
  getAll: async (month, year) => {
    const params = {};
    if (month !== undefined) params.month = month;
    if (year !== undefined) params.year = year;
    const response = await axiosInstance.get("/budgets", { params });
    return response.data;
  },

  create: async (budgetData) => {
    const response = await axiosInstance.post("/budgets", budgetData);
    return response.data;
  },

  update: async (id, budgetData) => {
    const response = await axiosInstance.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/budgets/${id}`);
    return response.data;
  },
};

export { authService, transactionService, budgetService };
export default axiosInstance;
