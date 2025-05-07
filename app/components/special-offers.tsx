"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { Tags, ChevronRight, Sparkles, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Define Product interface locally instead of importing
interface ProductImage {
  id: string;
  name: string;
  url: string;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  fullName: string;
  article: string;
  images: ProductImage[];
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

export default function SpecialOffers() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const carouselApiRef = useRef<CarouselApi | null>(null);
  // Add state to track products with failed images
  const [failedProductIds, setFailedProductIds] = useState<Set<string>>(new Set());

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchSpecialOffers = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Get API URL from environment or use default
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        console.log('Fetching special offers from:', `${API_URL}/special-offers`);

        // Use the dedicated special-offers endpoint with cache disabled
        const response = await fetch(`${API_URL}/special-offers?limit=18`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching special offers: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch special offers');
        }

        console.log(`Fetched ${data.products.length} special offers`);

        // Debug log to check discount values
        console.log('Special offers discount data:', data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.pret,
          discountedPrice: p.pretRedus,
          hasValidDiscount: p.pretRedus && p.pretRedus < p.pret
        })));

        if (data.products.length === 0) {
          console.log('No special offers found in API');
          setProducts([]);
        } else {
          // Ensure we only treat products as having discounts if pretRedus exists AND is less than pret
          const validatedProducts = data.products.map((product: any) => ({
            ...product,
            // Set pretRedus to null if it's not actually less than pret
            pretRedus: (product.pretRedus && product.pretRedus < product.pret) ? product.pretRedus : null
          }));
          setProducts(validatedProducts);
        }
      } catch (error) {
        console.error("Error fetching special offers:", error);
        setIsError(true);

        toast({
          title: t("error"),
          description: t("errorFetchingProducts"),
          variant: "destructive",
        });

        // Set empty products array on error
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecialOffers();
  }, [toast, t]);

  // Auto-scroll carousel
  useEffect(() => {
    const currentApi = carouselApiRef.current;

    if (!currentApi || isPaused) return;

    const interval = setInterval(() => {
      if (!isPaused && currentApi) {
        currentApi.scrollNext();
      }
    }, 5000); // Scroll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [isPaused]);

  // Callback to set carousel API
  const setCarouselApi = useCallback((api: CarouselApi | null) => {
    if (carouselApiRef.current !== api) {
      carouselApiRef.current = api;
    }
  }, []);

  // Add global style to hide main category tags on mobile
  useEffect(() => {
    const styleTag = document.createElement("style");

    // Target the main category tag specifically based on its position and content
    styleTag.textContent = `
      @media (max-width: 768px) {
        /* Hide main category tag in product cards, keep discount tag visible */
        .absolute.left-3.top-3.z-10.flex.flex-wrap.gap-2 .rounded-full.bg-primary.px-2\\.5.py-1.text-xs.font-medium.text-white:nth-child(2) {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // Handle failed image loading
  const handleImageError = useCallback((productId: string) => {
    console.log(`Product ${productId} has a broken image, removing from carousel`);
    setFailedProductIds(prev => {
      const updated = new Set(prev);
      updated.add(productId);
      return updated;
    });
  }, []);

  const handleAddToCart = (product: Product) => {
    // Here you would typically dispatch to your cart state manager
    // For now, we'll just show a toast notification
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    });
  };

  const handleAddToFavorites = (product: any) => {
    // TODO: Implement favorites functionality
    console.log("Add to favorites:", product);
    toast({
      title: t("addedToFavorites"),
      description: t("productAddedToFavorites"),
    });
  };

  // Filter out products with failed images
  const validProducts = products.filter(product => !failedProductIds.has(product.id));

  // Create duplicate products for continuous scrolling effect
  const extendedProducts = [...validProducts, ...validProducts];

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%]">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-100 animate-pulse">
              <div className="aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // No offers available
  if (validProducts.length === 0) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%]">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-xl">
            {t("specialOffers")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("noOffersAvailable")}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[1250px] 3xl:px-16 3xl:max-w-[60%]">
        {/* Add background effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Main background gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#A31621]/10 via-white to-primary/5 opacity-90"></div>

          {/* Radial gradient for depth */}
          <div className="absolute top-1/3 left-1/3 w-[800px] h-[800px] rounded-full red-radial-gradient opacity-40"></div>

          {/* Diagonal stripes for texture */}
          <div className="absolute inset-0 diagonal-stripes-red opacity-5"></div>
        </div>

        {/* Replace the header section with an enhanced version */}
        <div className="relative z-10 mb-10">
          {/* Header with animated gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-animation-red rounded-xl"></div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 pattern-dots-red opacity-10 animate-pulse-slow"></div>

            {/* Top shimmer effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A31621]/30 to-transparent animate-shimmer-horizontal"></div>

            {/* Main header container - more mobile responsive */}
            <div className="relative bg-[#A31621] rounded-xl p-4 sm:p-6 overflow-hidden backdrop-blur-sm border border-[#A31621]/20 shadow-xl">
              {/* Light effects */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-mesh-gradient-red opacity-20"></div>
                <div className="absolute top-1/4 right-1/4 w-28 sm:w-40 h-28 sm:h-40 bg-[#A31621]/20 rounded-full blur-2xl animate-pulse-glow"></div>
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
                    <div className="relative">
                      {/* Pulsing glow ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#C41B27] to-[#A31621] rounded-full blur opacity-75 animate-pulse-glow"></div>
                      <div className="relative bg-white p-2 rounded-full shadow-inner">
                        <Tags className="h-6 w-6 md:h-10 md:w-10 text-[#A31621]" />
                      </div>
                    </div>
                  </motion.div>

                  <div>
                    <motion.h2
                      className="text-lg font-bold tracking-tight text-white sm:text-4xl drop-shadow-glow-red"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {t("specialOffers")}
                    </motion.h2>
                    <motion.p
                      className="mt-2 hidden md:block text-[#FCDDDF]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {t("discoverDiscountedProducts")}
                    </motion.p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 sm:gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Enhanced CTA button */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="hidden md:block"
                  >
                    <Link
                      href="/catalog?onSale=true"
                      className="group bg-white text-[#A31621] hover:text-[#7D111A] px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                    >
                      <span>{t("seeAllOffers")}</span>
                      <motion.div
                        className="relative"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Enhanced CTA button - mobile visible version */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full sm:hidden"
                  >
                    <Link
                      href="/catalog?onSale=true"
                      className="group bg-white text-[#A31621] hover:text-[#7D111A] px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium w-full"
                    >
                      <span>{t("seeAllOffers")}</span>
                      <motion.div
                        className="relative"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced carousel */}
        <div className="relative max-w-full z-10">
          {/* Add subtle highlight line above carousel */}
          <div className="absolute -top-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#A31621]/30 to-transparent"></div>

          <Carousel
            className="w-full cursor-grab active:cursor-grabbing special-offers-carousel"
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CarouselContent className="py-4">
              {extendedProducts.map((product, index) => (
                <CarouselItem
                  key={`${product.id}-${index}`}
                  className={isMobile ? "basis-1/2 pl-2 sm:basis-1/2" : "basis-1/1 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-3 lg:pl-4"}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-xl overflow-hidden border border-[#A31621]/30 bg-gradient-to-b from-white to-[#A31621]/5 relative group shadow-md hover:shadow-lg product-card-container"
                  >
                    {/* Card top highlight */}
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#A31621]/50 via-[#A31621] to-[#A31621]/50 opacity-70 z-20"></div>

                    {/* Enhanced hover effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#A31621]/10 via-[#A31621]/5 to-transparent transition-opacity duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 border border-[#A31621]/30 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

                    {/* Add subtle corner accent */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#A31621]/20 to-transparent rounded-bl-xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-[#A31621]/10 to-transparent rounded-tr-xl"></div>

                    <Link href={`/produs/${product.id}`} className="block h-full relative z-10">
                      {isMobile ? (
                        <ProductCardCompact
                          product={product as any}
                          onAddToFavorites={handleAddToFavorites}
                          disableLink={true}
                          hideDiscount={true}
                          onImageError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <ProductCard
                          product={product as any}
                          onAddToFavorites={handleAddToFavorites}
                          disableLink={true}
                          hideDiscount={true}
                          onImageError={() => handleImageError(product.id)}
                        />
                      )}
                    </Link>
                    <div className="mt-auto px-3 pb-3 pt-2 flex items-center justify-between">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        size="sm"
                        className="bg-[#A31621] hover:bg-[#7D111A] text-white border-none px-3 w-full shadow-md hover:shadow-lg transition-all duration-300 flex gap-2 items-center justify-center group rounded-md relative overflow-hidden"
                      >
                        <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform text-white" />
                        <span className="font-medium text-white">Add to Cart</span>
                      </Button>

                      {/* Product badge */}
                      <div className="absolute bottom-0 right-0 w-auto">
                        <div className="transform rotate-45 translate-y-[19px] translate-x-[19px] bg-[#A31621] text-[10px] py-0.5 px-6 text-white font-medium shadow-sm">Special</div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Add carousel navigation */}
            <div className="hidden md:block">
              <CarouselPrevious className="left-0 bg-white border-[#A31621]/30 border-2 text-[#A31621] shadow-sm hover:bg-[#A31621]/10 hover:text-[#7D111A] hover:border-[#A31621]/50 transition-all duration-200 opacity-90 hover:opacity-100" />
              <CarouselNext className="right-0 bg-white border-[#A31621]/30 border-2 text-[#A31621] shadow-sm hover:bg-[#A31621]/10 hover:text-[#7D111A] hover:border-[#A31621]/50 transition-all duration-200 opacity-90 hover:opacity-100" />
            </div>
          </Carousel>

          {/* Add subtle highlight line below carousel */}
          <div className="absolute -bottom-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#A31621]/30 to-transparent"></div>

          {/* Add subtle corner decorations */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#A31621]/20 rounded-full opacity-60"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#A31621]/20 rounded-full opacity-60"></div>
        </div>
      </section>
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

        .bg-gradient-animation-red {
          background: linear-gradient(270deg, #7D111A, #A31621, #C41B27);
          background-size: 600% 600%;
          animation: gradient-animation-red 10s ease infinite;
        }

        @keyframes gradient-animation-red {
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

        .bg-mesh-gradient-red {
          background-image:
            radial-gradient(at 40% 20%, rgba(163, 22, 33, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(163, 22, 33, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(163, 22, 33, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgba(163, 22, 33, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(163, 22, 33, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 100%, rgba(163, 22, 33, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 0%, rgba(163, 22, 33, 0.2) 0px, transparent 50%);
        }

        .red-radial-gradient {
          background: radial-gradient(circle, rgba(163, 22, 33, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
        }

        .diagonal-stripes-red {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(163, 22, 33, 0.05),
            rgba(163, 22, 33, 0.05) 10px,
            rgba(255, 255, 255, 0) 10px,
            rgba(255, 255, 255, 0) 20px
          );
        }

        .pattern-dots-red {
          background-image: radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px);
          background-size: 30px 30px;
        }

        .drop-shadow-glow-red {
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
        }

        /* Product card specific styles for the carousel */
        .special-offers-carousel .product-card-container h3 {
          color: #111827 !important; /* dark gray text */
          transition: color 0.3s ease !important;
        }

        .special-offers-carousel .product-card-container:hover h3 {
          color: #A31621 !important; /* red on hover */
        }

        /* Override price color */
        .special-offers-carousel .product-card-container .text-primary {
          color: #A31621 !important; /* red */
        }

        /* Override shimmer button - restore and enhance */
        .special-offers-carousel .product-card-container button[class*="ShimmerButton"] {
          --shimmer-color: rgba(163, 22, 33, 0.5) !important;
          background: rgba(163, 22, 33, 0.95) !important;
        }

        /* Add product card specific indicator */
        .special-offers-carousel .product-card-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, #7D111A, #A31621, #7D111A);
          z-index: 30;
          opacity: 0.8;
        }

        /* Style card border */
        .special-offers-carousel .product-card-container {
          border-color: rgba(163, 22, 33, 0.3) !important; /* red with opacity */
        }

        /* Style heart icon */
        .special-offers-carousel .product-card-container button:has(.lucide-heart) {
          color: #A31621 !important;
        }

        .special-offers-carousel .product-card-container button:has(.lucide-heart[fill="currentColor"]) {
          background-color: rgba(163, 22, 33, 0.2) !important;
        }

        /* ULTRA aggressive styling for ShimmerButton */
        .special-offers-carousel .product-card-container .ShimmerButton-module_root__NGNIl {
          --shimmer-color: rgba(163, 22, 33, 0.5) !important;
          background: linear-gradient(to bottom right, #A31621, #7D111A) !important;
          box-shadow: 0 4px 6px -1px rgba(163, 22, 33, 0.2), 0 2px 4px -2px rgba(163, 22, 33, 0.1) !important;
        }

        /* Target any element inside the product card with shimmer classes */
        .special-offers-carousel .product-card-container [class*="Shimmer"] {
          background: linear-gradient(to bottom right, #A31621, #7D111A) !important;
        }

        /* Try targeting based on internal structure */
        .special-offers-carousel .product-card-container button > span:has([class*="ShoppingCart"]) {
          background: linear-gradient(to bottom right, #A31621, #7D111A) !important;
        }

        /* Apply to all mt-3 buttons in the container - likely the add cart button */
        .special-offers-carousel .product-card-container .mt-3 button {
          background: linear-gradient(to bottom right, #A31621, #7D111A) !important;
          border: none !important;
        }

        /* Direct button targeting */
        .special-offers-carousel button.text-white {
          background: linear-gradient(to bottom right, #A31621, #7D111A) !important;
        }

        /* Extremely specific tag targeting for the shimmer button */
        .special-offers-carousel div[class*="ShimmerButton"],
        .special-offers-carousel div[class*="shimmer"],
        .special-offers-carousel div[class*="Shimmer"] {
          background: linear-gradient(to bottom right, #A31621, #7D111A) !important;
        }

        /* Fix text visibility in button */
        .special-offers-carousel .product-card-container .mt-3 span,
        .special-offers-carousel .product-card-container [class*="Shimmer"] span,
        .special-offers-carousel .product-card-container button span {
          color: white !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          font-weight: 500 !important;
          text-shadow: 0 1px 1px rgba(0,0,0,0.1) !important;
        }

        /* Make sure shopping cart icon is visible */
        .special-offers-carousel .product-card-container .lucide-shopping-cart {
          color: white !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Override any fancy-button styles to ensure they're red */
        .special-offers-carousel .fancy-button,
        .special-offers-carousel .fancy-button::before {
          background: #A31621 !important;
        }

        /* Style 0% badge to match red theme */
        .special-offers-carousel .product-card-container .transform-gpu.rounded-r-md.bg-gradient-to-r.from-primary,
        .special-offers-carousel .product-card-container .transform-gpu.rounded-md.bg-gradient-to-r.from-primary {
          background: linear-gradient(to right, #A31621, #C41B27) !important;
        }

        /* Target the 0% badge text and circle */
        .special-offers-carousel .product-card-container .inline-flex.items-center.justify-center.bg-white.text-primary.rounded-full {
          border: 1px solid rgba(163, 22, 33, 0.2) !important;
          color: #A31621 !important;
        }
      `}</style>
    </>
  );
}
