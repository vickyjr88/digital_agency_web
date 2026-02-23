import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for infinite scroll pagination
 * @param {Function} fetchFunction - Async function to fetch data (page, limit, search) => { items, total, hasMore }
 * @param {Object} options - { initialLimit, searchDelay }
 * @returns {Object} - { items, loading, hasMore, error, searchTerm, setSearchTerm, loadMore, refresh }
 */
export function useInfiniteScroll(fetchFunction, options = {}) {
  const { initialLimit = 20, searchDelay = 500 } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const observer = useRef();
  const searchTimeout = useRef();

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
      setItems([]);
    }, searchDelay);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, searchDelay]);

  // Fetch data
  const fetchData = useCallback(async (pageNum, append = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(pageNum, initialLimit, debouncedSearch);

      if (append) {
        setItems(prev => [...prev, ...(result.items || [])]);
      } else {
        setItems(result.items || []);
      }

      setHasMore(result.hasMore !== undefined ? result.hasMore : (result.items?.length === initialLimit));
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Infinite scroll error:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [fetchFunction, initialLimit, debouncedSearch, loading]);

  // Initial load and search changes
  useEffect(() => {
    fetchData(1, false);
  }, [debouncedSearch]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1, true);
    }
  }, [loading, hasMore, page, fetchData]);

  // Refresh function
  const refresh = useCallback(() => {
    setPage(1);
    setItems([]);
    fetchData(1, false);
  }, [fetchData]);

  // Intersection observer for last element
  const lastElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  return {
    items,
    loading,
    initialLoading,
    hasMore,
    error,
    searchTerm,
    setSearchTerm,
    loadMore,
    refresh,
    lastElementRef,
  };
}
