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

// Cache for products
let productsCache: Product[] = [];
let categoriesCache: Set<string> = new Set();
let categoryProductsMap: Map<string, Product[]> = new Map();
let initialized = false;

// Category mappings for translations (to be filled with your specific categories)
const categoryMappings: Record<string, CategoryMapping> = {
  // Example: Map the same category in different languages
  // "smartphones": {
  //   ro: "Smartphone-uri",
  //   ru: "Смартфоны",
  //   en: "Smartphones"
  // },
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
 * Fetches products from the API
 */
async function fetchProducts(targetCategories?: string[]): Promise<Product[]> {
  try {
    const apiUrl = process.env.ROST_API_KEY;

    if (!apiUrl) {
      throw new Error("ROST_API_KEY is not defined in environment variables");
    }

    // Build the complete URL with any additional parameters
    let url = apiUrl;

    // Add category filters if specified
    if (targetCategories && targetCategories.length > 0) {
      // Check if URL already has parameters
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}categories=${targetCategories.join(',')}`;
    }

    console.log(`Fetching products from: ${url.split('?')[0]}...`); // Log the base URL for debugging

    const response = await fetch(url, {
      next: { tags: ['products'] }, // For revalidation
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Initializes the product cache
 */
export async function initializeProductCache(targetCategories?: string[]) {
  if (initialized) return;

  console.log("🚀 Initializing product cache...");
  const products = await fetchProducts(targetCategories);
  productsCache = products;

  // Build category cache and map
  products.forEach(product => {
    if (product.category) {
      categoriesCache.add(product.category);

      const categoryProducts = categoryProductsMap.get(product.category) || [];
      categoryProducts.push(product);
      categoryProductsMap.set(product.category, categoryProducts);
    }
  });

  initialized = true;
  console.log(`✅ Product cache initialized with ${products.length} products and ${categoriesCache.size} categories`);
}

/**
 * Gets all products (from cache)
 */
export async function getAllProducts(): Promise<Product[]> {
  return productsCache;
}

/**
 * Gets all categories (from cache)
 */
export async function getAllCategories(): Promise<string[]> {
  return Array.from(categoriesCache);
}

/**
 * Gets products by category (from cache)
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  return categoryProductsMap.get(category) || [];
}

/**
 * Gets products by categories (from cache)
 */
export async function getProductsByCategories(categories: string[]): Promise<Product[]> {
  // Since we're in a server component, we can directly access the map
  // without needing to await the getProductsByCategory function
  return categories.flatMap(category =>
    categoryProductsMap.get(category) || []
  );
}

/**
 * Searches for products by query in title (RO, RU, EN)
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const normalizedQuery = query.toLowerCase();
  return productsCache.filter(product =>
    product.titleRO.toLowerCase().includes(normalizedQuery) ||
    product.titleRU.toLowerCase().includes(normalizedQuery) ||
    product.titleEN.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Gets a single product by ID
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  return productsCache.find(product => product.id === id);
}
