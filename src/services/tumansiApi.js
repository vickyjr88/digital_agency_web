// Tumanasi API service

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'https://dexter.vitaldigitalmedia.net';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((cfg) => {
    const raw = document.cookie.split(';').find(c => c.trim().startsWith('auth_token='));
    if (raw) {
        const token = decodeURIComponent(raw.split('=')[1]);
        cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
});

export const tumansiApi = {
    // Zones
    listZones: () => api.get('/api/tumanasi/zones'),
    searchZones: (q) => api.get(`/api/tumanasi/zones/search?q=${encodeURIComponent(q)}`),
    getZone: (id) => api.get(`/api/tumanasi/zones/${id}`),

    // Customer deliveries
    bookDelivery: (body) => api.post('/api/tumanasi/deliveries', body),
    track: (num) => api.get(`/api/tumanasi/deliveries/track/${num}`),
    myDeliveries: () => api.get('/api/tumanasi/deliveries/my'),
    getDelivery: (id) => api.get(`/api/tumanasi/deliveries/${id}`),
    cancelDelivery: (id, reason) => api.post(`/api/tumanasi/deliveries/${id}/cancel`, { reason }),
    rateRider: (id, body) => api.post(`/api/tumanasi/deliveries/${id}/rate`, body),
    initiatePayment: (id, body) => api.post(`/api/tumanasi/deliveries/${id}/pay`, body),

    // Rider
    registerRider: (body) => api.post('/api/tumanasi/rider/register', body),
    getRiderProfile: () => api.get('/api/tumanasi/rider/me'),
    updateRider: (body) => api.put('/api/tumanasi/rider/me', body),
    setAvailability: (available) => api.put('/api/tumanasi/rider/availability', { is_available: available }),
    riderDeliveries: (status) => api.get('/api/tumanasi/rider/deliveries' + (status ? `?status=${status}` : '')),
    availableJobs: () => api.get('/api/tumanasi/rider/deliveries/available'),
    acceptDelivery: (id) => api.put(`/api/tumanasi/rider/deliveries/${id}/accept`),
    updateStatus: (id, status, note) => api.put(`/api/tumanasi/rider/deliveries/${id}/status`, { status, note }),
    confirmCash: (id) => api.put(`/api/tumanasi/rider/deliveries/${id}/confirm-payment`),
    uploadPickupPhoto: (id, formData) => api.post(`/api/tumanasi/rider/deliveries/${id}/pickup-photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    uploadDeliveryPhoto: (id, formData) => api.post(`/api/tumanasi/rider/deliveries/${id}/delivery-photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

    // Admin
    adminStats: () => api.get('/api/tumanasi/admin/stats'),
    adminDeliveries: (params) => api.get('/api/tumanasi/admin/deliveries', { params }),
    adminRiders: (params) => api.get('/api/tumanasi/admin/riders', { params }),
    verifyRider: (id, body) => api.put(`/api/tumanasi/admin/riders/${id}/verify`, body),
    assignRider: (deliveryId, riderId) => api.put(`/api/tumanasi/admin/deliveries/${deliveryId}/assign`, { rider_id: riderId }),
    createZone: (body) => api.post('/api/tumanasi/admin/zones', body),
    updateZone: (id, body) => api.put(`/api/tumanasi/admin/zones/${id}`, body),
};
