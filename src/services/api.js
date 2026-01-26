
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    };

    const axiosConfig = {
      url,
      method: options.method || 'GET',
      headers,
      data: options.body ? JSON.parse(options.body) : undefined,
      params: options.params,
    };

    try {
      const response = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        throw new Error(error.response.data?.message || error.response.statusText || 'Request failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server');
      } else {
        // Something else happened
        throw new Error(error.message || 'Request failed');
      }
    }
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Events
  async getEvents(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/events${query}`);
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async getEventTiers(eventId) {
    return this.request(`/events/${eventId}/tiers`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async createTier(eventId, tierData) {
    return this.request(`/events/${eventId}/tiers`, {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
  }

  async updateTier(eventId, tierId, tierData) {
    return this.request(`/events/${eventId}/tiers/${tierId}`, {
      method: 'PUT',
      body: JSON.stringify(tierData),
    });
  }

  async deleteTier(eventId, tierId) {
    return this.request(`/events/${eventId}/tiers/${tierId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async checkout(checkoutData) {
    return this.request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  async adoptTickets(adoptData) {
    return this.request('/orders/adopt', {
      method: 'POST',
      body: JSON.stringify(adoptData),
    });
  }

  async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders?${queryString}`);
  }

  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${queryString}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserStatus(userId, is_active) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  }

  // Payments
  async initiatePayment(orderId, paymentData) {
    return this.request(`/payments/initiate/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(orderId) {
    return this.request(`/payments/status/${orderId}`);
  }

  async verifyPaystack(reference) {
    return this.request(`/payments/paystack/verify/${reference}`);
  }

  // Tickets & Scanning
  async getMyTickets() {
    return this.request('/tickets/my-tickets');
  }

  async getTicket(ticketId) {
    return this.request(`/tickets/${ticketId}`);
  }

  async getTicketQRCode(ticketId) {
    return this.request(`/tickets/${ticketId}/qr-code`);
  }

  async checkInTicket(qrHash) {
    return this.request('/tickets/check-in', {
      method: 'POST',
      body: JSON.stringify({ qrHash }),
    });
  }

  async getScannerStats() {
    return this.request('/tickets/scanner/stats');
  }

  // Lottery
  async enterLottery(eventId) {
    return this.request(`/lottery/enter/${eventId}`, {
      method: 'POST',
    });
  }

  async runLotteryDraw(eventId) {
    return this.request(`/lottery/draw/${eventId}`, {
      method: 'POST',
    });
  }

  async getLotteryWinners(eventId) {
    return this.request(`/lottery/event/${eventId}/winners`);
  }

  async getLotteryStats(eventId) {
    return this.request(`/lottery/event/${eventId}/stats`);
  }

  async getMyLotteryEntries() {
    return this.request('/lottery/my-entries');
  }

  async checkLotteryEligibility(eventId) {
    return this.request(`/lottery/eligible/${eventId}`);
  }

  // Users
  async getProfile() {
    return this.request('/auth/me');
  }
}

export const api = new ApiService();
export default api;
