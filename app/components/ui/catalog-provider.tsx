"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ALL_CATEGORIES, MainCategory } from '@/lib/categories';

// Define types for context
interface CatalogContextType {
  categories: MainCategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

// Create a context for the catalog data
const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}

interface CatalogProviderProps {
  children: ReactNode;
}

export function CatalogProvider({ children }: CatalogProviderProps) {
  const [categories, setCategories] = useState<MainCategory[]>(ALL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);

        // Fetch categories from our API
        const response = await fetch('/api/catalog-structure');
        const data = await response.json();

        if (data.success && data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
        // Keep using default categories
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Force refresh the catalog data
  const refreshCategories = async () => {
    try {
      setLoading(true);

      // Force refresh with query parameter
      const response = await fetch('/api/catalog-structure?refresh=true');
      const data = await response.json();

      if (data.success && data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to refresh categories:', err);
      setError('Failed to refresh categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CatalogContext.Provider
      value={{
        categories,
        loading,
        error,
        refreshCategories
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
