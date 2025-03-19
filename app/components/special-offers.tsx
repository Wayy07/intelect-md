"use client";

import { useState, useEffect } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  Product,
  specialOffers as mockProductsSource,
} from "@/app/utils/mock-data";

// Use all products from the expanded special offers list
const mockProducts = mockProductsSource;

export default function SpecialOffers() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

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
        // Use the expanded list of products
        setProducts(mockProducts);
      } catch (error) {
        console.error("Error setting mock products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate loading delay for mock data
    setTimeout(fetchSpecialOffers, 500);
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

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
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
  if (products.length === 0) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t("specialOffers")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("noOffersAvailable")}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container mx-auto py-12 px-4 sm:px-6 3xl:px-16 3xl:max-w-[80%]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl flex items-center gap-2">
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

        {/* Product grid - responsive for both mobile and desktop */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6">
          {products.slice(0, 12).map((product) => (
            <div key={product.id} className="h-full">
              <Link href={`/produs/${product.id}`} className="block h-full">
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
              </Link>
            </div>
          ))}
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
