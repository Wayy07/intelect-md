"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import { Baby, ChevronRight } from "lucide-react";
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
  type CarouselApi,
} from "@/components/ui/carousel";

// We'll use this as a fallback if API fails
const mockProducts = mockProductsSource;

export default function ChildrensToys() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const carouselApiRef = useRef<CarouselApi | null>(null);

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

        // Search terms for plush toys and children's toys in Romanian
        const searchTerms = ["jucării pluș", "jucării copii", "plush toys", "AMEK", "jucării"];
        const categoryTerms = ["jucării", "toys", "copii"];

        // Try to fetch toys from ROST API
        let response = await fetch(`/api/rost-products?inStock=true&limit=16&category=${encodeURIComponent(categoryTerms[0])}`);

        // If the first category doesn't return enough results, try with others
        if (!response.ok || (await response.clone().json()).products.length < 8) {
          for (let i = 1; i < categoryTerms.length; i++) {
            response = await fetch(`/api/rost-products?inStock=true&limit=16&category=${encodeURIComponent(categoryTerms[i])}`);
            if (response.ok && (await response.clone().json()).products.length >= 8) {
              break;
            }
          }
        }

        // If categories didn't return enough products, try with search terms
        if (!response.ok || (await response.clone().json()).products.length < 8) {
          for (const term of searchTerms) {
            response = await fetch(`/api/rost-products?inStock=true&limit=16&search=${encodeURIComponent(term)}`);
            if (response.ok && (await response.clone().json()).products.length >= 8) {
              break;
            }
          }
        }

        // If we still don't have enough products, just get any in-stock items
        if (!response.ok || (await response.clone().json()).products.length < 8) {
          response = await fetch(`/api/rost-products?inStock=true&limit=16`);
        }

        if (response.ok) {
          const data = await response.json();

          // Map ROST API products to our Product format
          const mappedProducts = data.products.map((product: any) => ({
            id: product.id,
            nume: product.nume,
            cod: product.cod,
            pret: parseFloat(product.pret),
            pretRedus: product.pretRedus ? parseFloat(product.pretRedus) : null,
            imagini: Array.isArray(product.imagini) ? product.imagini : [product.imagini].filter(Boolean),
            stoc: parseInt(product.stoc || "0", 10),
            inStock: true,
            brand: product.specificatii?.brand || "",
            subcategorie: product.subcategorie || {
              id: "1",
              nume: product.category || "Jucării",
              categoriePrincipala: {
                id: "1",
                nume: "Jucării pentru Copii"
              }
            },
            descriere: product.descriere || "",
            source: "rost-api"
          }));

          setProducts(mappedProducts);
        } else {
          console.error("Error fetching ROST products:", response.statusText);
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

  // Create duplicate products for continuous scrolling effect
  const extendedProducts = [...products, ...products];

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%]">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-6">
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
  if (products.length === 0) {
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
      <section className="container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[1250px] 3xl:px-16 3xl:max-w-[60%]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl flex items-center gap-2">
              <Baby className="h-10 w-10 text-primary" />
              {t("childrenToys") || "Jucării pentru Copii"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("discoverChildrenToys") || "Descoperă noile jucării pentru copilul tău"}
            </p>
          </div>

          <Link
            href="/catalog?category=jucarii"
            className="hidden md:inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("seeAllToys") || "Vezi toate jucăriile"}
          </Link>
        </div>

        {/* Carousel for products - similar to latest-products.tsx but using our toys */}
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
                      />
                    ) : (
                      <ProductCard
                        product={product as any}
                        onAddToFavorites={handleAddToFavorites}
                        disableLink={true}
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
            href="/catalog?category=jucarii"
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("seeAllToys") || "Vezi toate jucăriile"}
            <span className="ml-1 text-xs">→</span>
          </Link>
        </div>

        {/* "View all products" button visible on all devices */}
        <div className="mt-12 text-center">
          <Link href="/catalog" className="inline-block">
            <ShimmerButton
              className="px-8 py-3.5 font-medium text-lg rounded-full group relative"
              shimmerColor="#00BFFF"
              shimmerSize="0.03em"
              shimmerDuration="2.5s"
              borderRadius="9999px"
              background="rgba(0, 0, 0, 0.9)"
            >
              <span className="flex items-center gap-2">
                {t("viewAllProducts") || "Vezi Toate Produsele"}
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </ShimmerButton>
          </Link>
        </div>
      </section>
      <Toaster />
    </>
  );
}
