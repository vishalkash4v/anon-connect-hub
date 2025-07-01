
import { useState, useRef, useCallback } from 'react';

export const useOptimizedSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const searchCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const abortController = useRef<AbortController | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const searchWithCache = useCallback(async (
    query: string,
    searchFn: (query: string, signal: AbortSignal) => Promise<any>,
    cacheKey: string
  ) => {
    if (!query.trim()) return [];

    // Check cache first (cache for 5 minutes)
    const cached = searchCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }

    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    return new Promise((resolve) => {
      searchTimeout.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          abortController.current = new AbortController();
          
          const results = await searchFn(query, abortController.current.signal);
          
          // Cache the results
          searchCache.current.set(cacheKey, {
            data: results,
            timestamp: Date.now()
          });
          
          resolve(results);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Search error:', error);
            resolve([]);
          }
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    });
  }, []);

  const clearCache = useCallback(() => {
    searchCache.current.clear();
  }, []);

  return {
    isSearching,
    searchWithCache,
    clearCache
  };
};
