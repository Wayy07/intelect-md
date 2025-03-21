"use client";

import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/lib/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback } from "react";

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

export function ProductList({ category }: { category?: string }) {
  const { isLoading: hookLoading, products: allProducts, getProductsByCategory } = useProducts();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cache fetch function
  const fetchProducts = useCallback(async () => {
    if (hookLoading) return;

    setIsLoading(true);
    try {
      if (category) {
        const categoryProducts = await getProductsByCategory(category);
        setProducts(categoryProducts);
      } else {
        setProducts(allProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [category, hookLoading, allProducts, getProductsByCategory]);

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Display loading state
  if (isLoading || hookLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Display when no products are found
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">
          {language === "ru" ? "Товары не найдены" : "Nu s-au găsit produse"}
        </h3>
      </div>
    );
  }

  // Display products
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* Product image */}
          <div className="aspect-square overflow-hidden relative">
            <img
              src={product.img}
              alt={language === "ru" ? product.titleRU : product.titleRO}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Product info */}
          <div className="p-4">
            <h3 className="font-medium text-lg truncate">
              {language === "ru" ? product.titleRU : product.titleRO}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-xl">
                {product.price} MDL
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {language === "ru" ? "В наличии:" : "În stoc:"} {product.on_stock}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
