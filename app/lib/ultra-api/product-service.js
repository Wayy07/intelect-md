/**
 * Client-side service for fetching products from the Ultra API server
 */

// API server URL
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:3001';

/**
 * Fetches products from the Ultra API server
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Array of products
 */
export async function fetchProducts(limit = 100) {
  try {
    console.log('Fetching products from API server...');

    const response = await fetch(`${API_SERVER_URL}/api/products?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Fetches special offers (products with discounts) from the Ultra API server
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Array of products with discounts
 */
export async function fetchSpecialOffers(limit = 12) {
  try {
    console.log('Fetching special offers from API server...');

    const response = await fetch(`${API_SERVER_URL}/api/products/special-offers?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch special offers: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch special offers');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching special offers:', error);

    // If API server is unavailable, use fallback mock data
    console.log('Falling back to mock data');
    return getFallbackSpecialOffers(limit);
  }
}

/**
 * Fetches a product by ID from the Ultra API server
 * @param {string} id - Product ID
 * @returns {Promise<Object|null>} Product or null if not found
 */
export async function fetchProductById(id) {
  try {
    console.log(`Fetching product with ID ${id} from API server...`);

    const response = await fetch(`${API_SERVER_URL}/api/products/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data.data || null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    // Return null on error
    return null;
  }
}

/**
 * Provides fallback special offers when the API server is unavailable
 * @param {number} limit - Maximum number of products to return
 * @returns {Array} Array of products with discounts
 */
function getFallbackSpecialOffers(limit = 12) {
  // Simple fallback data
  return Array.from({ length: limit }, (_, i) => ({
    id: `fallback-${i + 1}`,
    name: `Fallback Product ${i + 1}`,
    code: `FP-${i + 1}`,
    description: 'This is a fallback product while the API server is unavailable',
    price: 100 - (i * 5),
    originalPrice: 100,
    discount: (i * 5),
    currency: 'MDL',
    inStock: true,
    stockQuantity: 10,
    brand: 'Fallback Brand',
    category: 'Fallback Category',
    image: 'https://via.placeholder.com/300',
    images: [{ url: 'https://via.placeholder.com/300', alt: 'Placeholder' }]
  }));
}

export default {
  fetchProducts,
  fetchSpecialOffers,
  fetchProductById
};
