const API_BASE_URL = 'https://learnify.runasp.net/api/Auth';

export const api = {
  async fetchUserDetails() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/GetUserdetails`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async updateUserDetails(formData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/UpdateUser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Update failed');
        error.statusCode = response.status;
        error.details = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update error:', {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      });
      throw error;
    }
  }
};

export const imageUtils = {
  validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPG, PNG, and GIF images are allowed'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB'
      };
    }

    return { isValid: true };
  },

  async createImageUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  generateCacheBustingUrl(url) {
    if (!url) return '';
    const timestamp = new Date().getTime();
    return `${url}?v=${timestamp}`;
  }
};