import API from "../api/axios";

const API_BASE_URL = "/accounts";

const authService = {
  register: async (userData) => {
    try {
      const response = await API.post(`${API_BASE_URL}/register/`, userData);

      // Store tokens if auto-login is enabled
      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await API.post(`${API_BASE_URL}/login/`, credentials);

      // Store JWT tokens
      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        // Blacklist the refresh token on backend
        await API.post(`${API_BASE_URL}/logout/`, {
          refresh: refreshToken,
        });
      }

      // Clear tokens from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");

      return { message: "Logout successful" };
    } catch (error) {
      // Even if backend fails, clear local tokens
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await API.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: refreshToken,
      });

      // Update access token
      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
      }

      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      throw error.response?.data || error.message;
    }
  },

  getMe: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/me/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getProfile: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/profile/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await API.put(`${API_BASE_URL}/profile/`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changePassword: async (passwords) => {
    try {
      const response = await API.post(
        `${API_BASE_URL}/change-password/`,
        passwords
      );

      // Update tokens if new ones are provided
      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await API.delete(`${API_BASE_URL}/delete/`, {
        data: { password },
      });

      // Clear tokens after account deletion
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStatistics: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/statistics/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/me/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Helper function to get stored token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Helper function to get refresh token
  getRefreshToken: () => {
    return localStorage.getItem("refresh_token");
  },
};

export default authService;
