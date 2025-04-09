import { Product } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetch special offers (iPhone products)
 * @param limit - Number of products to fetch
 * @returns List of iPhone products
 */
export async function fetchSpecialOffers(limit: number = 12): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/special-offers?limit=${limit}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Error fetching special offers: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch special offers');
    }

    return data.products;
  } catch (error) {
    console.error('Error in fetchSpecialOffers:', error);

    // Fallback to mock data if needed
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for special offers');
      return generateMockSpecialOffers(limit);
    }

    throw error;
  }
}

/**
 * Fetch all products
 * @param limit - Number of products to fetch
 * @param offset - Offset for pagination
 * @returns List of products
 */
export async function fetchProducts(limit: number = 20, offset: number = 0): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=${limit}&offset=${offset}`, {
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
    console.error('Error in fetchProducts:', error);

    // Fallback to mock data if needed
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for products');
      return generateMockProducts(limit);
    }

    throw error;
  }
}

/**
 * Fetch a product by ID
 * @param id - Product ID
 * @returns Product or null if not found
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data.product;
  } catch (error) {
    console.error(`Error in fetchProductById for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Generate mock special offers for development
 */
function generateMockSpecialOffers(count: number): Product[] {
  const iphones = [
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15',
    'iPhone 15 Plus',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14',
    'iPhone 14 Plus',
    'iPhone SE',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 13 mini'
  ];

  const colors = ['Titanium', 'Gold', 'Silver', 'Space Black', 'Blue', 'Green', 'Purple', 'Red'];
  const storage = ['128GB', '256GB', '512GB', '1TB'];

  return Array.from({ length: count }).map((_, index) => {
    const name = iphones[index % iphones.length];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = storage[Math.floor(Math.random() * storage.length)];
    const basePrice = 800 + (Math.floor(index / 4) * 200); // Increase price based on model tier
    const price = basePrice + (storage.indexOf(size) * 100); // More storage = higher price

    return {
      id: `iphone-${index + 1}`,
      name,
      description: `${name} ${size} ${color}`,
      fullName: `${name} ${size} ${color}`,
      price,
      originalPrice: price * 1.15, // 15% higher original price
      discount: 15,
      currency: 'MDL',
      image: `https://placehold.co/600x400?text=${encodeURIComponent(name)}`,
      images: [
        {
          id: `img-${index}-1`,
          url: `https://placehold.co/600x400?text=${encodeURIComponent(name)}`,
          alt: name
        }
      ],
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      stockQuantity: Math.floor(Math.random() * 20),
      brand: 'Apple',
      category: 'Smartphones',
      isNew: index < 4, // First 4 items are new
      isFeatured: index < 2, // First 2 items are featured
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

/**
 * Generate mock products for development
 */
function generateMockProducts(count: number): Product[] {
  const productTypes = [
    'iPhone', 'iPad', 'MacBook', 'iMac', 'AirPods', 'Apple Watch',
    'Samsung Galaxy', 'Samsung TV', 'Xiaomi Mi', 'OnePlus', 'Google Pixel',
    'Sony Bravia', 'LG OLED', 'Nintendo Switch', 'PlayStation 5', 'Xbox Series X'
  ];

  return Array.from({ length: count }).map((_, index) => {
    const productType = productTypes[index % productTypes.length];
    const price = 500 + Math.floor(Math.random() * 1500);
    const hasDiscount = Math.random() > 0.5;

    return {
      id: `product-${index + 1}`,
      name: `${productType} ${Math.floor(Math.random() * 10)}`,
      description: `High-quality ${productType} with amazing features.`,
      price,
      originalPrice: hasDiscount ? price * 1.2 : price,
      discount: hasDiscount ? 20 : 0,
      currency: 'MDL',
      image: `https://placehold.co/600x400?text=${encodeURIComponent(productType)}`,
      images: [
        {
          id: `img-${index}-1`,
          url: `https://placehold.co/600x400?text=${encodeURIComponent(productType)}`,
          alt: productType
        }
      ],
      inStock: Math.random() > 0.3,
      stockQuantity: Math.floor(Math.random() * 50),
      brand: productType.split(' ')[0],
      category: getCategory(productType),
      isNew: Math.random() > 0.7,
      isFeatured: Math.random() > 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

// Helper to determine category based on product type
function getCategory(productType: string): string {
  if (productType.includes('iPhone') || productType.includes('Galaxy') ||
      productType.includes('Mi') || productType.includes('OnePlus') ||
      productType.includes('Pixel')) {
    return 'Smartphones';
  } else if (productType.includes('iPad')) {
    return 'Tablets';
  } else if (productType.includes('MacBook') || productType.includes('iMac')) {
    return 'Computers';
  } else if (productType.includes('TV') || productType.includes('Bravia') ||
            productType.includes('OLED')) {
    return 'TVs';
  } else if (productType.includes('AirPods')) {
    return 'Audio';
  } else if (productType.includes('Watch')) {
    return 'Wearables';
  } else if (productType.includes('Switch') || productType.includes('PlayStation') ||
            productType.includes('Xbox')) {
    return 'Gaming';
  }
  return 'Electronics';
}
