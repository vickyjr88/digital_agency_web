/**
 * Extended API Service for Dexter Marketplace
 * Adds marketplace-specific API methods
 */

// ============================================================================
// INFLUENCER API METHODS
// ============================================================================

export const influencerApi = {
    // Onboard as influencer
    onboard: async (profileData) => {
        const { api } = await import('./api');
        return api.request('/v2/influencers/onboard', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    },

    // Get own profile
    getMyProfile: async () => {
        const { api } = await import('./api');
        return api.request('/v2/influencers/me');
    },

    // Update own profile
    updateMyProfile: async (profileData) => {
        const { api } = await import('./api');
        return api.request('/v2/influencers/me', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    // Get own stats
    getMyStats: async () => {
        const { api } = await import('./api');
        return api.request('/v2/influencers/me/stats');
    },

    // Search influencers in marketplace
    search: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/influencers?${queryString}`);
    },

    // Get influencer by ID
    getById: async (influencerId) => {
        const { api } = await import('./api');
        return api.request(`/v2/influencers/${influencerId}`);
    },

    // Get influencer's packages
    getPackages: async (influencerId) => {
        const { api } = await import('./api');
        return api.request(`/v2/influencers/${influencerId}/packages`);
    },

    // Get influencer profile (alias for getById)
    getProfile: async (influencerId) => {
        const { api } = await import('./api');
        return api.request(`/v2/influencers/${influencerId}`);
    },

    // Admin: Get pending influencers
    getPending: async () => {
        const { api } = await import('./api');
        return api.request('/v2/influencers/admin/pending');
    },

    // Admin: Verify influencer
    verify: async (influencerId, action) => {
        const { api } = await import('./api');
        return api.request(`/v2/influencers/admin/${influencerId}/verify?action=${action}`, {
            method: 'PUT',
        });
    },

    // Admin: Get all influencers
    getAllAdmin: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/influencers/admin?${queryString}`);
    },
};


// ============================================================================
// PACKAGE API METHODS
// ============================================================================

export const packageApi = {
    // Create package
    create: async (packageData) => {
        const { api } = await import('./api');
        return api.request('/v2/packages', {
            method: 'POST',
            body: JSON.stringify(packageData),
        });
    },

    // Get own packages
    getMine: async (status = null) => {
        const { api } = await import('./api');
        const params = status ? `?status_filter=${status}` : '';
        return api.request(`/v2/packages/mine${params}`);
    },

    // Get package by ID
    getById: async (packageId) => {
        const { api } = await import('./api');
        return api.request(`/v2/packages/${packageId}`);
    },

    // Update package
    update: async (packageId, packageData) => {
        const { api } = await import('./api');
        return api.request(`/v2/packages/${packageId}`, {
            method: 'PUT',
            body: JSON.stringify(packageData),
        });
    },

    // Delete package
    delete: async (packageId) => {
        const { api } = await import('./api');
        return api.request(`/v2/packages/${packageId}`, {
            method: 'DELETE',
        });
    },

    // Pause package
    pause: async (packageId) => {
        const { api } = await import('./api');
        return api.request(`/v2/packages/${packageId}/pause`, {
            method: 'POST',
        });
    },

    // Activate package
    activate: async (packageId) => {
        const { api } = await import('./api');
        return api.request(`/v2/packages/${packageId}/activate`, {
            method: 'POST',
        });
    },

    // Browse packages in marketplace
    browse: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/packages?${queryString}`);
    },

    // Get packages by influencer ID
    getByInfluencer: async (influencerId) => {
        const { api } = await import('./api');
        return api.request(`/v2/influencers/${influencerId}/packages`);
    },

    // Admin: Get all packages
    getAllAdmin: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/packages/admin?${queryString}`);
    },
};


// ============================================================================
// WALLET API METHODS
// ============================================================================

export const walletApi = {
    // Get wallet balance
    getBalance: async () => {
        const { api } = await import('./api');
        return api.request('/v2/wallet');
    },

    // Initiate deposit
    deposit: async (amount, callbackUrl = null) => {
        const { api } = await import('./api');
        return api.request('/v2/wallet/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, callback_url: callbackUrl }),
        });
    },

    // Request withdrawal
    withdraw: async (amount, paymentMethod = 'bank_transfer') => {
        const { api } = await import('./api');
        return api.request('/v2/wallet/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, payment_method: paymentMethod }),
        });
    },

    // Get transaction history
    getTransactions: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/wallet/transactions?${queryString}`);
    },

    // Admin: Get all transactions
    getAllTransactionsAdmin: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/wallet/admin/transactions?${queryString}`);
    },
};


// ============================================================================
// CAMPAIGN API METHODS
// ============================================================================

export const campaignApi = {
    // Create campaign (purchase package)
    create: async (packageId, brief, customRequirements = null) => {
        const { api } = await import('./api');
        return api.request('/v2/campaigns', {
            method: 'POST',
            body: JSON.stringify({
                package_id: packageId,
                brief,
                custom_requirements: customRequirements,
            }),
        });
    },

    // Get campaigns list
    getAll: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/campaigns?${queryString}`);
    },

    // Get campaign by ID
    getById: async (campaignId) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}`);
    },

    // Accept campaign (influencer)
    accept: async (campaignId) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/accept`, {
            method: 'POST',
        });
    },

    // Reject campaign (influencer)
    reject: async (campaignId, reason = null) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },

    // Submit deliverable
    submitDeliverable: async (campaignId, deliverableData) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/submit-draft`, {
            method: 'POST',
            body: JSON.stringify(deliverableData),
        });
    },

    // Approve deliverable (brand)
    approveDeliverable: async (campaignId, deliverableId) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/deliverables/${deliverableId}/approve`, {
            method: 'POST',
        });
    },

    // Request revision (brand)
    requestRevision: async (campaignId, deliverableId, feedback) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/deliverables/${deliverableId}/request-revision`, {
            method: 'POST',
            body: JSON.stringify({ feedback }),
        });
    },

    // Complete campaign
    complete: async (campaignId) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/complete`, {
            method: 'POST',
        });
    },

    // Raise dispute
    dispute: async (campaignId, reason, evidenceUrls = []) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/${campaignId}/dispute`, {
            method: 'POST',
            body: JSON.stringify({ reason, evidence_urls: evidenceUrls }),
        });
    },

    // Admin: Get all campaigns
    getAllAdmin: async (params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/campaigns/admin?${queryString}`);
    },

    // Admin: Resolve dispute
    resolveDispute: async (campaignId, decision, resolutionNotes) => {
        const { api } = await import('./api');
        return api.request(`/v2/campaigns/admin/${campaignId}/resolve-dispute`, {
            method: 'POST',
            body: JSON.stringify({ decision, resolution_notes: resolutionNotes }),
        });
    },
};


// ============================================================================
// REVIEW API METHODS
// ============================================================================

export const reviewApi = {
    // Create review
    create: async (campaignId, rating, comment = null) => {
        const { api } = await import('./api');
        return api.request('/v2/reviews', {
            method: 'POST',
            body: JSON.stringify({
                campaign_id: campaignId,
                rating,
                comment,
            }),
        });
    },

    // Get reviews for user
    getForUser: async (userId, params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/reviews/user/${userId}?${queryString}`);
    },

    // Respond to review
    respond: async (reviewId, response) => {
        const { api } = await import('./api');
        return api.request(`/v2/reviews/${reviewId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ response }),
        });
    },

    // Get reviews by influencer ID
    getByInfluencer: async (influencerId, params = {}) => {
        const { api } = await import('./api');
        const queryString = new URLSearchParams(params).toString();
        return api.request(`/v2/reviews/influencer/${influencerId}?${queryString}`);
    },
};


// ============================================================================
// NOTIFICATION API METHODS
// ============================================================================

export const notificationApi = {
    // Get notifications
    getAll: async (unreadOnly = false) => {
        const { api } = await import('./api');
        const params = unreadOnly ? '?unread_only=true' : '';
        return api.request(`/v2/notifications${params}`);
    },

    // Mark as read
    markAsRead: async (notificationId) => {
        const { api } = await import('./api');
        return api.request(`/v2/notifications/${notificationId}/read`, {
            method: 'POST',
        });
    },

    // Mark all as read
    markAllAsRead: async () => {
        const { api } = await import('./api');
        return api.request('/v2/notifications/read-all', {
            method: 'POST',
        });
    },

    // Get unread count
    getUnreadCount: async () => {
        const { api } = await import('./api');
        return api.request('/v2/notifications/unread-count');
    },
};


// Export all APIs
export default {
    influencer: influencerApi,
    package: packageApi,
    wallet: walletApi,
    campaign: campaignApi,
    review: reviewApi,
    notification: notificationApi,
};
