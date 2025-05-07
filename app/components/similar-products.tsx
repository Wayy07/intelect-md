"use client";

import { useState, useEffect, useCallback } from "react";
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
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Product as MockProduct } from "@/app/utils/mock-data";
import { useFavorites } from "@/app/contexts/favorites-context";
import { motion } from "framer-motion";

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
  // Track products with failed images
  const [failedProductIds, setFailedProductIds] = useState<Set<string>>(new Set());

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

  // Handle image error
  const handleImageError = useCallback((productId: string) => {
    console.log(`Product ${productId} has a broken image, removing from display`);
    setFailedProductIds(prev => {
      const updated = new Set(prev);
      updated.add(productId);
      return updated;
    });
  }, []);

  // Fetch products from the API when component mounts
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!currentProductId) return;

      setLoading(true);
      try {
        // Try to fetch similar products from the similar-products API
        const response = await fetch(`/api/similar-products?productId=${currentProductId}&limit=20`);

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

              const rostResponse = await fetch(`/api/rost-products?brand=${brandParam}&limit=20&inStock=true`);
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
            const fallbackResponse = await fetch(`/api/rost-products?limit=20&inStock=true`);
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

  // 2. Filter out current product and products with failed images
  const otherProducts = productsToUse.filter(
    product => product.id !== currentProductId && !failedProductIds.has(product.id)
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
    <section className="mx-auto mt-12 relative z-10">
      {/* Add background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Main background gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#111D4A]/5 via-white to-[#111D4A]/5 opacity-90"></div>

        {/* Radial gradient for depth */}
        <div className="absolute top-1/3 left-1/3 w-[800px] h-[800px] rounded-full navy-radial-gradient opacity-40"></div>

        {/* Diagonal stripes for texture */}
        <div className="absolute inset-0 diagonal-stripes-navy opacity-5"></div>
      </div>

      {/* Enhanced header with subtle animation */}
      <div className="relative z-10 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-animation-navy rounded-xl"></div>

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 pattern-dots-navy opacity-10 animate-pulse-slow"></div>

          {/* Top shimmer effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#111D4A]/30 to-transparent animate-shimmer-horizontal"></div>

          {/* Modern header container */}
          <div className="relative bg-[#111D4A] rounded-xl p-4 sm:p-6 overflow-hidden backdrop-blur-sm border border-[#111D4A]/20 shadow-xl">
            {/* Light effects */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-mesh-gradient-navy opacity-20"></div>
              <div className="absolute top-1/4 right-1/4 w-28 sm:w-40 h-28 sm:h-40 bg-[#111D4A]/20 rounded-full blur-2xl animate-pulse-glow"></div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Enhanced icon */}
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >

                </motion.div>

                <div>
                  <motion.h2
                    className="text-lg font-bold tracking-tight text-white sm:text-4xl drop-shadow-glow-navy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {t("product_similar_products")}
                  </motion.h2>
                  <motion.p
                    className="mt-2 hidden md:block text-[#D1E5E6]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {t("product_similar_description") || "Products you might also like"}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#111D4A] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading similar products...</p>
        </div>
      ) : validProducts.length > 0 ? (
        <div className="relative max-w-full z-10">
          {/* Add subtle highlight line above carousel */}
          <div className="absolute -top-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#111D4A]/30 to-transparent"></div>

          <Carousel
            className="w-full cursor-grab active:cursor-grabbing similar-products-carousel"
            setApi={setApi}
            opts={{
              align: "start",
              loop: validProducts.length > 4,
              dragFree: true,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CarouselContent className="py-4">
              {validProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className={isMobile ? "basis-1/2 pl-2 sm:basis-1/2" : "basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-3 lg:pl-4"}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-xl overflow-hidden border border-[#111D4A]/30 bg-gradient-to-b from-white to-[#111D4A]/5 relative group shadow-md hover:shadow-lg product-card-container"
                  >
                    {/* Card top highlight */}
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#111D4A]/50 via-[#111D4A] to-[#111D4A]/50 opacity-70 z-20"></div>

                    {/* Enhanced hover effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#111D4A]/10 via-[#111D4A]/5 to-transparent transition-opacity duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 border border-[#111D4A]/30 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

                    {/* Add subtle corner accent */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#111D4A]/20 to-transparent rounded-bl-xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-[#111D4A]/10 to-transparent rounded-tr-xl"></div>

                    <Link href={`/produs/${product.id}`} className="block h-full relative z-10">
                      {isMobile ? (
                        <ProductCardCompact
                          product={product as any}
                          onAddToFavorites={() => toggleFavorite(product.id)}
                          disableLink={true}
                          onImageError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <ProductCard
                          product={product as any}
                          onAddToFavorites={() => toggleFavorite(product.id)}
                          disableLink={true}
                          onImageError={() => handleImageError(product.id)}
                        />
                      )}
                    </Link>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Add carousel navigation */}
            <div className="hidden md:block">
              <CarouselPrevious className="left-0 bg-white border-[#111D4A]/30 border-2 text-[#111D4A] shadow-sm hover:bg-[#111D4A]/10 hover:text-[#0A1133] hover:border-[#111D4A]/50 transition-all duration-200 opacity-90 hover:opacity-100" />
              <CarouselNext className="right-0 bg-white border-[#111D4A]/30 border-2 text-[#111D4A] shadow-sm hover:bg-[#111D4A]/10 hover:text-[#0A1133] hover:border-[#111D4A]/50 transition-all duration-200 opacity-90 hover:opacity-100" />
            </div>
          </Carousel>

          {/* Add subtle highlight line below carousel */}
          <div className="absolute -bottom-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#111D4A]/30 to-transparent"></div>

          {/* Add subtle corner decorations */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#111D4A]/20 rounded-full opacity-60"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#111D4A]/20 rounded-full opacity-60"></div>
        </div>
      ) : (
        <div className="bg-[#111D4A]/5 border border-[#111D4A]/20 text-[#111D4A] p-4 rounded">
          <p>No similar products available.</p>
          <p className="mt-2 text-xs text-[#111D4A]/70">
            {error || "Check that products API is configured correctly."}
          </p>
        </div>
      )}
      <Toaster />

      {/* Add CSS for animations - combined styles */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.7; }
        }

        @keyframes shimmer-horizontal {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-shimmer-horizontal {
          background-size: 200% 100%;
          animation: shimmer-horizontal 3s ease-in-out infinite;
        }

        .bg-gradient-animation-navy {
          background: linear-gradient(270deg, #0A1133, #111D4A, #3D4A7A);
          background-size: 600% 600%;
          animation: gradient-animation-navy 10s ease infinite;
        }

        @keyframes gradient-animation-navy {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .bg-mesh-gradient-navy {
          background-image:
            radial-gradient(at 40% 20%, rgba(17, 29, 74, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(17, 29, 74, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(17, 29, 74, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgba(17, 29, 74, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(17, 29, 74, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 100%, rgba(17, 29, 74, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 0%, rgba(17, 29, 74, 0.2) 0px, transparent 50%);
        }

        .navy-radial-gradient {
          background: radial-gradient(circle, rgba(17, 29, 74, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .diagonal-stripes-navy {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(17, 29, 74, 0.05),
            rgba(17, 29, 74, 0.05) 10px,
            rgba(255, 255, 255, 0) 10px,
            rgba(255, 255, 255, 0) 20px
          );
        }

        .pattern-dots-navy {
          background-image: radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px);
          background-size: 30px 30px;
        }

        .drop-shadow-glow-navy {
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
        }

        /* Product card specific styles for the carousel */
        .similar-products-carousel .product-card-container h3 {
          color: #111827 !important; /* dark gray text */
          transition: color 0.3s ease !important;
        }

        .similar-products-carousel .product-card-container:hover h3 {
          color: #111D4A !important; /* navy on hover */
        }

        /* Override price color */
        .similar-products-carousel .product-card-container .text-primary {
          color: #111D4A !important; /* navy */
        }

        /* Override shimmer button - restore and enhance */
        .similar-products-carousel .product-card-container button[class*="ShimmerButton"] {
          --shimmer-color: rgba(17, 29, 74, 0.5) !important;
          background: rgba(17, 29, 74, 0.95) !important;
        }

        /* Add product card specific indicator */
        .similar-products-carousel .product-card-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, #0A1133, #111D4A, #0A1133);
          z-index: 30;
          opacity: 0.8;
        }

        /* Style card border */
        .similar-products-carousel .product-card-container {
          border-color: rgba(17, 29, 74, 0.3) !important; /* navy with opacity */
        }

        /* Style heart icon */
        .similar-products-carousel .product-card-container button:has(.lucide-heart) {
          color: #111D4A !important;
        }

        .similar-products-carousel .product-card-container button:has(.lucide-heart[fill="currentColor"]) {
          background-color: rgba(17, 29, 74, 0.2) !important;
        }
      `}</style>
    </section>
  );
}
