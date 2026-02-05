// Affiliate Commerce API Service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ============================================================================
// BRAND PROFILES
// ============================================================================

export const brandProfileApi = {
  // Create brand profile
  create: (data) => api.post('/brand-profiles/', data),

  // Get my brand profile
  getMyProfile: () => api.get('/brand-profiles/me'),

  // Update my brand profile
  updateMyProfile: (data) => api.put('/brand-profiles/me', data),

  // Get brand profile by ID (public)
  getById: (id) => api.get(`/brand-profiles/${id}`),

  // Get brand contact info (public)
  getContactInfo: (id) => api.get(`/brand-profiles/${id}/contact`),

  // Delete my brand profile
  deleteMyProfile: () => api.delete('/brand-profiles/me'),
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const productsApi = {
  // Create product
  create: (data) => api.post('/products/', data),

  // List all products (marketplace)
  list: (params) => api.get('/products/', { params }),

  // Get my products (brand)
  getMyProducts: (status) => api.get('/products/my-products', { params: { status } }),

  // Get product by ID
  getById: (id) => api.get(`/products/${id}`),

  // Get product by slug
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),

  // Update product
  update: (id, data) => api.put(`/products/${id}`, data),

  // Delete (archive) product
  delete: (id) => api.delete(`/products/${id}`),

  // Get categories
  getCategories: () => api.get('/products/categories/list'),

  // Add variant
  addVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),

  // Get affiliates count
  getAffiliatesCount: (productId) => api.get(`/products/${productId}/affiliates-count`),
};

// ============================================================================
// AFFILIATE SYSTEM
// ============================================================================

export const affiliateApi = {
  // Apply to promote product
  apply: (data) => api.post('/affiliate/apply', data),

  // Get my applications
  getMyApplications: (status) => api.get('/affiliate/applications', { params: { status } }),

  // Review application (brand)
  reviewApplication: (approvalId, data) => api.put(`/affiliate/applications/${approvalId}/review`, data),

  // Get my affiliate links
  getMyLinks: () => api.get('/affiliate/links'),

  // Get affiliate link for product
  getLinkForProduct: (productId) => api.get(`/affiliate/links/${productId}`),

  // Get pending approvals (brand)
  getPendingApprovals: () => api.get('/affiliate/pending-approvals'),

  // Track click
  trackClick: (ref, productSlug) => api.get('/affiliate/track-click', { params: { ref, product_slug: productSlug } }),
};

// ============================================================================
// ORDERS
// ============================================================================

export const ordersApi = {
  // Place order (no payment)
  placeOrder: (data) => api.post('/orders/place', data),

  // Get my orders as customer
  getMyOrdersAsCustomer: (email) => api.get('/orders/my-orders', { params: { email } }),

  // Get brand orders
  getBrandOrders: (status) => api.get('/orders/brand/orders', { params: { status } }),

  // Get influencer orders
  getInfluencerOrders: (status) => api.get('/orders/influencer/orders', { params: { status } }),

  // Get order details
  getById: (id) => api.get(`/orders/${id}`),

  // Update order status (brand)
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),

  // Delete order
  delete: (id) => api.delete(`/orders/${id}`),
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const analyticsApi = {
  // Influencer dashboard
  getInfluencerDashboard: (days = 30) => api.get('/affiliate-analytics/influencer/dashboard', { params: { days } }),

  // Brand dashboard
  getBrandDashboard: (days = 30) => api.get('/affiliate-analytics/brand/dashboard', { params: { days } }),

  // Top performing products (influencer)
  getInfluencerTopProducts: (limit = 5) => api.get('/affiliate-analytics/influencer/top-products', { params: { limit } }),

  // Top performing products (brand)
  getBrandTopProducts: (limit = 5) => api.get('/affiliate-analytics/brand/top-products', { params: { limit } }),

  // Top performing affiliates (brand)
  getBrandTopAffiliates: (limit = 10) => api.get('/affiliate-analytics/brand/top-affiliates', { params: { limit } }),
};

export default {
  brandProfile: brandProfileApi,
  products: productsApi,
  affiliate: affiliateApi,
  orders: ordersApi,
  analytics: analyticsApi,
};
