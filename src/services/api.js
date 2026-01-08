/**
 * API Service for Booking Engine
 * Replaces localStorage with REST API calls
 */

import { API_BASE_URL, paths } from '../config/paths.ts';

// Using centralized API configuration from paths.ts
// Production-ready API configuration
// Production: Uses https://api.rumahdaisycantik.com
const ADMIN_API_BASE_URL = `${API_BASE_URL}/admin`; // Relative to main API base

class ApiService {
  // Rooms API
  static async getRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms.php`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  static async getRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms.php?id=${roomId}`);
      if (!response.ok) throw new Error('Failed to fetch room');
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  }

  // Bookings API
  static async getBookings(searchTerm = '') {
    try {
      const url = searchTerm 
        ? `${API_BASE_URL}/bookings.php?search=${encodeURIComponent(searchTerm)}`
        : `${API_BASE_URL}/bookings.php`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  static async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: bookingData.roomId,
          check_in: bookingData.from,
          check_out: bookingData.to,
          guests: bookingData.guests,
          first_name: bookingData.user.firstName,
          last_name: bookingData.user.lastName,
          email: bookingData.user.email,
          phone: bookingData.user.phone || '',
          total_amount: bookingData.total
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      return result.success ? result.data : result;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async checkAvailability(roomId, checkIn, checkOut) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings.php?action=availability&room_id=${roomId}&check_in=${checkIn}&check_out=${checkOut}`
      );
      if (!response.ok) throw new Error('Failed to check availability');
      const result = await response.json();
      return result.success ? result.data : result;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  // Admin API (requires authentication)
  static async adminRequest(endpoint, options = {}) {
    const credentials = btoa('admin:admin123'); // Base64 encode credentials
    
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Admin API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Admin API error:', error);
      throw error;
    }
  }

  static async getAdminDashboard() {
    return this.adminRequest('dashboard');
  }

  static async getAdminBookings(searchTerm = '') {
    const endpoint = searchTerm 
      ? `bookings?search=${encodeURIComponent(searchTerm)}`
      : 'bookings';
    return this.adminRequest(endpoint);
  }

  static async deleteBooking(bookingId) {
    return this.adminRequest(`bookings/${bookingId}`, {
      method: 'DELETE'
    });
  }

  static async clearAllBookings() {
    return this.adminRequest('clear-all', {
      method: 'DELETE'
    });
  }

  static async updateBookingStatus(bookingId, status) {
    return this.adminRequest(`bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Admin Room Management
  static async createRoom(roomData) {
    return this.adminRequest('rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  static async updateRoom(roomId, roomData) {
    return this.adminRequest(`rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  static async deleteRoom(roomId) {
    return this.adminRequest(`rooms/${roomId}`, {
      method: 'DELETE'
    });
  }
}

export default ApiService;