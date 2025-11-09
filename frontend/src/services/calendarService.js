import API from "../api/axios";

const API_BASE_URL = "/calendar";

const calendarService = {
  // Get all events
  getEvents: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single event
  getEvent: async (eventId) => {
    try {
      const response = await API.get(`${API_BASE_URL}/${eventId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      // Format date to YYYY-MM-DD if it's a Date object
      const formattedData = {
        title: eventData.title.trim(),
        description: eventData.description?.trim() || "",
        date:
          eventData.date instanceof Date
            ? eventData.date.toISOString().split("T")[0]
            : eventData.date,
      };

      const response = await API.post(`${API_BASE_URL}/`, formattedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    try {
      const formattedData = {
        title: eventData.title.trim(),
        description: eventData.description?.trim() || "",
        date:
          eventData.date instanceof Date
            ? eventData.date.toISOString().split("T")[0]
            : eventData.date,
      };

      const response = await API.put(
        `${API_BASE_URL}/${eventId}/`,
        formattedData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Partial update event
  patchEvent: async (eventId, eventData) => {
    try {
      const response = await API.patch(
        `${API_BASE_URL}/${eventId}/`,
        eventData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    try {
      const response = await API.delete(`${API_BASE_URL}/${eventId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get events for specific date range
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      const response = await API.get(`${API_BASE_URL}/`, {
        params: {
          start_date:
            startDate instanceof Date
              ? startDate.toISOString().split("T")[0]
              : startDate,
          end_date:
            endDate instanceof Date
              ? endDate.toISOString().split("T")[0]
              : endDate,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default calendarService;
