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
// SYSTEM CATEGORIES
// ============================================================================

export const systemCategoriesApi = {
  // Get categories by type
  list: (type) => api.get('/categories/', { params: { type } }),
  
  // Create category (admin)
  create: (data) => api.post('/categories/', data),
  
  // Delete category (admin)
  delete: (id) => api.delete(`/categories/${id}`),
};

// ============================================================================
// BRAND PROFILES
// ============================================================================

// ============================================================================
// BRANDS (content-platform Brand objects owned by the user)
// ============================================================================

export const brandsApi = {
  // List all brands owned by the current user
  list: () => api.get('/brands'),
};

export const brandProfileApi = {
  // List all profiles owned by the current user (one per brand)
  listMyProfiles: () => api.get('/brand-profiles/my-profiles'),

  // Create a profile for a specific brand  { brand_id, whatsapp_number, ... }
  create: (data) => api.post('/brand-profiles/', data),

  // Get the profile for a specific brand (authenticated owner)
  getForBrand: (brandId) => api.get(`/brand-profiles/brand/${brandId}`),

  // Update the profile for a specific brand
  updateForBrand: (brandId, data) => api.put(`/brand-profiles/brand/${brandId}`, data),

  // Delete the profile for a specific brand
  deleteForBrand: (brandId) => api.delete(`/brand-profiles/brand/${brandId}`),

  // Get brand profile by ID (public)
  getById: (id) => api.get(`/brand-profiles/${id}`),

  // Get brand contact info (public, shown to customers after order)
  getContactInfo: (id) => api.get(`/brand-profiles/${id}/contact`),

  // List all active storefronts (public)
  listStorefronts: () => api.get('/brand-profiles/storefronts/list'),

  // Legacy: returns first profile (used by pages that haven't migrated yet)
  getMyProfile: () => api.get('/brand-profiles/me'),
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

  // Get all active product categories
  getCategories: () => api.get('/categories/', { params: { type: 'product' } }),

  // Add variant
  addVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),

  // Get affiliates count
  getAffiliatesCount: (productId) => api.get(`/products/${productId}/affiliates-count`),

  // Get public storefront (brand profile + products)
  getStorefront: (brandProfileId, params) => api.get(`/products/storefront/${brandProfileId}`, { params }),

  // ── Digital product file management ──────────────────────────────────────

  // Upload digital file (PDF, EPUB, ZIP, MP4, MP3) – multipart/form-data
  uploadFile: (productId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/products/${productId}/upload-file`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get presigned download URL for a purchased digital product
  // orderId is required for buyers; brand owners can omit it
  getDownloadUrl: (productId, orderId = null) =>
    api.get(`/products/${productId}/download-file`, {
      params: orderId ? { order_id: orderId } : {},
    }),

  // Remove the digital file from a product
  deleteFile: (productId) => api.delete(`/products/${productId}/delete-file`),

  // ── Product image management ──────────────────────────────────────────────

  // Upload a product image (JPEG, PNG, WebP, GIF) – multipart/form-data
  // Returns { object_key, url, images, thumbnail, ... }
  uploadImage: (productId, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/products/${productId}/upload-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete a product image by its MinIO object_key
  deleteImage: (productId, objectKey) =>
    api.delete(`/products/${productId}/delete-image`, {
      params: { object_key: objectKey },
    }),
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

  // Get influencer storefront (public)
  getInfluencerStorefront: (influencerId) => api.get(`/affiliate/storefront/${influencerId}`),

  // Track click
  trackClick: (ref, productSlug) => api.get('/affiliate/track-click', { params: { ref, product_slug: productSlug } }),
};

// ============================================================================
// ORDERS
// ============================================================================

export const ordersApi = {
  // Place order (no payment)
  placeOrder: (data) => api.post('/orders/place', data),

  // Initialize payment for order
  initializePayment: (data) => api.post('/orders/initialize-payment', data),

  // Verify payment
  verifyPayment: (reference) => api.get(`/orders/verify-payment/${reference}`),

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

// ============================================================================
// DIGITAL PRODUCTS
// ============================================================================

export const digitalProductsApi = {
  // Add file to digital product
  addFile: (productId, data) => api.post(`/digital-products/${productId}/files`, data),

  // Get files for a product
  getFiles: (productId) => api.get(`/digital-products/${productId}/files`),

  // Delete a file
  removeFile: (fileId) => api.delete(`/digital-products/files/${fileId}`),

  // Get preview file (public)
  getPreview: (productId) => api.get(`/digital-products/${productId}/preview`),

  // Download file via access token (public)
  getDownloadUrl: (accessToken) => `${API_BASE_URL}/digital-products/download/${accessToken}`,

  // List downloadable files for a purchase
  listDownloadableFiles: (accessToken) => api.get(`/digital-products/download/${accessToken}/files`),

  // Look up purchases by email (public)
  lookupPurchases: (email) => api.get('/digital-products/my-purchases', { params: { email } }),
};

// ============================================================================
// ADMIN COMMERCE (Orders & Products Management)
// ============================================================================

export const adminCommerceApi = {
  // Get all orders (admin)
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),

  // Update order status (admin)
  updateOrderStatus: (orderId, data) => api.put(`/orders/admin/${orderId}/status`, data),

  // Download digital product file for verification (admin)
  downloadDigitalProduct: (orderId) => api.get(`/orders/admin/${orderId}/download`),

  // Get all products (admin)
  getAllProducts: (params) => api.get('/products/admin/all-products', { params }),

  // Download digital product file by product ID (admin)
  downloadProductFile: (productId) => api.get(`/products/${productId}/download-file`),
};

export default {
  brands: brandsApi,
  brandProfile: brandProfileApi,
  products: productsApi,
  affiliate: affiliateApi,
  orders: ordersApi,
  analytics: analyticsApi,
  digitalProducts: digitalProductsApi,
  adminCommerce: adminCommerceApi,
};
