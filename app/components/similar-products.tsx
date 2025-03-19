"use client";

import { useState, useEffect, useRef } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Product } from "@/app/utils/mock-data";
import { useFavorites } from "@/app/contexts/favorites-context";

interface SimilarProductsProps {
  relatedProducts: Product[];
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
    if (!api || isPaused || relatedProducts.length <= 4) return;

    const interval = setInterval(() => {
      if (!isPaused && api) {
        api.scrollNext();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [api, isPaused, relatedProducts.length]);

  // Filter out the current product if it exists in related products
  const filteredProducts = relatedProducts.filter(
    (product) => product.id !== currentProductId
  );

  if (filteredProducts.length === 0) {
    return null;
  }

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

      {/* Products Carousel */}
      <div className="relative max-w-full overflow-hidden">
        <Carousel
          className="w-full cursor-grab active:cursor-grabbing"
          setApi={setApi}
          opts={{
            align: "start",
            loop: filteredProducts.length > 4,
            dragFree: true,
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <CarouselContent>
            {filteredProducts.map((product) => (
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
      <Toaster />
    </div>
  );
}
