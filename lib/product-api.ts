// Product API fetching at build time
"use server";

import "server-only";

// Product types
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

// Category mapping for translations
interface CategoryMapping {
  ro: string;
  ru: string;
  en?: string;
}

// Declare global cache state
declare global {
  var productCache: {
    allProducts: Product[];
    categoryMap: Map<string, Product[]>;
    isInitialized: boolean;
    initializationPromise: Promise<void> | null;
  } | undefined;
}

// Initialize global cache if not already done
if (!global.productCache) {
  global.productCache = {
    allProducts: [],
    categoryMap: new Map(),
    isInitialized: false,
    initializationPromise: null
  };
}

// Category mappings for translations
const categoryMappings: Record<string, CategoryMapping> = {
  // Example mappings...
};

/**
 * Get category by language
 */
export async function getCategoryByLanguage(category: string, language: 'ro' | 'ru' | 'en' = 'ro'): Promise<string> {
  // Try to find in mappings
  for (const [key, mapping] of Object.entries(categoryMappings)) {
    if (mapping[language] === category) {
      return key;
    }
  }

  // If not found, return original
  return category;
}

/**
 * Fetches all products from the API - only called once at server startup
 */
async function fetchAllProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.ROST_API_KEY;

    if (!apiUrl) {
      throw new Error("ROST_API_KEY is not defined in environment variables");
    }

    console.log("🔄 Fetching all products from API (one-time operation)...");

    // Use revalidation instead of no-store to be compatible with static rendering
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Revalidate after 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    console.log(`✅ Successfully fetched ${products.length} products`);

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Initializes the product cache - called once at server startup
 */
export async function initializeProductCache(): Promise<void> {
  const cache = global.productCache!;

  // If already initialized or initializing, return existing promise
  if (cache.isInitialized) {
    return Promise.resolve();
  }

  if (cache.initializationPromise) {
    return cache.initializationPromise;
  }

  // Create a new initialization promise
  cache.initializationPromise = (async () => {
    try {
      // Check again in case another request already initialized
      if (cache.isInitialized) {
        return;
      }

      console.log("🚀 Initializing product cache (one-time operation)...");

      // Fetch all products
      const products = await fetchAllProducts();

      // Check if we got products back
      if (!products || products.length === 0) {
        console.warn("⚠️ Warning: No products were fetched. The API might be unavailable.");
        // We'll continue with an empty cache, but won't mark as initialized
        // so we can try again later
        cache.initializationPromise = null;
        return;
      }

      // Store products in cache
      cache.allProducts = products;

      // Build category map
      products.forEach(product => {
        if (product.category) {
          const categoryProducts = cache.categoryMap.get(product.category) || [];
          categoryProducts.push(product);
          cache.categoryMap.set(product.category, categoryProducts);
        }
      });

      console.log(`✅ Product cache initialized with ${products.length} products and ${cache.categoryMap.size} categories`);
      cache.isInitialized = true;
    } catch (error) {
      console.error("Error initializing product cache:", error);
      // Reset initialization state on error
      cache.initializationPromise = null;
    }
  })();

  return cache.initializationPromise;
}

/**
 * Gets all products from cache
 */
export async function getAllProducts(): Promise<Product[]> {
  await initializeProductCache();
  return global.productCache!.allProducts;
}

/**
 * Gets all categories from cache
 */
export async function getAllCategories(): Promise<string[]> {
  await initializeProductCache();
  return Array.from(global.productCache!.categoryMap.keys());
}

/**
 * Gets products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  await initializeProductCache();
  return global.productCache!.categoryMap.get(category) || [];
}

/**
 * Gets products by multiple categories
 */
export async function getProductsByCategories(categories: string[]): Promise<Product[]> {
  await initializeProductCache();

  // Get products for all requested categories
  const products = categories.flatMap(category =>
    global.productCache!.categoryMap.get(category) || []
  );

  // Deduplicate in case products appear in multiple categories
  return Array.from(new Map(products.map(product => [product.id, product])).values());
}

/**
 * Searches for products by query in title
 */
export async function searchProducts(query: string): Promise<Product[]> {
  await initializeProductCache();

  const normalizedQuery = query.toLowerCase();
  return global.productCache!.allProducts.filter(product =>
    product.titleRO.toLowerCase().includes(normalizedQuery) ||
    product.titleRU.toLowerCase().includes(normalizedQuery) ||
    product.titleEN.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Gets a single product by ID
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  await initializeProductCache();
  return global.productCache!.allProducts.find(product => product.id === id);
}
