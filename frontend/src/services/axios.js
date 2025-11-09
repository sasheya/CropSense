import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api", // Change to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to true if using cookies alongside JWT
});

// Request interceptor - Add JWT token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401 errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If error is 401 and we haven't tried to refresh yet
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(error);
        }
        const response = await axios.post(
          "http://localhost:8000/api/accounts/token/refresh/",
          { refresh: refreshToken }
        );

        if (response.data.access) {
          // Update token in localStorage
          localStorage.setItem("token", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`; // Update the failed request with new token
          return API(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("token"); // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
