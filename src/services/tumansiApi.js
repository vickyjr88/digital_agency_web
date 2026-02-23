// Tumanasi Delivery Service — API client
// NOTE: VITE_API_URL already includes /api (e.g. http://localhost:4001/api)
//       so all paths here must NOT start with /api.

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

const api = axios.create({ baseURL: API_BASE });

// Auth: use localStorage token (same as the rest of the app)
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('token');
    if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
});

export const tumansiApi = {
    // ── Zones ──────────────────────────────────────────────────
    listZones: () => api.get('/tumanasi/zones'),
    searchZones: (q) => api.get('/tumanasi/zones/search', { params: { q } }),
    getZone: (id) => api.get(`/tumanasi/zones/${id}`),

    // ── Customer deliveries ────────────────────────────────────
    bookDelivery: (body) => api.post('/tumanasi/deliveries', body),
    track: (num) => api.get(`/tumanasi/deliveries/track/${num}`),
    myDeliveries: () => api.get('/tumanasi/deliveries/my'),
    getDelivery: (id) => api.get(`/tumanasi/deliveries/${id}`),
    cancelDelivery: (id, reason) => api.post(`/tumanasi/deliveries/${id}/cancel`, { reason }),
    rateRider: (id, body) => api.post(`/tumanasi/deliveries/${id}/rate`, body),
    initiatePayment: (id, body) => api.post(`/tumanasi/deliveries/${id}/pay`, body),

    // ── Rider ──────────────────────────────────────────────────
    registerRider: (body) => api.post('/tumanasi/rider/register', body),
    getRiderProfile: () => api.get('/tumanasi/rider/me'),
    updateRider: (body) => api.put('/tumanasi/rider/me', body),
    setAvailability: (available) => api.put('/tumanasi/rider/availability', { is_available: available }),
    riderDeliveries: (status) => api.get('/tumanasi/rider/deliveries', { params: status ? { status } : {} }),
    availableJobs: () => api.get('/tumanasi/rider/deliveries/available'),
    acceptDelivery: (id) => api.put(`/tumanasi/rider/deliveries/${id}/accept`),
    updateStatus: (id, status, note) => api.put(`/tumanasi/rider/deliveries/${id}/status`, { status, note }),
    confirmCash: (id) => api.put(`/tumanasi/rider/deliveries/${id}/confirm-payment`),

    uploadPickupPhoto: (id, formData) =>
        api.post(`/tumanasi/rider/deliveries/${id}/pickup-photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    uploadDeliveryPhoto: (id, formData) =>
        api.post(`/tumanasi/rider/deliveries/${id}/delivery-photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // ── Admin ──────────────────────────────────────────────────
    adminStats: () => api.get('/tumanasi/admin/stats'),
    adminDeliveries: (params) => api.get('/tumanasi/admin/deliveries', { params }),
    adminRiders: (params) => api.get('/tumanasi/admin/riders', { params }),
    verifyRider: (id, body) => api.put(`/tumanasi/admin/riders/${id}/verify`, body),
    assignRider: (delivId, riderId) =>
        api.put(`/tumanasi/admin/deliveries/${delivId}/assign`, { rider_id: riderId }),
    createZone: (body) => api.post('/tumanasi/admin/zones', body),
    updateZone: (id, body) => api.put(`/tumanasi/admin/zones/${id}`, body),
};
