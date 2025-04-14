// Product API fetching at build time
"use server";

import "server-only";
import { allProducts as mockProducts } from "@/app/utils/mock-data";

// Base common product properties
interface BaseProduct {
  id: string;
  category: string;
  nomenclatureType?: string;
}

// Legacy API product format
interface LegacyProduct extends BaseProduct {
  SKU: string;
  titleRO: string;
  titleRU: string;
  titleEN: string;
  price: string;
  reduced_price?: string;
  min_qty: string;
  on_stock: string;
  img: string;
}

// Ultra API product format
interface UltraProduct extends BaseProduct {
  name: string;
  description: string;
  fullName?: string;
  article?: string;
  price: number;
  originalPrice: number;
  discount: number;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  isNew: boolean;
  isFeatured: boolean;
  image: string;
  images: Array<{id: string; url: string; alt?: string}>;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

// Product type that can be either format
export type Product = LegacyProduct | UltraProduct | (UltraProduct & {
  source?: string;
  characteristics?: Array<{
    name: string;
    code: string;
    propertyList?: {
      propertyValue: Array<{
        simpleValue: string;
      }>
    }
  }>;
});

// Type guards to check which format a product is in
export async function isLegacyProduct(product: Product): Promise<boolean> {
  return 'SKU' in product && 'titleRO' in product;
}

export async function isUltraProduct(product: Product): Promise<boolean> {
  return 'name' in product && 'description' in product;
}

// Synchronous helpers for internal use (not exported as Server Actions)
function _isLegacyProduct(product: Product): product is LegacyProduct {
  return 'SKU' in product && 'titleRO' in product;
}

function _isUltraProduct(product: Product): product is UltraProduct {
  return 'name' in product && 'description' in product;
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
    // Store products by ID for direct lookup
    productsById: Map<string, Product>;
    // Track which categories have been fetched
    fetchedCategories: Set<string>;
    // Last fetch time by category to handle TTL
    lastFetchTime: Map<string, number>;
    // Track if specific product IDs have been fetched
    specificProductsFetched: boolean;
  } | undefined;
}

// Initialize global cache if not already done
if (!global.productCache) {
  global.productCache = {
    categoryProducts: new Map(),
    productsById: new Map(),
    fetchedCategories: new Set(),
    lastFetchTime: new Map(),
    specificProductsFetched: false
  };
}

// List of specific product IDs we want to fetch - internal constant, not exported
const SPECIFIC_PRODUCT_IDS = [
  "48512", "19462", "19447", "68394", "68395",
  "3587", "3544", "738", "19463", "44962",
  "19465", "19464"
];

/**
 * Get the list of specific product IDs we're targeting
 */
export async function getSpecificProductIds(): Promise<string[]> {
  return SPECIFIC_PRODUCT_IDS;
}

// Category mappings for translations
const categoryMappings: Record<string, CategoryMapping> = {
  // Example mappings...
};

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 3600 * 1000;

// Convert mock products to our LegacyProduct interface
function convertMockProducts(): LegacyProduct[] {
  return mockProducts.map(mockProduct => {
    // Set nomenclatureType to smartphone ID for products in smartphone subcategory
    const isSmartphone = mockProduct.subcategorie.nume.toLowerCase().includes('smartphone') ||
                         mockProduct.nume.toLowerCase().includes('smartphone') ||
                         mockProduct.subcategorie.categoriePrincipala.nume.toLowerCase().includes('telefon');

    return {
      id: mockProduct.id,
      SKU: mockProduct.cod,
      titleRO: mockProduct.nume,
      titleRU: mockProduct.nume,
      titleEN: mockProduct.nume,
      price: mockProduct.pret.toString(),
      reduced_price: mockProduct.pretRedus ? mockProduct.pretRedus.toString() : undefined,
      min_qty: "1",
      on_stock: mockProduct.stoc.toString(),
      img: mockProduct.imagini[0],
      category: mockProduct.subcategorie.categoriePrincipala.id,
      nomenclatureType: isSmartphone ? "d66ca3b3-4e6d-11ea-b816-00155d1de702" : undefined
    };
  });
}

/**
 * Initialize product cache with specific categories
 * This is a compatibility function for the old API approach
 */
export async function initializeProductCache(categories?: string[]): Promise<void> {
  console.log("Using mock product data system with specific products");

  // Always fetch specific products first
  await fetchSpecificProductsByIds();

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
 * Fetches specific products by IDs
 */
export async function fetchSpecificProductsByIds(): Promise<Product[]> {
  try {
    const cache = global.productCache!;

    // If already fetched, return from cache
    if (cache.specificProductsFetched) {
      console.log("Specific products already fetched, returning from cache");
      return Array.from(cache.productsById.values());
    }

    console.log("Fetching products from mock data");

    // Convert mock products to our format
    const products = convertMockProducts();

    // Filter to specific IDs if needed
    const specificProducts = products.filter(p => SPECIFIC_PRODUCT_IDS.includes(p.id));

    // If we don't have enough specific products, just use all mock products
    const productsToUse = specificProducts.length >= SPECIFIC_PRODUCT_IDS.length
      ? specificProducts
      : products;

    console.log(`Using ${productsToUse.length} products from mock data`);

    // Store products in both caches
    productsToUse.forEach((product: Product) => {
      // Store by ID for direct lookup
      cache.productsById.set(product.id, product);

      // Add to category cache too for compatibility
      if (product.category) {
        const categoryProducts = cache.categoryProducts.get(product.category) || [];
        cache.categoryProducts.set(product.category, [...categoryProducts, product]);
        cache.fetchedCategories.add(product.category);
        cache.lastFetchTime.set(product.category, Date.now());
      }
    });

    // Mark as fetched
    cache.specificProductsFetched = true;

    return productsToUse;
  } catch (error) {
    console.error("Error fetching specific products:", error);
    return [];
  }
}

/**
 * Gets all specific products that have been fetched
 */
export async function getSpecificProducts(): Promise<Product[]> {
  // Ensure specific products are fetched
  await fetchSpecificProductsByIds();

  // Return all specific products
  return Array.from(global.productCache!.productsById.values());
}

/**
 * Fetches products for specific categories
 */
async function fetchProductsByCategory(categories: string[]): Promise<Product[]> {
  try {
    console.log(`Fetching products for categories: ${categories.join(', ')} from mock data`);

    // Convert mock products to our format
    const products = convertMockProducts();

    // Filter to categories
    const filteredProducts = products.filter(product =>
      categories.includes(product.category)
    );

    console.log(`Fetched ${filteredProducts.length} products for the requested categories from mock data`);

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

  // Store in cache
  if (newProducts.length > 0) {
    for (const product of newProducts) {
      const category = product.category;
      if (category) {
        // Update category cache
        const currentCategoryProducts = cache.categoryProducts.get(category) || [];
        cache.categoryProducts.set(category, [...currentCategoryProducts, product]);

        // Mark category as fetched
        cache.fetchedCategories.add(category);
        cache.lastFetchTime.set(category, Date.now());

        // Update by-ID cache
        cache.productsById.set(product.id, product);
      }
    }
  }
}

/**
 * Gets all products across all categories
 */
export async function getAllProducts(): Promise<Product[]> {
  const allProducts = convertMockProducts();
  return allProducts;
}

/**
 * Gets all unique categories from products
 */
export async function getAllCategories(): Promise<string[]> {
  const products = await getAllProducts();
  const categories = Array.from(new Set(products.map(product => product.category)));
  return categories;
}

/**
 * Gets products for a specific category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  await ensureCategoriesLoaded([category]);
  return global.productCache!.categoryProducts.get(category) || [];
}

/**
 * Gets products across multiple categories with optional pagination
 */
export async function getProductsByCategories(
  categories: string[],
  pagination?: { offset: number, limit: number }
): Promise<Product[]> {
  // Ensure all categories are loaded
  await ensureCategoriesLoaded(categories);

  // Collect products from all requested categories
  const cache = global.productCache!;
  let allProducts: Product[] = [];

  for (const category of categories) {
    const categoryProducts = cache.categoryProducts.get(category) || [];
    allProducts = [...allProducts, ...categoryProducts];
  }

  // Deduplicate by ID
  const uniqueProducts = Array.from(new Map(allProducts.map(product => [product.id, product])).values());

  // Apply pagination if provided
  if (pagination) {
    const { offset, limit } = pagination;
    return uniqueProducts.slice(offset, offset + limit);
  }

  return uniqueProducts;
}

/**
 * Searches products by text match in title
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();
  const lowercaseQuery = query.toLowerCase();

  return products.filter(product => {
    if (_isLegacyProduct(product)) {
      return product.titleRO.toLowerCase().includes(lowercaseQuery) ||
             product.titleRU.toLowerCase().includes(lowercaseQuery) ||
             product.titleEN.toLowerCase().includes(lowercaseQuery);
    } else if (_isUltraProduct(product)) {
      return product.name.toLowerCase().includes(lowercaseQuery) ||
             product.description.toLowerCase().includes(lowercaseQuery);
    }
    return false;
  });
}

/**
 * Gets a product by ID
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  await fetchSpecificProductsByIds();
  return global.productCache!.productsById.get(id);
}

/**
 * Gets random products from specified categories
 */
export async function getRandomProductsFromCategories(
  categories: string[],
  limit: number = 12
): Promise<Product[]> {
  // Get products from all requested categories
  const allProducts = await getProductsByCategories(categories);

  // If we have fewer products than the limit, return all of them
  if (allProducts.length <= limit) {
    return allProducts;
  }

  // Shuffle the array
  const shuffled = [...allProducts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return the first 'limit' products
  return shuffled.slice(0, limit);
}

/**
 * Gets an estimated count of products across categories
 */
export async function getEstimatedProductCount(categories: string[]): Promise<number> {
  // Ensure categories are loaded
  await ensureCategoriesLoaded(categories);

  // Count products
  const cache = global.productCache!;
  let count = 0;

  for (const category of categories) {
    const categoryProducts = cache.categoryProducts.get(category) || [];
    count += categoryProducts.length;
  }

  return count;
}

/**
 * Gets products from categories with price filtering
 */
export async function getProductsFromCategoriesWithPriceFilter(
  categories: string[],
  priceRange: [number, number],
  limit: number = 12,
  offset: number = 0
): Promise<Product[]> {
  // Get all products from the requested categories
  const allProducts = await getProductsByCategories(categories);

  // Apply price filter
  const [minPrice, maxPrice] = priceRange;
  const filteredProducts = allProducts.filter(product => {
    if (_isLegacyProduct(product)) {
      const price = Number(product.reduced_price || product.price);
      return price >= minPrice && price <= maxPrice;
    } else if (_isUltraProduct(product)) {
      // For Ultra API products, use discount price if available
      const effectivePrice = product.discount > 0
        ? product.price
        : product.originalPrice;
      return effectivePrice >= minPrice && effectivePrice <= maxPrice;
    }
    return false;
  });

  // Apply pagination
  return filteredProducts.slice(offset, offset + limit);
}

/**
 * Gets products filtered by nomenclature type ID
 */
export async function getProductsByNomenclatureType(nomenclatureTypeId: string): Promise<Product[]> {
  // Ensure products are loaded
  await fetchSpecificProductsByIds();

  // Get all products
  const allProducts = Array.from(global.productCache!.productsById.values());

  // Filter by nomenclatureType
  return allProducts.filter(product => product.nomenclatureType === nomenclatureTypeId);
}

/**
 * Gets all smartphone products
 */
export async function getSmartphoneProducts(): Promise<Product[]> {
  // Smartphone nomenclature type ID
  const SMARTPHONE_TYPE_ID = "d66ca3b3-4e6d-11ea-b816-00155d1de702";

  return getProductsByNomenclatureType(SMARTPHONE_TYPE_ID);
}

/**
 * Converts a LegacyProduct to UltraProduct format
 * Useful for adapting legacy data to the new API format
 */
export async function convertLegacyToUltraProduct(legacy: LegacyProduct): Promise<UltraProduct> {
  return {
    id: legacy.id,
    name: legacy.titleRO,
    description: `${legacy.titleRO} ${legacy.SKU}`,
    fullName: legacy.titleRO,
    price: parseFloat(legacy.price),
    originalPrice: parseFloat(legacy.reduced_price || legacy.price) * 1.2, // Estimating original price
    discount: legacy.reduced_price ? 20 : 0, // Estimating discount percentage
    currency: "MDL",
    inStock: legacy.on_stock !== "0",
    stockQuantity: parseInt(legacy.on_stock, 10) || 0,
    brand: legacy.titleRO.split(' ')[0] || "Unknown", // Guessing brand from name
    category: legacy.category,
    isNew: false,
    isFeatured: false,
    image: legacy.img,
    images: [{ id: `${legacy.id}-1`, url: legacy.img, alt: legacy.titleRO }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nomenclatureType: legacy.nomenclatureType
  };
}

/**
 * Converts an UltraProduct to LegacyProduct format
 * Useful for backward compatibility
 */
export async function convertUltraToLegacyProduct(ultra: UltraProduct): Promise<LegacyProduct> {
  return {
    id: ultra.id,
    SKU: ultra.article || `SKU-${ultra.id}`,
    titleRO: ultra.name,
    titleRU: ultra.name,
    titleEN: ultra.name,
    price: ultra.price.toString(),
    reduced_price: ultra.discount > 0 ? (ultra.originalPrice * (1 - ultra.discount/100)).toString() : undefined,
    min_qty: "1",
    on_stock: ultra.stockQuantity.toString(),
    img: ultra.image || (ultra.images.length > 0 ? ultra.images[0].url : ""),
    category: ultra.category,
    nomenclatureType: ultra.nomenclatureType
  };
}

/**
 * Gets products from the Ultra API
 * @param limit Number of products to fetch
 */
export async function getUltraAPIProducts(limit: number = 20): Promise<Product[]> {
  try {
    // Try to fetch from the Ultra API first
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_BASE_URL}/products?limit=${limit}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data.products;
  } catch (error) {
    console.error("Error fetching from Ultra API, falling back to legacy:", error);

    // Fall back to legacy products
    const legacyProducts = await getSpecificProducts();

    // Convert legacy products to Ultra format for consistency
    const convertedProducts = [];
    for (const product of legacyProducts) {
      if (_isLegacyProduct(product)) {
        // Internal helper for type checking, then use async conversion
        const ultraProduct = await convertLegacyToUltraProduct(product);
        convertedProducts.push(ultraProduct);
      } else {
        convertedProducts.push(product);
      }
    }
    return convertedProducts;
  }
}

/**
 * Unified function to get products from either API
 * This is the recommended function for new code
 * @param options Configuration options for product fetching
 */
export async function getUnifiedProducts(options: {
  limit?: number;
  preferSource?: 'ultra' | 'legacy' | 'auto';
  forceConversion?: boolean;
  categoryFilter?: string[];
  priceRange?: [number, number];
} = {}): Promise<Product[]> {
  const {
    limit = 20,
    preferSource = 'auto',
    forceConversion = false,
    categoryFilter,
    priceRange
  } = options;

  // Determine which API to use
  let useUltraAPI = preferSource === 'ultra';
  let useLegacyAPI = preferSource === 'legacy';

  // If auto, check environment to decide
  if (preferSource === 'auto') {
    // Check if Ultra API is enabled via environment variable
    const useUltraEnv = process.env.USE_ULTRA_API?.toLowerCase();
    if (useUltraEnv === 'true' || useUltraEnv === '1') {
      useUltraAPI = true;
    } else {
      // Default to legacy for now
      useLegacyAPI = true;
    }
  }

  let products: Product[] = [];

  // Fetch products from appropriate source
  if (useUltraAPI) {
    try {
      products = await getUltraAPIProducts(limit);
    } catch (error) {
      console.error("Failed to use Ultra API, falling back to legacy:", error);
      useLegacyAPI = true;
    }
  }

  if (useLegacyAPI) {
    if (categoryFilter && categoryFilter.length > 0) {
      products = await getProductsByCategories(categoryFilter);
    } else {
      products = await getSpecificProducts();
    }

    // If forced conversion to Ultra format is requested
    if (forceConversion) {
      const convertedProducts: Product[] = [];

      for (const product of products) {
        if (_isLegacyProduct(product)) {
          // Use the internal type guard and async conversion
          const ultraProduct = await convertLegacyToUltraProduct(product);
          convertedProducts.push(ultraProduct);
        } else {
          convertedProducts.push(product);
        }
      }

      products = convertedProducts;
    }
  }

  // Apply price filtering if requested
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange;
    products = products.filter(product => {
      if (_isLegacyProduct(product)) {
        const price = Number(product.reduced_price || product.price);
        return price >= minPrice && price <= maxPrice;
      } else if (_isUltraProduct(product)) {
        const effectivePrice = product.discount > 0
          ? product.price
          : product.originalPrice;
        return effectivePrice >= minPrice && effectivePrice <= maxPrice;
      }
      return false;
    });
  }

  return products.slice(0, limit);
}

/**
 * Fetches Samsung products for monthly offers
 *
 * @param category Optional category to filter by (smartphones, tvs, tablets)
 * @param limit Number of products to fetch per category
 * @returns Object with product arrays by category, or just one category array
 */
export async function getMonthlyOffers(
  category?: 'smartphones' | 'tvs' | 'tablets',
  limit: number = 16
): Promise<{
  smartphones?: any[],
  tvs?: any[],
  tablets?: any[]
}> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Fix: Remove /api from the base URL since we add it explicitly
    const baseUrl = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL
      : `${API_BASE_URL}/api`;

    let url = `${baseUrl}/monthly-offers`;

    // Add query parameters if provided
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());

    // Append params to URL if any exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log(`Fetching monthly offers from: ${url}`);

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch monthly offers: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // If success is false, throw error
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch monthly offers');
    }

    // Return either the specific category products or the result object with all categories
    if (category && data.products) {
      // Return single category result
      return { [category]: data.products };
    } else {
      // Return all categories
      return data.result || { smartphones: [], tvs: [], tablets: [] };
    }
  } catch (error) {
    console.error('Error fetching monthly offers:', error);
    // Return empty result on error
    return { smartphones: [], tvs: [], tablets: [] };
  }
}

/**
 * Normalizes smartphones from any source to a consistent format
 * This ensures all smartphone products have the necessary properties
 * regardless of their source
 */
export async function normalizeSmartphoneProduct(product: any): Promise<Product> {
  // First determine if it's a legacy or ultra product
  const isLegacy = _isLegacyProduct(product);
  const isUltra = _isUltraProduct(product);

  // Convert legacy products to Ultra format first
  let normalizedProduct = isLegacy
    ? await convertLegacyToUltraProduct(product)
    : { ...product };

  // Verify this is actually a smartphone by checking name
  const nameToCheck = normalizedProduct.name ||
    (isLegacy ? product.titleRO : '') ||
    normalizedProduct.description || '';

  const isSmartphone =
    nameToCheck.toLowerCase().includes('smartphone') ||
    nameToCheck.toLowerCase().includes('iphone') ||
    nameToCheck.toLowerCase().includes('samsung galaxy s') ||
    nameToCheck.toLowerCase().includes('huawei p') ||
    nameToCheck.toLowerCase().includes('xiaomi mi') ||
    nameToCheck.toLowerCase().includes('oneplus') ||
    nameToCheck.toLowerCase().includes('pixel');

  if (!isSmartphone) {
    // Add a proper smartphone flag to help filter more accurately
    normalizedProduct.isSmartphone = false;
  } else {
    normalizedProduct.isSmartphone = true;
  }

  // Ensure all required fields are present
  normalizedProduct.source = isLegacy ? 'legacy' : 'ultra';

  // Ensure nomenclatureType is set for smartphones
  normalizedProduct.nomenclatureType = "d66ca3b3-4e6d-11ea-b816-00155d1de702";

  // Ensure inStock status is correctly set
  normalizedProduct.inStock = isLegacy
    ? product.on_stock !== "0" && parseInt(product.on_stock, 10) > 0
    : !!normalizedProduct.inStock;

  // Extract characteristics from product name if not present
  if (!normalizedProduct.characteristics || !Array.isArray(normalizedProduct.characteristics)) {
    normalizedProduct.characteristics = [];

    // Extract OS info
    if (normalizedProduct.name) {
      const name = normalizedProduct.name.toLowerCase();
      let osMatch = '';

      if (name.includes('android')) osMatch = 'android';
      else if (name.includes('ios') || name.includes('iphone')) osMatch = 'ios';
      else if (name.includes('harmony')) osMatch = 'harmonyos';

      if (osMatch) {
        normalizedProduct.characteristics.push({
          name: 'Operating System',
          code: 'OS',
          propertyList: {
            propertyValue: [{ simpleValue: osMatch }]
          }
        });
      }

      // Extract storage info from name (common patterns like 128GB, 64 GB, etc.)
      const storageRegex = /\b(\d+)\s*gb\b/i;
      const storageMatch = name.match(storageRegex);

      if (storageMatch && storageMatch[1]) {
        normalizedProduct.characteristics.push({
          name: 'Storage',
          code: 'STORAGE',
          propertyList: {
            propertyValue: [{ simpleValue: `${storageMatch[1]}GB` }]
          }
        });
      }

      // Extract RAM info from name (common patterns like 8GB RAM, 6 GB RAM)
      const ramRegex = /\b(\d+)\s*gb\s*ram\b/i;
      const ramMatch = name.match(ramRegex);

      if (ramMatch && ramMatch[1]) {
        normalizedProduct.characteristics.push({
          name: 'RAM',
          code: 'RAM',
          propertyList: {
            propertyValue: [{ simpleValue: `${ramMatch[1]}GB` }]
          }
        });
      }
    }
  }

  return normalizedProduct;
}

/**
 * Gets smartphone products from multiple sources and combines them
 * This function fetches from both the Ultra API and a secondary API,
 * adds a source field to each product, and returns a combined dataset
 */
export async function getSmartphoneProductsFromMultipleSources(): Promise<Product[]> {
  try {
    const SMARTPHONE_TYPE_ID = "d66ca3b3-4e6d-11ea-b816-00155d1de702";
    const products: Product[] = [];

    // First try to get smartphones from the Ultra API
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/products?nomenclatureType=${SMARTPHONE_TYPE_ID}&limit=100`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.products && data.products.length > 0) {
          // Normalize each product
          const ultraProducts = await Promise.all(
            data.products.map(async (product: any) => {
              const normalized = await normalizeSmartphoneProduct(product);
              return normalized;
            })
          );

          // Filter to ensure we only get actual smartphones that are in stock
          const validUltraProducts = ultraProducts.filter(product =>
            (product as any).isSmartphone === true && (product as any).inStock === true
          );

          if (validUltraProducts.length > 0) {
            products.push(...validUltraProducts);
            console.log(`Fetched ${validUltraProducts.length} valid smartphone products from Ultra API`);
          } else {
            console.log(`No valid smartphone products found in Ultra API data`);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching smartphones from Ultra API:", error);
    }

    // Then get smartphones from mock/legacy data as a secondary source
    try {
      const legacyProducts = await getSmartphoneProducts();
      if (legacyProducts && legacyProducts.length > 0) {
        // Normalize each product
        const enhancedLegacyProducts = await Promise.all(
          legacyProducts.map(async (product) => {
            const normalized = await normalizeSmartphoneProduct(product);
            return normalized;
          })
        );

        // Filter to ensure we only get actual smartphones that are in stock
        const validLegacyProducts = enhancedLegacyProducts.filter(product =>
          (product as any).isSmartphone === true && (product as any).inStock === true
        );

        if (validLegacyProducts.length > 0) {
          products.push(...validLegacyProducts);
          console.log(`Fetched ${validLegacyProducts.length} valid smartphone products from legacy source`);
        } else {
          console.log(`No valid smartphone products found in legacy data`);
        }
      }
    } catch (error) {
      console.error("Error fetching smartphones from legacy source:", error);
    }

    // Deduplicate products by ID
    const uniqueProducts = Array.from(
      new Map(products.map(product => [product.id, product])).values()
    );

    console.log(`Returning ${uniqueProducts.length} combined smartphone products`);
    return uniqueProducts;
  } catch (error) {
    console.error("Error in getSmartphoneProductsFromMultipleSources:", error);
    // Return empty array as fallback
    return [];
  }
}
