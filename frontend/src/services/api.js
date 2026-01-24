import { API_BASE_URL } from '../config';

class ApiService {
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async createCheckIn(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Check-in failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  async getCheckIns(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/api/checkins${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch check-ins');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch check-ins error:', error);
      throw error;
    }
  }

  async getCheckIn(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkin/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch check-in');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch check-in error:', error);
      throw error;
    }
  }

  async deleteCheckIn(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkin/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete check-in');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete check-in error:', error);
      throw error;
    }
  }

  async getStats(saleName) {
    try {
      const params = saleName ? { saleName } : {};
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/api/stats${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch stats error:', error);
      throw error;
    }
  }

  async getSalesList() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales-list`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch sales list');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch sales list error:', error);
      throw error;
    }
  }
}

export default new ApiService();
