"use client";

import { useState, useEffect } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Product as MockProduct } from "@/app/utils/mock-data";
import { useFavorites } from "@/app/contexts/favorites-context";

// Define our own Product interface with source property
interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus: number | null;
  imagini: string[];
  stoc: number;
  inStock?: boolean;
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    };
  };
  specificatii?: Record<string, string>;
  descriere?: string;
  source?: string;
}

// Extended Product interface to support both API and related products
interface ApiProduct extends Omit<Product, 'imagini'> {
  images?: Array<{
    url?: string;
    pathGlobal?: string;
  }> | string[];
  image?: string;
  img?: string; // Added for ROST products
  name?: string;
  titleRO?: string; // Added for ROST products
  titleEN?: string; // Added for ROST products
  titleRU?: string; // Added for ROST products
  inStock?: boolean;
  stockQuantity?: number;
  on_stock?: string; // Added for ROST products
  price?: number;
  code?: string;
  SKU?: string; // Added for ROST products
  brand?: string;
  category?: string;
  source?: string; // Added to identify source (rost-api or ultra-api)
}

interface SimilarProductsProps {
  relatedProducts: MockProduct[] | Product[];
  currentProductId: string;
}

export default function SimilarProducts({
  relatedProducts,
  currentProductId,
}: SimilarProductsProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();

  // Show debug info only in development
  const isDev = process.env.NODE_ENV === 'development';
  const [showDebug, setShowDebug] = useState(isDev);

  const [displayMode, setDisplayMode] = useState<"in-stock-only" | "all">("all"); // Default to "all" to show products

  // New state for API products
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current product to extract brand
  const currentProduct = relatedProducts?.find(p => p.id === currentProductId);
  const currentBrand = currentProduct?.specificatii?.brand || '';

  // Fetch products from the API when component mounts
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!currentProductId) return;

      setLoading(true);
      try {
        // Try to fetch similar products from the similar-products API
        const response = await fetch(`/api/similar-products?productId=${currentProductId}&limit=12`);

        if (!response.ok) {
          console.warn('Similar products API returned an error:', response.status, response.statusText);
          setError(`API error: ${response.status}`);

          // If the similar products API fails, try fetching from ROST API
          console.log('Attempting to fetch similar products from ROST API');
          try {
            // If currentProduct has brand info, try to use that for filtering
            if (currentBrand) {
              // Safely encode the brand for the URL
              const brandParam = encodeURIComponent(typeof currentBrand === 'string'
                ? currentBrand
                : (currentBrand ? String(currentBrand) : ''));

              const rostResponse = await fetch(`/api/rost-products?brand=${brandParam}&limit=12&inStock=true`);
              if (rostResponse.ok) {
                const rostData = await rostResponse.json();
                if (rostData.success && rostData.products && rostData.products.length > 0) {
                  console.log(`Fetched ${rostData.products.length} similar products from ROST API using brand: ${currentBrand}`);
                  setApiProducts(rostData.products as ApiProduct[]);
                  setLoading(false);
                  return;
                }
              }
            }

            // If brand filtering didn't work, just get any in-stock products
            const fallbackResponse = await fetch(`/api/rost-products?limit=12&inStock=true`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.success && fallbackData.products && fallbackData.products.length > 0) {
                console.log(`Fetched ${fallbackData.products.length} fallback products from ROST API`);
                setApiProducts(fallbackData.products as ApiProduct[]);
                setLoading(false);
                return;
              }
            }
          } catch (rostError) {
            console.error('Error fetching from ROST API:', rostError);
          }

          setLoading(false);
          return;
        }

        const data = await response.json();
        if (data.success && data.products && data.products.length > 0) {
          console.log(`Fetched ${data.products.length} similar products from API for product ${currentProductId}`);
          setApiProducts(data.products as ApiProduct[]);
        } else {
          console.warn('API returned success but no products:', data);
          setError('No similar products found');
        }
      } catch (err) {
        console.error('Error fetching similar products:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    // Fetch products when component mounts
    fetchSimilarProducts();
  }, [currentProductId, currentBrand]);

  // 1. Decide which products to use - API products if available, otherwise fall back to relatedProducts
  const productsToUse = apiProducts.length > 0
    ? apiProducts as (ApiProduct | Product)[]
    : (relatedProducts || []) as (ApiProduct | Product)[];

  // 2. Filter out current product
  const otherProducts = productsToUse.filter(
    product => product.id !== currentProductId
  );

  // 3. Helper to check stock status across different product structures
  const isProductInStock = (product: ApiProduct | Product) => {
    // ROST products may have on_stock as a string
    if ('on_stock' in product && typeof product.on_stock === 'string') {
      return parseInt(product.on_stock, 10) > 0;
    }

    // API products will have inStock property
    if ('inStock' in product && product.inStock === true) {
      return true;
    }

    // Related products may have stoc property
    if ('stoc' in product && typeof product.stoc === 'number' && product.stoc > 0) {
      return true;
    }

    // Or stockQuantity (from API)
    if ('stockQuantity' in product && typeof product.stockQuantity === 'number' && product.stockQuantity > 0) {
      return true;
    }

    return false;
  };

  // 4. Split products into in-stock and out-of-stock
  const inStockProducts = otherProducts.filter(product => isProductInStock(product));
  const outOfStockProducts = otherProducts.filter(product => !isProductInStock(product));

  // 5. Create final sorted list based on display mode
  let productsToShow = displayMode === "in-stock-only" && inStockProducts.length > 0
    ? inStockProducts
    : [...inStockProducts, ...outOfStockProducts];

  // 6. Limit to a reasonable number (max 8)
  const MAX_PRODUCTS = 8;
  productsToShow = productsToShow.slice(0, MAX_PRODUCTS);

  // 7. Ensure products have valid image arrays
  const validProducts = productsToShow.map(product => {
    // Check if it's a ROST product
    const isRostProduct = 'source' in product && product.source === 'rost-api';

    // Get product name with proper fallbacks for ROST products
    const productName = product.nume ||
      ((product as ApiProduct).name ? (product as ApiProduct).name :
       ((product as ApiProduct).titleRO ? (product as ApiProduct).titleRO :
        ((product as ApiProduct).titleEN ? (product as ApiProduct).titleEN : 'Product')));

    // Get product code with proper fallbacks for ROST products
    const productCode = product.cod ||
      ((product as ApiProduct).code ? (product as ApiProduct).code :
       ((product as ApiProduct).SKU ? (product as ApiProduct).SKU : ''));

    // Base normalized product with default values for required fields
    const normalizedProduct: Product = {
      ...product as any,
      id: product.id || '',
      nume: productName,
      cod: productCode,
      pret: 0, // Default value to avoid null/undefined errors
      imagini: [],
      stoc: 0,
      subcategorie: {
        id: '1',
        nume: 'Electronics',
        categoriePrincipala: {
          id: '1',
          nume: 'Electronics'
        }
      }
    };

    // Set price from appropriate source
    if ('pret' in product && product.pret !== undefined && product.pret !== null) {
      normalizedProduct.pret = Number(product.pret);
    } else if ('price' in product && (product as ApiProduct).price !== undefined && (product as ApiProduct).price !== null) {
      normalizedProduct.pret = Number((product as ApiProduct).price);
    }

    // Round the price to 2 decimal places
    normalizedProduct.pret = Math.round(normalizedProduct.pret * 100) / 100;

    // Set stock from appropriate source
    if ('stoc' in product && typeof product.stoc === 'number') {
      normalizedProduct.stoc = product.stoc;
    } else if ('stockQuantity' in product && typeof (product as ApiProduct).stockQuantity === 'number') {
      normalizedProduct.stoc = (product as ApiProduct).stockQuantity as number;
    } else if ('on_stock' in product && typeof (product as ApiProduct).on_stock === 'string') {
      normalizedProduct.stoc = parseInt((product as ApiProduct).on_stock || '0', 10) || 0;
    }

    // Set subcategory
    normalizedProduct.subcategorie = {
      id: product.subcategorie?.id || '1',
      nume: product.subcategorie?.nume || (product as ApiProduct).category || 'Electronics',
      categoriePrincipala: {
        id: product.subcategorie?.categoriePrincipala?.id || '1',
        nume: product.subcategorie?.categoriePrincipala?.nume || 'Electronics'
      }
    };

    // Set specifications
    normalizedProduct.specificatii = {
      ...(product.specificatii || {}),
      brand: product.specificatii?.brand || (product as ApiProduct).brand || ''
    };

    // Handle images with priority for different formats
    if ('imagini' in product && Array.isArray(product.imagini) && product.imagini.length > 0) {
      // Standard product images array
      normalizedProduct.imagini = product.imagini;
    } else if ('images' in product && Array.isArray((product as ApiProduct).images) && (product as ApiProduct).images!.length > 0) {
      // API product images array
      const images = (product as ApiProduct).images || [];
      normalizedProduct.imagini = images.map(img =>
        typeof img === 'string' ? img :
        (img && typeof img === 'object' && (img.url || img.pathGlobal)) ?
          (img.url || img.pathGlobal || '') : ''
      ).filter(Boolean);
    } else if ('image' in product && (product as ApiProduct).image) {
      // API product single image
      normalizedProduct.imagini = [(product as ApiProduct).image as string];
    } else if ('img' in product && (product as ApiProduct).img) {
      // ROST product image
      let rostImageUrl = (product as ApiProduct).img as string;
      if (!rostImageUrl.startsWith('http')) {
        rostImageUrl = `https://www.rostimport.md${rostImageUrl.startsWith('/') ? '' : '/'}${rostImageUrl}`;
      }
      normalizedProduct.imagini = [rostImageUrl];
    } else {
      // Fallback placeholder
      normalizedProduct.imagini = ['https://placehold.co/400x400/png?text=Product'];
    }

    // Add source if available
    if ('source' in product) {
      normalizedProduct.source = (product as ApiProduct).source;
    }

    return normalizedProduct;
  });

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (!api || isPaused || validProducts.length <= 4) return;

    const interval = setInterval(() => {
      if (!isPaused && api) {
        api.scrollNext();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [api, isPaused, validProducts]);

  // Debug information
  console.log(`Using: ${apiProducts.length > 0 ? 'API Products' : 'Related Products'}`);
  console.log(`API Products: ${apiProducts.length}, Related Products: ${relatedProducts?.length || 0}`);
  console.log(`Found ${validProducts.length} similar products to display`);
  console.log(`In-stock products: ${inStockProducts.length}, Out-of-stock: ${outOfStockProducts.length}`);

  if (validProducts.length > 0) {
    const firstProduct = validProducts[0];
    console.log("First product:", firstProduct);
    console.log("Stock properties:", {
      stoc: 'stoc' in firstProduct ? firstProduct.stoc : undefined,
      inStock: 'inStock' in firstProduct ? firstProduct.inStock : undefined,
      stockQuantity: 'stockQuantity' in firstProduct ? firstProduct.stockQuantity : undefined,
      isInStock: isProductInStock(firstProduct)
    });
  }

  // Allow toggling debug info
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press Alt+D to toggle debug mode
      if (e.altKey && e.key === 'd') {
        setShowDebug(prev => !prev);
      }

      // Press Alt+S to toggle display mode
      if (e.altKey && e.key === 's') {
        setDisplayMode(prev => prev === "in-stock-only" ? "all" : "in-stock-only");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mt-12 bg-gray-50 rounded-lg p-5 sm:p-6 border border-border/50">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            {t("product_similar_products")}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-1 w-10 bg-primary rounded-full"></div>
            <p className="text-muted-foreground text-sm hidden md:block">
              {t("product_similar_description") ||
                "Products you might also like"}
            </p>
          </div>
        </div>


      </div>



      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading similar products...</p>
        </div>
      ) : validProducts.length > 0 ? (
        <div className="relative max-w-full overflow-hidden">
          <Carousel
            className="w-full cursor-grab active:cursor-grabbing"
            setApi={setApi}
            opts={{
              align: "start",
              loop: validProducts.length > 4,
              dragFree: true,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CarouselContent>
              {validProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className={`${
                    isMobile
                      ? "basis-full sm:basis-1/2"
                      : "basis-1/2 md:basis-1/3 lg:basis-1/4"
                  } pl-4`}
                >
                  <Link href={`/produs/${product.id}`} passHref>
                    <div className="h-full block">
                      {isMobile ? (
                        <ProductCardCompact
                          product={product as any}
                          onAddToFavorites={() => toggleFavorite(product.id)}
                          disableLink={true}
                        />
                      ) : (
                        <ProductCard
                          product={product as any}
                          onAddToFavorites={() => toggleFavorite(product.id)}
                          disableLink={true}
                        />
                      )}
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          <p>No similar products available.</p>
          <p className="mt-2 text-xs">
            {error || "Check that products API is configured correctly."}
          </p>
        </div>
      )}
      <Toaster />
    </div>
  );
}
