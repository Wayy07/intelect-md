/**
 * Product image type
 */
export interface ProductImage {
  id: string;
  name?: string;
  url: string;
  alt?: string;
}

/**
 * Product property type
 */
export interface ProductProperty {
  id: string;
  name: string;
  value: string;
  type?: string;
}

/**
 * Product characteristic type
 */
export interface ProductCharacteristic {
  id: string;
  name: string;
  code?: string;
  properties?: ProductProperty[];
}

/**
 * Product type
 */
export interface Product {
  id: string;
  name: string;
  code?: string;
  description: string;
  fullName?: string;
  article?: string;
  images: ProductImage[];
  properties?: ProductProperty[];
  characteristics?: ProductCharacteristic[];
  price: number;
  originalPrice: number;
  discount: number;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  category: string;
  isNew: boolean;
  isFeatured: boolean;
  image: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}
