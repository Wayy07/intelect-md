"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllProducts, getAllCategories, getProductsByCategory, searchProducts } from "@/lib/product-api";

interface Product {
  id: string;
  SKU: string;
  titleRO: string;
  titleRU: string;
  titleEN: string;
  price: string;
  min_qty: string;
  on_stock: string;
  img: string;
  category: string;
}

export function useProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(0);

  // Memoize function references to prevent dependency changes
  const getProducts = useCallback(async () => {
    try {
      return await getAllProducts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      return await getAllCategories();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, []);

  const getProductsByCategoryFn = useCallback(async (category: string) => {
    try {
      return await getProductsByCategory(category);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, []);

  const searchProductsFn = useCallback(async (query: string) => {
    try {
      return await searchProducts(query);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, []);

  // Initialize state
  useEffect(() => {
    // Prevent excessive attempts - max 3 retries
    if (loadingAttempts > 3) {
      setIsLoading(false);
      setError(new Error("Failed to load products after multiple attempts"));
      return;
    }

    let isMounted = true;

    // Load products and categories
    const loadData = async () => {
      try {
        // In case this component is unmounted before the async operation completes
        if (!isMounted) return;

        const productsData = await getProducts();
        const categoriesData = await getCategories();

        if (isMounted) {
          setProducts(productsData);
          setCategories(categoriesData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          setLoadingAttempts(prev => prev + 1);
        }
      }
    };

    loadData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [getProducts, getCategories, loadingAttempts]);

  return {
    isLoading,
    error,
    products,
    categories,
    getProducts,
    getCategories,
    getProductsByCategory: getProductsByCategoryFn,
    searchProducts: searchProductsFn,
  };
}
