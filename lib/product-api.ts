// Product API fetching at build time
"use server";

import "server-only";

// Product types
export interface Product {
  id: string;
  SKU: string;
  titleRO: string;
  titleRU: string;
  titleEN: string;
  price: string;
  reduced_price?: string;
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
    // Store products by category ID
    categoryProducts: Map<string, Product[]>;
    // Track which categories have been fetched
    fetchedCategories: Set<string>;
    // Last fetch time by category to handle TTL
    lastFetchTime: Map<string, number>;
  } | undefined;
}

// Initialize global cache if not already done
if (!global.productCache) {
  global.productCache = {
    categoryProducts: new Map(),
    fetchedCategories: new Set(),
    lastFetchTime: new Map()
  };
}

// Category mappings for translations
const categoryMappings: Record<string, CategoryMapping> = {
  // Example mappings...
};

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 3600 * 1000;

/**
 * Initialize product cache with specific categories
 * This is a compatibility function for the old API approach
 */
export async function initializeProductCache(categories?: string[]): Promise<void> {
  console.log("Using new on-demand product cache system");

  if (categories && categories.length > 0) {
    // If specific categories are requested, preload them
    console.log(`Pre-loading ${categories.length} categories`);
    await ensureCategoriesLoaded(categories);
    console.log("Categories pre-loaded successfully");
  } else {
    console.log("No specific categories requested for preloading");
  }
}

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
 * Fetches products for specific categories
 */
async function fetchProductsByCategory(categories: string[]): Promise<Product[]> {
  try {
    const apiUrl = process.env.ROST_API_KEY;
    if (!apiUrl) {
      throw new Error("ROST_API_KEY is not defined in environment variables");
    }

    // Build URL with category filter
    let url = apiUrl;
    const separator = url.includes('?') ? '&' : '?';

    // Join categories with proper URL encoding
    const encodedCategories = categories.map(cat => encodeURIComponent(cat)).join(',');
    url += `${separator}categories=${encodedCategories}`;

    console.log(`Fetching products for categories: ${categories.join(', ')}`);

    // Use revalidation to be compatible with static rendering
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate after 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();

    // Filter to ensure we only get products from the requested categories
    const filteredProducts = products.filter((product: Product) =>
      categories.includes(product.category)
    );

    console.log(`Fetched ${filteredProducts.length} products for the requested categories`);

    return filteredProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Ensures categories are loaded, fetching them if necessary
 */
export async function ensureCategoriesLoaded(categories: string[]): Promise<void> {
  if (!categories || categories.length === 0) return;

  const cache = global.productCache!;

  // Filter out categories we've already fetched recently
  const categoriesToFetch = categories.filter(category => {
    const lastFetch = cache.lastFetchTime.get(category) || 0;
    const isCacheValid = Date.now() - lastFetch < CACHE_TTL;
    return !isCacheValid || !cache.fetchedCategories.has(category);
  });

  if (categoriesToFetch.length === 0) {
    console.log("All requested categories are already in cache");
    return;
  }

  console.log(`Fetching ${categoriesToFetch.length} categories that need updating`);

  // Fetch products for these categories
  const newProducts = await fetchProductsByCategory(categoriesToFetch);

  // Update the cache with new products
  categoriesToFetch.forEach(category => {
    // Initialize with an empty array if no products for this category
    const categoryProducts = newProducts.filter(p => p.category === category);
    cache.categoryProducts.set(category, categoryProducts);
    cache.fetchedCategories.add(category);
    cache.lastFetchTime.set(category, Date.now());
  });
}

/**
 * Gets all products from categories that have been fetched
 */
export async function getAllProducts(): Promise<Product[]> {
  const cache = global.productCache!;
  // Return products from all categories that have been loaded
  return Array.from(cache.categoryProducts.values()).flat();
}

/**
 * Gets all categories that have been fetched
 */
export async function getAllCategories(): Promise<string[]> {
  const cache = global.productCache!;
  return Array.from(cache.fetchedCategories);
}

/**
 * Gets products by category - fetches if needed
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  // Make sure the category is loaded
  await ensureCategoriesLoaded([category]);

  // Return products for this category
  return global.productCache!.categoryProducts.get(category) || [];
}

/**
 * Gets products by multiple categories - fetches if needed
 * Now supports pagination with offset and limit
 */
export async function getProductsByCategories(
  categories: string[],
  pagination?: { offset: number, limit: number }
): Promise<Product[]> {
  // Make sure all categories are loaded
  await ensureCategoriesLoaded(categories);

  const cache = global.productCache!;

  // Get products for all requested categories
  const products = categories.flatMap(category =>
    cache.categoryProducts.get(category) || []
  );

  // Deduplicate in case products appear in multiple categories
  const uniqueProducts = Array.from(
    new Map(products.map(product => [product.id, product])).values()
  );

  // Apply pagination if provided
  if (pagination) {
    const { offset, limit } = pagination;
    return uniqueProducts.slice(offset, offset + limit);
  }

  return uniqueProducts;
}

/**
 * Searches for products by query in title
 * Note: This only searches through categories that have already been fetched
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const allProducts = await getAllProducts();

  const normalizedQuery = query.toLowerCase();
  return allProducts.filter(product =>
    product.titleRO.toLowerCase().includes(normalizedQuery) ||
    product.titleRU.toLowerCase().includes(normalizedQuery) ||
    product.titleEN.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Gets a single product by ID
 * Note: This only searches through categories that have already been fetched
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  const allProducts = await getAllProducts();
  return allProducts.find(product => product.id === id);
}

/**
 * Gets a random selection of products from categories
 * This avoids loading all products first, making it much faster
 */
export async function getRandomProductsFromCategories(
  categories: string[],
  limit: number = 12
): Promise<Product[]> {
  // Make sure all categories are loaded
  await ensureCategoriesLoaded(categories);

  const cache = global.productCache!;
  const allProducts: Product[] = [];

  // Collect products from all requested categories
  categories.forEach(category => {
    const categoryProducts = cache.categoryProducts.get(category) || [];
    allProducts.push(...categoryProducts);
  });

  // Shuffle the array using Fisher-Yates algorithm
  const shuffled = [...allProducts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Deduplicate in case products appear in multiple categories
  const uniqueProducts = Array.from(
    new Map(shuffled.map(product => [product.id, product])).values()
  );

  // Return only the requested number of products
  return uniqueProducts.slice(0, limit);
}

/**
 * Gets a total count of products across categories
 * This is an estimate since we don't want to load all products
 */
export async function getEstimatedProductCount(categories: string[]): Promise<number> {
  // Make sure all categories are loaded
  await ensureCategoriesLoaded(categories);

  const cache = global.productCache!;

  // Just return a fixed value per category to avoid expensive operations
  // This is just an estimate for UI purposes
  return categories.length * 50; // Assume ~50 products per category
}

/**
 * Gets products from categories filtered by price range
 * This loads all products from the categories and filters them by price
 */
export async function getProductsFromCategoriesWithPriceFilter(
  categories: string[],
  priceRange: [number, number],
  limit: number = 12,
  offset: number = 0
): Promise<Product[]> {
  // Make sure all categories are loaded
  await ensureCategoriesLoaded(categories);

  const cache = global.productCache!;
  const allProducts: Product[] = [];

  // Collect products from all requested categories
  categories.forEach(category => {
    const categoryProducts = cache.categoryProducts.get(category) || [];
    allProducts.push(...categoryProducts);
  });

  // Deduplicate in case products appear in multiple categories
  const uniqueProducts = Array.from(
    new Map(allProducts.map(product => [product.id, product])).values()
  );

  // Filter by price range
  const filteredProducts = uniqueProducts.filter(product => {
    // Parse the price (could be string or number)
    const regularPrice = typeof product.price === 'number' ?
      product.price : parseFloat(String(product.price)) || 0;

    const reducedPrice = product.reduced_price ?
      (typeof product.reduced_price === 'number' ?
        product.reduced_price : parseFloat(String(product.reduced_price))) : null;

    // Use reduced price if available, otherwise use regular price
    const finalPrice = reducedPrice !== null ? reducedPrice : regularPrice;

    // Check if the price is within the range
    return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
  });

  // Sort by price (ascending by default)
  const sortedProducts = filteredProducts.sort((a, b) => {
    const priceA = a.reduced_price ? parseFloat(String(a.reduced_price)) : parseFloat(String(a.price));
    const priceB = b.reduced_price ? parseFloat(String(b.reduced_price)) : parseFloat(String(b.price));
    return priceA - priceB;
  });

  console.log(`Found ${filteredProducts.length} products within price range ${priceRange[0]}-${priceRange[1]}`);

  // Apply pagination
  return sortedProducts.slice(offset, offset + limit);
}
