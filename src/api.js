// API helper functions
const API_URL = window.API_URL || 'http://localhost:3000';

export const api = {
  // Helper to make API calls
  async fetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response;
  },

  // Get API URL
  getUrl(endpoint = '') {
    return `${API_URL}${endpoint}`;
  }
};

// Export API_URL for direct use
export { API_URL };
