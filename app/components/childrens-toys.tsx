"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { Baby, Bot, Gamepad2, Rocket, Puzzle, Gift, ArrowRight, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  Product,
  childrenToys as mockProductsSource,
} from "@/app/utils/mock-data";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

// We'll use this as a fallback if API fails
const mockProducts = mockProductsSource;

// Toy icons to use randomly in the background
const ToyIcons = [Baby, Bot, Gamepad2, Rocket, Puzzle, Gift, Star, Sparkles];

export default function ChildrensToys() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchToys = async () => {
      try {
        setIsLoading(true);

        // TEMPORARILY SKIP THE DEDICATED ENDPOINT DUE TO 404 ERROR
        // Use fallback approach directly - try multiple strategies for LEGO products
        let response;
        let data;
        let foundLEGOProducts = false;

        // APPROACH 1: Try exact "LEGO" category
        response = await fetch(`/api/rost-products?inStock=true&limit=16&category=${encodeURIComponent("LEGO")}`);
        data = await response.json();

        if (response.ok && data.products && data.products.length >= 4) {
          console.log("Found LEGO products using category=LEGO");
          foundLEGOProducts = true;
        } else {
          // APPROACH 2: Try "Lego mix" category
          response = await fetch(`/api/rost-products?inStock=true&limit=16&category=${encodeURIComponent("Lego mix")}`);
          data = await response.json();

          if (response.ok && data.products && data.products.length >= 4) {
            console.log("Found LEGO products using category=Lego mix");
            foundLEGOProducts = true;
          } else {
            // APPROACH 3: Try direct search for "LEGO"
            response = await fetch(`/api/rost-products?inStock=true&limit=16&search=${encodeURIComponent("LEGO")}`);
            data = await response.json();

            if (response.ok && data.products && data.products.length >= 4) {
              console.log("Found LEGO products using search=LEGO");
              foundLEGOProducts = true;
            }
          }
        }

        // If we couldn't find LEGO products specifically, fall back to other toy categories
        if (!foundLEGOProducts) {
          console.log("No LEGO products found, falling back to other toy categories");

          // Search terms for kids toys in Romanian
        const searchTerms = ["jucării pluș", "jucării copii", "plush toys", "AMEK", "jucării"];
        const categoryTerms = ["jucării", "toys", "copii"];

          // Try with categories
          for (let i = 0; i < categoryTerms.length; i++) {
            response = await fetch(`/api/rost-products?inStock=true&limit=16&category=${encodeURIComponent(categoryTerms[i])}`);
            data = await response.json();
            if (response.ok && data.products && data.products.length >= 4) {
              console.log(`Found products using category=${categoryTerms[i]}`);
              break;
          }
        }

        // If categories didn't return enough products, try with search terms
          if (!response.ok || !data.products || data.products.length < 4) {
          for (const term of searchTerms) {
            response = await fetch(`/api/rost-products?inStock=true&limit=16&search=${encodeURIComponent(term)}`);
              data = await response.json();
              if (response.ok && data.products && data.products.length >= 4) {
                console.log(`Found products using search=${term}`);
              break;
            }
          }
        }

        // If we still don't have enough products, just get any in-stock items
          if (!response.ok || !data.products || data.products.length < 4) {
          response = await fetch(`/api/rost-products?inStock=true&limit=16`);
            data = await response.json();
            console.log("Using general in-stock products as fallback");
          }
        }

        if (response.ok && data && data.products) {
          // Check if we need to enrich product data
          const productsNeedingImages = data.products.filter((p: any) =>
            !p.imagini || (Array.isArray(p.imagini) && p.imagini.length === 0)
          );

          // If any products are missing images, use default LEGO image for them
          if (productsNeedingImages.length > 0) {
            console.log(`Adding default images for ${productsNeedingImages.length} products`);
            productsNeedingImages.forEach((p: any) => {
              p.imagini = ["https://img.freepik.com/free-photo/colorful-plastic-building-blocks-white-background_1205-548.jpg"];
            });
          }

          // Map ROST API products to our Product format
          const mappedProducts = data.products.map((product: any) => ({
            id: product.id,
            nume: product.nume,
            cod: product.cod,
            pret: Math.round(parseFloat(product.pret) * 100) / 100,
            pretRedus: product.pretRedus ? Math.round(parseFloat(product.pretRedus) * 100) / 100 : null,
            imagini: Array.isArray(product.imagini) ? product.imagini : [product.imagini].filter(Boolean),
            stoc: parseInt(product.stoc || "0", 10),
            inStock: true,
            brand: product.specificatii?.brand || product.brand || "LEGO",
            subcategorie: product.subcategorie || {
              id: "lego",
              nume: "LEGO",
              categoriePrincipala: {
                id: "jucarii",
                nume: "Jucării pentru Copii"
              }
            },
            descriere: product.descriere || "",
            source: "rost-api"
          }));

          setProducts(mappedProducts);
        } else {
          console.error("Error fetching products:", response.statusText);
          // Use mock data as fallback
          setProducts(mockProducts);

          toast({
            title: "Eroare",
            description: "Nu s-au putut încărca datele. Se folosesc date demonstrative.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching toys:", error);
        // Use mock data as fallback
        setProducts(mockProducts);

        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca datele. Se folosesc date demonstrative.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchToys();
  }, [toast]);

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
    // TODO: Implement cart functionality
    console.log("Add to cart:", product);
    toast({
      title: t("addedToCart"),
      description: t("productAddedToCart"),
    });
  };

  const handleAddToFavorites = (product: Product) => {
    // TODO: Implement favorites functionality
    console.log("Add to favorites:", product);
    toast({
      title: t("addedToFavorites"),
      description: t("productAddedToFavorites"),
    });
  };

  // Filter out products with failed images
  const validProducts = products.filter(product => !failedProductIds.has(product.id as string));

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

  // No products available
  if (validProducts.length === 0) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%]">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-xl">
            {t("childrenToys") || "Jucării pentru Copii"}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("noChildrenToysAvailable") || "Nu există jucării disponibile în prezent"}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[1250px] 3xl:px-16 3xl:max-w-[60%]">
        {/* Improved background with more contrast - removing all floating icons */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Main background with deeper gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/90 via-white to-primary/5 opacity-90"></div>

          {/* Radial gradient for depth */}
          <div className="absolute top-1/3 left-1/3 w-[800px] h-[800px] rounded-full radial-gradient opacity-50"></div>

          {/* Diagonal stripes for texture and contrast */}
          <div className="absolute inset-0 diagonal-stripes opacity-5"></div>
        </div>

        {/* Playful background with subtle patterns */}
        <div className="relative mb-16 overflow-hidden">
          {/* Brand new animated header design */}
          <div className="relative z-10">
            {/* Enhanced animated gradient background */}
            <div className="absolute inset-0 bg-gradient-animation rounded-xl"></div>

            {/* Add subtle animated pattern overlay */}
            <div className="absolute inset-0 pattern-dots opacity-10 animate-pulse-slow"></div>

            {/* Add soft glow elements at corners - responsive sizes */}
            <div className="absolute -top-5 sm:-top-10 -left-5 sm:-left-10 w-24 sm:w-40 h-24 sm:h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute -bottom-5 sm:-bottom-10 -right-5 sm:-right-10 w-24 sm:w-40 h-24 sm:h-40 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-glow-delayed"></div>

            {/* Shimmer effect across the top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent animate-shimmer-horizontal"></div>

            {/* Main content container with enhanced effects */}
            <div className="relative bg-primary rounded-xl p-4 sm:p-8 overflow-hidden backdrop-blur-sm border border-indigo-500/20">
              {/* Add animated gradient mesh background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-mesh-gradient opacity-20"></div>
                <div className="absolute inset-0 bg-noise-pattern opacity-5 mix-blend-overlay"></div>
              </div>

              {/* Add subtle light beam effect */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-80 bg-gradient-to-b from-white/5 via-white/10 to-transparent rotate-15 blur-2xl animate-rotate-slow"></div>

              {/* Content layout */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 relative">
                {/* Title and icon group */}
                <motion.div
                  className="flex items-center gap-5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Enhanced icon container with glow effect */}
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative animate-float-forever" style={{ animationDelay: "0.5s" }}>
                      {/* Add shadow blob that animates separately */}
                      <div className="absolute -inset-2 bg-primary/30 rounded-full blur-md"></div>

                      {/* Pulsing glow ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur opacity-75 animate-pulse-glow"></div>

                      <div className="absolute inset-0 bg-white rounded-full shadow-inner"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Baby className="h-10 w-10 text-primary" />
                      </div>

                  </div>
                  </motion.div>

                  {/* Enhanced text effects */}
                  <div>
                    <motion.h2
                      className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-glow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {t("childrenToys") || "Jucării pentru Copii"}
                    </motion.h2>
                    <motion.p
                      className="text-indigo-100 text-sm sm:text-base font-medium mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {t("discoverChildrenToys") || "Descoperă noile jucării pentru copilul tău"}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Enhanced CTA Button with glow effect */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-4 sm:mt-6 md:mt-0 w-full sm:w-auto"
                >
                  <Link href="/catalog?category=jucarii" className="block w-full sm:inline-block">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px 2px rgba(255, 255, 255, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      className="group bg-white text-primary font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg flex items-center justify-center sm:justify-start gap-2 transition-all relative overflow-hidden w-full sm:w-auto"
                    >
                      {/* Add hover glow effect to button */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-indigo-100 to-white opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>

                      <span className="relative z-10">{t("seeAllToys") || "Vezi toate jucăriile"}</span>
                      <motion.div
                        className="relative z-10"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Enhanced decorative dots with animating sizes */}
            <div className="absolute -bottom-3 left-1/4 transform translate-x-1/2 flex -space-x-1">
              {['bg-white', 'bg-yellow-300', 'bg-red-400', 'bg-green-400', 'bg-pink-300'].map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + (i * 0.1), duration: 0.4, type: "spring" }}
                  className={`h-3 w-3 rounded-full shadow-md ${color} z-${10-i} animate-pulse-size`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced carousel with custom navigation buttons */}
        <div className="relative max-w-full z-10 mt-6">
          {/* Add subtle highlight line above carousel */}
          <div className="absolute -top-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

          <Carousel
            className="w-full cursor-grab active:cursor-grabbing"
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CarouselContent className="py-6">
              {extendedProducts.map((product, index) => (
                <CarouselItem
                  key={`${product.id}-${index}`}
                  className={isMobile ? "basis-1/2 pl-2 sm:basis-1/2" : "basis-1/1 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-3 lg:pl-4"}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.04
                    }}
                    transition={{ duration: 0.2 }}
                    className="h-full rounded-xl overflow-hidden border border-primary/10 bg-white relative group"
                  >
                    {/* Add subtle hover effects for product cards */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-primary/5 to-transparent transition-opacity duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 border-2 border-primary/20 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

                    <Link href={`/produs/${product.id}`} className="block h-full relative z-10">
                    {isMobile ? (
                        <ProductCardCompact
                        product={product as any}
                        onAddToFavorites={handleAddToFavorites}
                        disableLink={true}
                          hideDiscount={false}
                          onImageError={() => handleImageError(product.id as string)}
                      />
                    ) : (
                      <ProductCard
                        product={product as any}
                        onAddToFavorites={handleAddToFavorites}
                        disableLink={true}
                          hideDiscount={false}
                          onImageError={() => handleImageError(product.id as string)}
                      />
                    )}
                  </Link>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Enhanced carousel navigation buttons */}
            <div className="hidden md:block">
              <CarouselPrevious className="left-0 bg-white border-primary border text-primary shadow-md hover:bg-primary hover:text-white transition-all duration-200 opacity-90 hover:opacity-100" />
              <CarouselNext className="right-0 bg-white border-primary border text-primary shadow-md hover:bg-primary hover:text-white transition-all duration-200 opacity-90 hover:opacity-100" />
            </div>
          </Carousel>

          {/* Add subtle highlight line below carousel */}
          <div className="absolute -bottom-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
        </div>

        {/* CSS for new animations */}
      <style jsx global>{`
          @keyframes float-forever {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          @keyframes gradient-animation {
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

          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }

          @keyframes pulse-size {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }

          @keyframes shimmer-horizontal {
            0% { background-position: -100% 0; }
            100% { background-position: 200% 0; }
          }

          @keyframes rotate-slow {
            0% { transform: rotate(0deg) translate(-50%, 0); }
            100% { transform: rotate(360deg) translate(-50%, 0); }
          }

          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }

          @keyframes pulse-slow {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 0.7; }
          }

          .animate-float-forever {
            animation: float-forever 4s ease-in-out infinite;
          }

          .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
          }

          .animate-pulse-glow-delayed {
            animation: pulse-glow 3s ease-in-out 1.5s infinite;
          }

          .animate-pulse-size {
            animation: pulse-size 3s ease-in-out infinite;
          }

          .animate-shimmer-horizontal {
            background-size: 200% 100%;
            animation: shimmer-horizontal 3s ease-in-out infinite;
          }

          .animate-rotate-slow {
            transform-origin: center;
            animation: rotate-slow 20s linear infinite;
          }

          .animate-sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }

          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }

          .bg-gradient-animation {
            background: linear-gradient(270deg, #4338CA, #5C50E4, #6366F1);
            background-size: 600% 600%;
            animation: gradient-animation 10s ease infinite;
          }

          .bg-mesh-gradient {
            background-image:
              radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(124, 58, 237, 0.2) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(79, 70, 229, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 50%, rgba(99, 102, 241, 0.1) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(79, 70, 229, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 100%, rgba(124, 58, 237, 0.2) 0px, transparent 50%),
              radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.2) 0px, transparent 50%);
          }

          .bg-noise-pattern {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          }

          .pattern-dots {
            background-image: radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px);
            background-size: 30px 30px;
          }

          .drop-shadow-glow {
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
          }

          .radial-gradient {
            background: radial-gradient(circle, rgba(92, 80, 228, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
          }

          .diagonal-stripes {
            background-image: repeating-linear-gradient(
              45deg,
              rgba(92, 80, 228, 0.05),
              rgba(92, 80, 228, 0.05) 10px,
              rgba(255, 255, 255, 0) 10px,
              rgba(255, 255, 255, 0) 20px
            );
        }
      `}</style>
      </section>
      <Toaster />
    </>
  );
}
