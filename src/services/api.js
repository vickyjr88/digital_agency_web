
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

  // Trends
  async getTrends(limit = 3) {
    return this.request(`/trends?limit=${limit}`);
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

  // Billing (Paystack)
  async getBillingPlans() {
    return this.request('/billing/plans');
  }

  async subscribeToPlan(planId, callbackUrl) {
    return this.request('/billing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, callback_url: callbackUrl }),
    });
  }

  async verifyPayment(reference) {
    return this.request(`/billing/verify/${reference}`);
  }

  async getTransactionHistory() {
    return this.request('/billing/transactions');
  }

  async scheduleContent(contentId, scheduledAt) {
    return this.request(`/content/${contentId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    });
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

  async getAdminBrands() {
    return this.request('/admin/brands');
  }

  async getAdminContent() {
    return this.request('/admin/content');
  }

  async getGeneratorFailures() {
    return this.request('/admin/failures');
  }

  // Analytics
  async getAnalyticsDashboard() {
    return this.request('/v2/analytics/dashboard');
  }

  async getRevenueChart(days = 30) {
    return this.request(`/v2/analytics/revenue-chart?days=${days}`);
  }

  async getUserGrowthChart(days = 30) {
    return this.request(`/v2/analytics/users-chart?days=${days}`);
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

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Marketplace & Influencer
  async onboardInfluencer(profileData) {
    return this.request('/v2/influencers/onboard', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getInfluencerProfile(id = 'me') {
    return this.request(`/v2/influencers/${id}`);
  }

  async createPackage(packageData) {
    return this.request('/v2/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async getMyPackages() {
    return this.request('/v2/packages/mine');
  }

  async getPackage(id) {
    return this.request(`/v2/packages/${id}`);
  }

  async getMarketplacePackages(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/v2/packages?${query}`);
  }

  async createCampaign(campaignData) {
    return this.request('/v2/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getMyCampaigns() {
    return this.request('/v2/campaigns/mine');
  }

  // Wallet
  async getWallet() {
    return this.request('/v2/wallet/me');
  }

  async depositWallet(amount, callbackUrl) {
    return this.request('/v2/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, callback_url: callbackUrl }),
    });
  }

  async verifyWalletDeposit(reference) {
    return this.request(`/v2/wallet/deposit/verify/${reference}`);
  }

  // Open Campaigns (Bidding System)
  async createOpenCampaign(data) {
    return this.request('/v2/open-campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOpenCampaigns(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v2/open-campaigns${queryString ? `?${queryString}` : ''}`);
  }

  async getOpenCampaign(campaignId) {
    return this.request(`/v2/open-campaigns/${campaignId}`);
  }

  async closeCampaign(campaignId) {
    return this.request(`/v2/open-campaigns/${campaignId}/close`, {
      method: 'PATCH',
    });
  }

  // Bids
  async submitBid(campaignId, bidData) {
    return this.request(`/v2/open-campaigns/${campaignId}/bids`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async withdrawBid(campaignId, bidId) {
    return this.request(`/v2/open-campaigns/${campaignId}/bids/${bidId}`, {
      method: 'DELETE',
    });
  }

  async acceptBid(campaignId, bidId) {
    return this.request(`/v2/open-campaigns/${campaignId}/bids/${bidId}/accept`, {
      method: 'POST',
    });
  }

  async rejectBid(campaignId, bidId, reason = '') {
    return this.request(`/v2/open-campaigns/${campaignId}/bids/${bidId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getMyBids(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v2/open-campaigns/my-bids${queryString ? `?${queryString}` : ''}`);
  }

  // ============ Campaign Content Generation ============

  async getInfluencerCampaigns() {
    return this.request('/v2/campaign-content/my-campaigns');
  }

  async getAvailableTrends(limit = 20) {
    return this.request(`/v2/campaign-content/trends?limit=${limit}`);
  }

  async generateCampaignContent(data) {
    return this.request('/v2/campaign-content/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyGeneratedContent(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v2/campaign-content/my-content${queryString ? `?${queryString}` : ''}`);
  }

  async getCampaignContentDetail(contentId) {
    return this.request(`/v2/campaign-content/${contentId}`);
  }

  async submitContentForApproval(contentId) {
    return this.request(`/v2/campaign-content/${contentId}/submit`, {
      method: 'POST',
    });
  }

  async approveContent(contentId, feedback = null) {
    return this.request(`/v2/campaign-content/${contentId}/approve`, {
      method: 'POST',
      body: feedback ? JSON.stringify(feedback) : null,
    });
  }

  async deleteGeneratedContent(contentId) {
    return this.request(`/v2/campaign-content/${contentId}`, {
      method: 'DELETE',
    });
  }

  // ============ Proof of Work ============

  async submitProofOfWork(data) {
    return this.request('/v2/proof-of-work/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyProofSubmissions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v2/proof-of-work/my-submissions${queryString ? `?${queryString}` : ''}`);
  }

  async getPendingProofReviews() {
    return this.request('/v2/proof-of-work/pending-reviews');
  }

  async getProofDetail(proofId) {
    return this.request(`/v2/proof-of-work/${proofId}`);
  }

  async reviewProofOfWork(proofId, data) {
    return this.request(`/v2/proof-of-work/${proofId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMinimumWithdrawal() {
    return this.request('/v2/proof-of-work/config/minimum-withdrawal');
  }

  // ============ Payment Methods ============

  async getPaymentMethods() {
    return this.request('/v2/payment-methods');
  }

  async createPaymentMethod(data) {
    return this.request('/v2/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(methodId, data) {
    return this.request(`/v2/payment-methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async setPaymentMethodPrimary(methodId) {
    return this.request(`/v2/payment-methods/${methodId}/set-primary`, {
      method: 'POST',
    });
  }

  async deletePaymentMethod(methodId) {
    return this.request(`/v2/payment-methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  // ============ Admin Withdrawals ============

  async getPendingWithdrawals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v2/admin/withdrawals/pending${queryString ? `?${queryString}` : ''}`);
  }

  async getWithdrawalHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v2/admin/withdrawals/history${queryString ? `?${queryString}` : ''}`);
  }

  async getWithdrawalDetail(withdrawalId) {
    return this.request(`/v2/admin/withdrawals/${withdrawalId}`);
  }

  async processWithdrawal(withdrawalId, data) {
    return this.request(`/v2/admin/withdrawals/${withdrawalId}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectWithdrawal(withdrawalId, reason) {
    return this.request(`/v2/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getWithdrawalStats() {
    return this.request('/v2/admin/withdrawals/stats/summary');
  }

  // ============ Admin Financials ============

  async getAdminOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/orders?${queryString}`);
  }
}


export const api = new ApiService();
export default api;
