import API from "../api/axios";

const API_BASE_URL = "/weather";

const weatherService = {
  // Weather
  getCurrentWeather: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_BASE_URL}/current/?${queryParams}`
        : `${API_BASE_URL}/current/`;
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getWeatherForecast: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_BASE_URL}/forecast/?${queryParams}`
        : `${API_BASE_URL}/forecast/`;
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Farm Locations
  getLocations: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/locations/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createLocation: async (locationData) => {
    try {
      // Format data to match backend expectations
      const formattedData = {
        name: locationData.name,
        city: locationData.city,
        latitude: locationData.latitude
          ? parseFloat(locationData.latitude)
          : null,
        longitude: locationData.longitude
          ? parseFloat(locationData.longitude)
          : null,
        is_default: locationData.is_default || false,
      };

      // Remove null values
      Object.keys(formattedData).forEach((key) => {
        if (formattedData[key] === null || formattedData[key] === "") {
          delete formattedData[key];
        }
      });

      const response = await API.post(
        `${API_BASE_URL}/locations/`,
        formattedData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateLocation: async (locationId, locationData) => {
    try {
      const response = await API.put(
        `${API_BASE_URL}/locations/${locationId}/`,
        locationData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteLocation: async (locationId) => {
    try {
      const response = await API.delete(
        `${API_BASE_URL}/locations/${locationId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  setDefaultLocation: async (locationId) => {
    try {
      const response = await API.post(
        `${API_BASE_URL}/locations/${locationId}/set-default/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default weatherService;
