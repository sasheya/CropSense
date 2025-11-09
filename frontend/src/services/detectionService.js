import API from "../api/axios";

const API_BASE_URL = "/detection";

const detectionService = {
  // Detect disease from image
  detectDisease: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await API.post(`${API_BASE_URL}/detect/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get detection history
  getHistory: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/history/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific detection
  getDetection: async (detectionId) => {
    try {
      const response = await API.get(`${API_BASE_URL}/history/${detectionId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete detection
  deleteDetection: async (detectionId) => {
    try {
      const response = await API.delete(
        `${API_BASE_URL}/history/${detectionId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all diseases
  getDiseases: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/diseases/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific disease details
  getDisease: async (diseaseId) => {
    try {
      const response = await API.get(`${API_BASE_URL}/diseases/${diseaseId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get detection statistics
  getStatistics: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/statistics/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default detectionService;
