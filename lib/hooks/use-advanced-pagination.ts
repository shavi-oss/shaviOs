import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// ==============================================================================
// TYPES
// ==============================================================================

export interface PaginationOptions<T> {
  tableName: string;
  pageSize?: number;
  initialPage?: number;
  orderBy?: keyof T | string;
  orderDirection?: 'asc' | 'desc';
  filters?: Partial<Record<keyof T, any>>;
  searchQuery?: string;
  searchColumns?: (keyof T | string)[];
  includeDeleted?: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  error: PostgrestError | null;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<Record<keyof T, any>>) => void;
  setOrderBy: (column: keyof T | string, direction?: 'asc' | 'desc') => void;
  refetch: () => Promise<void>;
}

// ==============================================================================
// ADVANCED PAGINATION HOOK
// ==============================================================================

export function useAdvancedPagination<T>({
  tableName,
  pageSize: initialPageSize = 10,
  initialPage = 0,
  orderBy: initialOrderBy = 'created_at',
  orderDirection: initialOrderDirection = 'desc',
  filters: initialFilters = {},
  searchQuery = '',
  searchColumns = [],
  includeDeleted = false
}: PaginationOptions<T>): PaginationResult<T> {
  
  // State
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [orderBy, setOrderByState] = useState<string>(String(initialOrderBy));
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>(initialOrderDirection);
  const [filters, setFiltersState] = useState(initialFilters);

  // Fetch Logic
  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      
      let query = supabase
        .from(tableName as any)
        .select('*', { count: 'exact' });
      
      // 1. Handle Soft Deletes
      if (!includeDeleted) {
        query = query.is('deleted_at', null); // Assuming soft delete column is deleted_at
      }
      
      // 2. Apply Filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          query = query.eq(key, value);
        }
      });
      
      // 3. Apply Search
      if (searchQuery && searchColumns.length > 0) {
        const orConditions = searchColumns
          .map(col => `${String(col)}.ilike.%${searchQuery}%`)
          .join(',');
        query = query.or(orConditions);
      }
      
      // 4. Ordering
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });
      
      // 5. Pagination Range
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      // Execute
      const { data: results, count, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setData(results as T[] || []);
      setTotalCount(count || 0);
      
    } catch (err) {
      console.error('Pagination Error:', err);
      setError(err as PostgrestError);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when dependencies change
  useEffect(() => {
    fetchPage();
  }, [page, pageSize, orderBy, orderDirection, JSON.stringify(filters), searchQuery, tableName]);

  // Helpers
  const handleSetOrderBy = (column: keyof T | string, direction?: 'asc' | 'desc') => {
    setOrderByState(String(column));
    if (direction) {
      setOrderDirection(direction);
    } else {
      // Toggle if same column
      if (String(column) === orderBy) {
        setOrderDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setOrderDirection('desc'); // Default to desc for new column
      }
    }
    setPage(0); // Reset to first page
  };

  const handleSetFilters = (newFilters: Partial<Record<keyof T, any>>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page
  };

  return {
    data,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    loading,
    error,
    setPage,
    setPageSize,
    setFilters: handleSetFilters,
    setOrderBy: handleSetOrderBy,
    refetch: fetchPage
  };
}
