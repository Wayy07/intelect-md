"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { Tags, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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

  const handleAddToCart = (product: any) => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", product);
    toast({
      title: t("addedToCart"),
      description: t("productAddedToCart"),
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
      <section className="container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[1250px] 3xl:px-16 3xl:max-w-[60%]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl flex items-center gap-2">
              <Tags className="h-10 w-10 text-primary" />
              {t("specialOffers")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("discoverDiscountedProducts")}
            </p>
          </div>

          <Link
            href="/catalog?onSale=true"
            className="hidden md:inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("seeAllOffers")}
          </Link>
        </div>

        {/* Carousel for products instead of grid */}
        <div className="relative max-w-full overflow-hidden">
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
            <CarouselContent>
              {extendedProducts.map((product, index) => (
                <CarouselItem
                  key={`${product.id}-${index}`}
                  className={isMobile ? "basis-1/2 pl-2 sm:basis-1/2" : "basis-1/1 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-3 lg:pl-4"}
                >
                  <Link href={`/produs/${product.id}`} className="block h-full">
                    {isMobile ? (
                      <ProductCardCompact
                        product={product as any}
                        onAddToFavorites={handleAddToFavorites}
                        disableLink={true}
                        hideDiscount={true}
                        onImageError={handleImageError}
                      />
                    ) : (
                      <ProductCard
                        product={product as any}
                        onAddToFavorites={handleAddToFavorites}
                        disableLink={true}
                        hideDiscount={true}
                        onImageError={handleImageError}
                      />
                    )}
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/catalog?onSale=true"
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("seeAllOffers")}
            <span className="ml-1 text-xs">→</span>
          </Link>
        </div>


      </section>
      <Toaster />
    </>
  );
}
