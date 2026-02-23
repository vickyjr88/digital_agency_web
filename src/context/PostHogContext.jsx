import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initPostHog, trackPageView } from '../lib/posthog';

const PostHogContext = createContext(null);

export function PostHogProvider({ children }) {
  const location = useLocation();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname, {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location]);

  return (
    <PostHogContext.Provider value={null}>
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  return useContext(PostHogContext);
}
