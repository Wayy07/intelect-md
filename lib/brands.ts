/**
 * Brands utility functions
 */

export interface Brand {
  id: string;
  name: string;
  code: string;
  image: string;
}

/**
 * Get all brands from the brands.json file
 */
export async function getAllBrands(): Promise<Brand[]> {
  try {
    // Fetch brands from API endpoint that serves the brands.json file
    const response = await fetch('/api/brands');

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.status}`);
    }

    const brands = await response.json();
    return brands;
  } catch (error) {
    console.error('Error loading brands:', error);
    return [];
  }
}

/**
 * Get a brand by ID
 */
export function getBrandById(brands: Brand[], id: string): Brand | undefined {
  return brands.find(brand => brand.id === id);
}

/**
 * Get a brand by name
 */
export function getBrandByName(brands: Brand[], name: string): Brand | undefined {
  return brands.find(brand => brand.name.toLowerCase() === name.toLowerCase());
}
