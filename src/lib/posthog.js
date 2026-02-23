import posthog from 'posthog-js';

// Initialize PostHog
// Only initialize if we have a valid API key
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_XWS39nnDqDtQQoE3h2CacRVsLG1CVjcHnJXbBjdTV6Z';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

export const initPostHog = () => {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: true, // Automatically capture pageviews
      capture_pageleave: true, // Capture when users leave pages
      autocapture: true, // Automatically capture clicks, form submissions, etc.
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('PostHog initialized successfully');
        }
      },
      // Privacy settings
      respect_dnt: true, // Respect Do Not Track
      mask_all_text: false, // Don't mask text in recordings (set true for more privacy)
      mask_all_element_attributes: false,
      // Session recording (optional - disable if not needed)
      session_recording: {
        maskAllInputs: true, // Mask all input fields
        maskInputOptions: {
          password: true, // Always mask passwords
        },
      },
      // Advanced options
      persistence: 'localStorage', // Use localStorage for persistence
      cross_subdomain_cookie: false,
    });

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

// Track custom events
export const trackEvent = (eventName, properties = {}) => {
  if (!isInitialized) {
    console.warn('PostHog not initialized');
    return;
  }

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Identify user
export const identifyUser = (userId, properties = {}) => {
  if (!isInitialized) {
    console.warn('PostHog not initialized');
    return;
  }

  try {
    posthog.identify(userId, properties);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};

// Reset user (on logout)
export const resetUser = () => {
  if (!isInitialized) {
    return;
  }

  try {
    posthog.reset();
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
};

// Set user properties
export const setUserProperties = (properties = {}) => {
  if (!isInitialized) {
    console.warn('PostHog not initialized');
    return;
  }

  try {
    posthog.setPersonProperties(properties);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
};

// Track page view manually (if needed)
export const trackPageView = (pageName, properties = {}) => {
  if (!isInitialized) {
    return;
  }

  try {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName,
      ...properties,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Feature flags
export const isFeatureEnabled = (flagKey) => {
  if (!isInitialized) {
    return false;
  }

  try {
    return posthog.isFeatureEnabled(flagKey);
  } catch (error) {
    console.error('Failed to check feature flag:', error);
    return false;
  }
};

// Get feature flag value
export const getFeatureFlagPayload = (flagKey) => {
  if (!isInitialized) {
    return null;
  }

  try {
    return posthog.getFeatureFlagPayload(flagKey);
  } catch (error) {
    console.error('Failed to get feature flag payload:', error);
    return null;
  }
};

// Export PostHog instance for advanced usage
export { posthog };

export default {
  init: initPostHog,
  track: trackEvent,
  identify: identifyUser,
  reset: resetUser,
  setUserProperties,
  trackPageView,
  isFeatureEnabled,
  getFeatureFlagPayload,
  posthog,
};
