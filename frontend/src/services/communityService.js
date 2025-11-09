import API from "../api/axios";

const API_BASE_URL = "/community";

const communityService = {
  // Posts
  getPosts: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/posts/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPost: async (postId) => {
    try {
      const response = await API.get(`${API_BASE_URL}/posts/${postId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createPost: async (postData) => {
    try {
      // Ensure data matches backend expectations (title and content only)
      const formattedData = {
        title: postData.title.trim(),
        content: postData.content.trim(),
      };

      const response = await API.post(`${API_BASE_URL}/posts/`, formattedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const formattedData = {
        title: postData.title.trim(),
        content: postData.content.trim(),
      };

      const response = await API.put(
        `${API_BASE_URL}/posts/${postId}/`,
        formattedData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await API.delete(`${API_BASE_URL}/posts/${postId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyPosts: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/posts/my/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchPosts: async (query) => {
    try {
      const response = await API.get(
        `${API_BASE_URL}/posts/search/?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Comments
  getComments: async (postId) => {
    try {
      const response = await API.get(
        `${API_BASE_URL}/posts/${postId}/comments/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await API.post(
        `${API_BASE_URL}/posts/${postId}/comments/`,
        {
          content: content.trim(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateComment: async (commentId, content) => {
    try {
      const response = await API.put(`${API_BASE_URL}/comments/${commentId}/`, {
        content: content.trim(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await API.delete(
        `${API_BASE_URL}/comments/${commentId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Statistics
  getStatistics: async () => {
    try {
      const response = await API.get(`${API_BASE_URL}/statistics/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default communityService;
