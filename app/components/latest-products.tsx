"use client";

import { useState, useEffect, useRef } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useTransform,
} from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Product,
  latestProducts as mockProductsSource,
} from "@/app/utils/mock-data";

// Select a subset of products for this component
const mockProducts = mockProductsSource.slice(0, 4);

export default function LatestProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoAnimationRef = useRef<number | null>(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll animation without interrupting drag behavior
  useEffect(() => {
    if (!api || isPaused) return;

    // Use a regular interval instead of requestAnimationFrame for more controlled timing
    const interval = setInterval(() => {
      if (!isPaused && api) {
        const currentIndex = api.selectedScrollSnap();

        // Instead of jumping directly to the next item, scroll one by one for smoother movement
        // Add a small delay between calls to make the animation more natural
        api.scrollNext();
      }
    }, 6000); // Slower interval - scroll every 6 seconds

    return () => {
      clearInterval(interval);
    };
  }, [api, isPaused, products.length]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        // Use the subset of products
        setProducts(mockProducts);
      } catch (error) {
        console.error("Error setting mock products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate loading delay for mock data
    setTimeout(fetchLatestProducts, 500);
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

  // Duplicate products for continuous scrolling effect
  const extendedProducts = [...products, ...products, ...products];

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6 3xl:px-16 3xl:max-w-[80%]">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  return (
    <>
      <section className="container mx-auto py-12 px-4 sm:px-6 3xl:px-16 3xl:max-w-[80%]">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl flex items-center gap-2">
              {t("newProducts")}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-1 w-12 bg-primary rounded-full"></div>
              <p className="text-muted-foreground hidden md:block">
                {t("discoverLatestProducts")}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Carousel with Shadcn */}
        <div className="relative max-w-full overflow-hidden">
          <Carousel
            className="w-full cursor-grab active:cursor-grabbing"
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CarouselContent>
              {/* Use duplicate products for seamless scrolling */}
              {extendedProducts.map((product, index) => (
                <CarouselItem
                  key={`${product.id}-${index}`}
                  className={`${
                    isMobile
                      ? "basis-3/4 md:basis-1/3"
                      : "basis-1/3 lg:basis-1/4 3xl:basis-1/5"
                  } pl-4`}
                >
                  <Link href={`/produs/${product.id}`} passHref>
                    <div className="h-full block">
                      {isMobile ? (
                        <ProductCardCompact
                          product={product as any}
                          onAddToFavorites={handleAddToFavorites}
                          disableLink={true}
                        />
                      ) : (
                        <ProductCard
                          product={product as any}
                          onAddToFavorites={handleAddToFavorites}
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

        {/* Mobile Carousel with dark design */}
      </section>
      <Toaster />
    </>
  );
}
