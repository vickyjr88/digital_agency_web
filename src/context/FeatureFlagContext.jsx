/**
 * Feature Flag Context for Dexter Platform
 * Enables gradual rollout of marketplace features
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Feature flag definitions
const DEFAULT_FLAGS = {
    // Marketplace features
    marketplace_enabled: false,
    influencer_onboarding: false,
    wallet_system: false,
    campaigns: false,
    reviews: false,
    disputes: false,

    // Existing features (all enabled by default)
    content_generation: true,
    brand_management: true,
    trends: true,
    billing: true,
    admin_panel: true,
};

const FeatureFlagContext = createContext({
    flags: DEFAULT_FLAGS,
    isEnabled: (flag) => false,
    loading: true,
    refreshFlags: () => { },
});

export function FeatureFlagProvider({ children }) {
    const [flags, setFlags] = useState(DEFAULT_FLAGS);
    const [loading, setLoading] = useState(true);

    const fetchFlags = async () => {
        try {
            // Try to fetch flags from backend
            const response = await api.getFeatureFlags?.();
            if (response?.flags) {
                setFlags(prev => ({ ...prev, ...response.flags }));
            }
        } catch (error) {
            // If endpoint doesn't exist yet, use defaults
            console.log('Feature flags endpoint not available, using defaults');

            // For development, enable marketplace features
            if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MARKETPLACE === 'true') {
                setFlags(prev => ({
                    ...prev,
                    marketplace_enabled: true,
                    influencer_onboarding: true,
                    wallet_system: true,
                    campaigns: true,
                    reviews: true,
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const isEnabled = (flagName) => {
        return flags[flagName] === true;
    };

    const refreshFlags = () => {
        fetchFlags();
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, isEnabled, loading, refreshFlags }}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

export function useFeatureFlag(flagName) {
    const { flags, isEnabled, loading } = useContext(FeatureFlagContext);

    return {
        enabled: isEnabled(flagName),
        loading,
        value: flags[flagName],
    };
}

export function useFeatureFlags() {
    return useContext(FeatureFlagContext);
}

/**
 * Feature Gate Component
 * Conditionally renders children based on feature flag
 */
export function FeatureGate({ flag, children, fallback = null }) {
    const { enabled, loading } = useFeatureFlag(flag);

    if (loading) {
        return null; // Or a loading indicator
    }

    return enabled ? children : fallback;
}

export default FeatureFlagContext;
