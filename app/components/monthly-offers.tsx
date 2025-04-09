"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { HyperText } from "@/components/magicui/hyper-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Star, Flame, TrendingUp, Gift, Tag, Smartphone, Laptop, Search, Calendar, Clock, ArrowRight, ShoppingCart, Heart, PlusCircle, Truck, Award } from "lucide-react";
import { Product as MockProduct, getRandomProducts } from "@/app/utils/mock-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

// Custom Product Card Component specifically for monthly offers
function OffersProductCard({ product, variantColor }: { product: MockProduct; variantColor: string }) {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const discount = product.pretRedus
    ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
    : 0;

  return (
    <div
      className="group h-full relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top badges */}
      <div className="absolute top-0 left-0 z-10 flex flex-col gap-1.5 justify-start items-start">
        {discount > 0 && (
          <span
            className="py-1 px-2 text-xs font-bold text-white rounded-br-lg shadow-sm"
            style={{ backgroundColor: variantColor }}
          >
            -{discount}%
          </span>
        )}

        {/* Hot Deal badge - now shown on all cards */}
        <span className="py-1 px-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-br-lg shadow-sm flex items-center gap-1">
          <Flame className="h-3 w-3" />
          Hot Deal
        </span>
      </div>

      {/* Fast delivery badge - now shown on all cards */}
      <div className="absolute top-0 right-0 z-10">
        <span className="py-1 px-2 text-xs font-semibold text-white bg-green-500 rounded-bl-lg shadow-sm flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Fast
        </span>
      </div>

      {/* Wishlist button */}
      <button
        className="absolute right-2 top-2 z-20 h-8 w-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(-5px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease'
        }}
      >
        <Heart className="h-4 w-4" />
      </button>

      {/* Image section */}
      <div className="relative overflow-hidden pt-[100%] bg-gray-50">
        <Image
          src={product.imagini[0]}
          alt={product.nume}
          fill
          className={cn(
            "object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
        />


      </div>

      {/* Content section - Removed ratings */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-3 min-h-[40px] group-hover:text-black">
          {product.nume}
        </h3>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {product.pretRedus ? (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through text-xs">{product.pret} MDL</span>
                <span className="font-bold text-lg" style={{ color: variantColor }}>{product.pretRedus} MDL</span>
              </div>
            ) : (
              <span className="font-bold text-lg" style={{ color: variantColor }}>{product.pret} MDL</span>
            )}
          </div>

          {/* Add to cart button */}
          <Button
            size="sm"
            className="rounded-full h-9 w-9 p-0 text-white shadow-sm"
            style={{ backgroundColor: variantColor }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// MacBook Mockup Component
function MacbookMockUp({
  className,
  children,
}: Readonly<{
  className?: string;
  children?: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "relative z-1 mx-auto my-4 w-full max-w-[1200px] transition-all",
        "md:block hidden", // Hide on mobile, show on md and up
        className,
      )}
    >
      <div className="relative z-1 mx-auto my-0 w-full max-w-[1100px] overflow-hidden rounded-[20px] border-2 border-[rgb(200,202,203)] px-[9px] pt-[9px] pb-[23px] bg-[rgb(13,13,13)]">
        {children}
        <div className="absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-b from-[#272727] to-[#0d0d0d]" />
      </div>

      <div className="-ml-8 absolute top-[11px] left-2/4 z-2 h-3 w-16 rounded-br rounded-bl bg-[rgb(13,13,13)]" />
      <div className="-mt-2.5 relative z-9 h-6 w-full max-w-[1200px] rounded-[2px_2px_12px_12px] border-[1px_2px_0px] border-[rgb(160,163,167)] border-solid shadow-[rgb(108,112,116)_0px_-2px_8px_0px_inset] [background:radial-gradient(circle,rgb(226,227,228)_85%,rgb(200,202,203)_100%)] [border-image:initial]">
        <div className="absolute top-0 left-1/2 ml-[-60px] h-2.5 w-[120px] rounded-b-[10px] shadow-[inset_0_0_4px_2px_#babdbf]" />
      </div>
      <div className="-bottom-0.5 absolute left-12 h-0.5 w-10 rounded-b-full bg-neutral-600" />
      <div className="-bottom-0.5 absolute right-12 h-0.5 w-10 rounded-b-full bg-neutral-600" />
    </div>
  );
}

// Mobile Card Wrapper for responsive design
function MobileContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:hidden rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      {children}
    </div>
  );
}

// Define the category variants with new categories and colors
const VARIANTS = [
  {
    id: "iphone",
    title: {
      ro: "iPhone",
      ru: "iPhone"
    },
    subtitle: {
      ro: "Tehnologie inovativă",
      ru: "Инновационные технологии"
    },
    icon: Smartphone,
    color: "#0575E6", // Updated to match gradient
    accent: "bg-blue-600",
    bgClassName: "bg-gradient-to-r from-[#021B79] to-[#0575E6]",
    products: [] as MockProduct[] // Will be populated with random products
  },
  {
    id: "laptops",
    title: {
      ro: "Laptopuri",
      ru: "Ноутбуки"
    },
    subtitle: {
      ro: "Performanță de top",
      ru: "Высокая производительность"
    },
    icon: Laptop,
    color: "#cb2d3e", // Updated to match gradient
    accent: "bg-red-600",
    bgClassName: "bg-gradient-to-r from-[#ef473a] to-[#cb2d3e]",
    products: [] as MockProduct[] // Will be populated with random products
  },
  {
    id: "google",
    title: {
      ro: "Google",
      ru: "Google"
    },
    subtitle: {
      ro: "Smart Home și AI",
      ru: "Умный дом и ИИ"
    },
    icon: Search,
    color: "#004e92", // Updated to match gradient
    accent: "bg-blue-800",
    bgClassName: "bg-gradient-to-r from-[#004e92] to-[#000428]",
    products: [] as MockProduct[] // Will be populated with random products
  }
];

export default function MonthlyOffers() {
  const { t, language } = useLanguage();
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [variants, setVariants] = useState(VARIANTS);
  const [isPaused, setIsPaused] = useState(false);
  const carouselApisRef = useRef<{ [key: string]: CarouselApi | null }>({
    iphone: null,
    laptops: null,
    google: null
  });

  // Determine active variant based on the current week of the year
  const getCurrentVariantIndex = () => {
    // Return the index of the laptops variant to make it active
    return 0; // 1 is the index of laptops
  };

  const [activeTab, setActiveTab] = useState(VARIANTS[getCurrentVariantIndex()].id);

  // Ensure we have exactly 8 products per category
  useEffect(() => {
    const updatedVariants = VARIANTS.map(variant => ({
      ...variant,
      products: getRandomProducts(16).slice(0, 8) // Ensure exactly 8 products
    }));

    setVariants(updatedVariants);
  }, []);

  // Set up countdown timer for one week
  useEffect(() => {
    // Calculate end date (one week from now)
    const now = new Date();
    const weekday = now.getDay();
    const daysUntilNextWeek = 7 - weekday;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilNextWeek);
    endOfWeek.setHours(23, 59, 59, 999);
    const targetDate = endOfWeek.getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // Calculate time components
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);

      // Change variant if countdown is over
      if (distance < 0) {
        // Reset timer
        clearInterval(timer);

        // Get the next variant index
        const nextVariantIndex = (getCurrentVariantIndex() + 1) % VARIANTS.length;
        setActiveTab(VARIANTS[nextVariantIndex].id);

        // Restart timer
        const newEndOfWeek = new Date();
        newEndOfWeek.setDate(newEndOfWeek.getDate() + 7);
        newEndOfWeek.setHours(23, 59, 59, 999);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab]);

  // Auto-scroll animation for each carousel
  useEffect(() => {
    // Only apply to the active tab's carousel
    const currentApi = carouselApisRef.current[activeTab];

    if (!currentApi || isPaused) return;

    const interval = setInterval(() => {
      if (!isPaused && currentApi) {
        currentApi.scrollNext();
      }
    }, 5000); // Scroll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [activeTab, isPaused]);

  // Format the number with leading zero
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };

  // Get current active variant based on activeTab
  const activeVariant = variants.find(v => v.id === activeTab) || variants[0];

  // Create duplicate products for continuous scrolling effect
  const extendedProducts = variants.map(variant => ({
    ...variant,
    extendedProducts: [...variant.products, ...variant.products] // Duplicate products for loop effect
  }));

  // Set up carousel API for each tab - memoize with empty dependency array
  const setCarouselApi = useCallback((variantId: string) => (api: CarouselApi | null) => {
    if (carouselApisRef.current[variantId] !== api) {
      carouselApisRef.current[variantId] = api;
    }
  }, []);

  return (
    <section className="container mx-auto py-8 md:py-12 px-4 sm:px-6 xl:px-6 xl:max-w-[90%] 3xl:px-16 3xl:max-w-[85%] relative">
      <div className="relative z-10">
        <div className="mb-6 md:mb-10 text-center">
          <Badge variant="outline" className="mb-2 py-1.5 px-4 rounded-full border-2"
            style={{
              color: activeVariant.color,
              borderColor: `${activeVariant.color}30`,
              background: `${activeVariant.color}05`
            }}>
            <Flame className="h-3.5 w-3.5 mr-1.5" style={{ color: activeVariant.color }} />
            {t("weeklyOffers") || "Oferte Săptămânale"}
          </Badge>
        </div>

        {/* MacBook Mockup (desktop and tablet only) */}
        <MacbookMockUp>
          <div className={`w-full rounded-t-[10px] border-2 border-[rgb(18,18,18)] border-solid bg-white p-6 flex flex-col ${activeVariant.bgClassName} bg-opacity-50`}>
            {/* Enhanced header with modern design */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-5 mb-6" style={{ borderColor: `${activeVariant.color}30` }}>
              <div className="flex items-center space-x-3 mb-4 md:mb-0">

                <div>
                  <h2 className="font-bold text-3xl text-white/90">
                    {language === 'ru' ? `Акция недели` : `Oferta săptămânii`}
                  </h2>
                  <p className="text-sm text-white/80">
                    {language === 'ru' ? 'Успейте приобрести товары со скидкой до конца недели!' : 'Profită de reduceri substanțiale până la sfârșitul săptămânii!'}
                  </p>
                </div>
              </div>

              {/* Enhanced countdown timer */}
              <div className="flex items-center p-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm border" style={{ borderColor: `${activeVariant.color}30` }}>

                <div className="flex items-center space-x-1.5">
                  <div className="bg-white rounded-lg p-2 text-center w-14 shadow-sm border" style={{ borderColor: `${activeVariant.color}30` }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(days)}</div>
                    <div className="text-[8px] uppercase text-gray-500">{t("days")}</div>
                  </div>
                  <div className="text-gray-400 font-bold">:</div>
                  <div className="bg-white rounded-lg p-2 text-center w-14 shadow-sm border" style={{ borderColor: `${activeVariant.color}30` }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(hours)}</div>
                    <div className="text-[8px] uppercase text-gray-500">{t("hours")}</div>
                  </div>
                  <div className="text-gray-400 font-bold">:</div>
                  <div className="bg-white rounded-lg p-2 text-center w-14 shadow-sm border" style={{ borderColor: `${activeVariant.color}30` }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(minutes)}</div>
                    <div className="text-[8px] uppercase text-gray-500">{t("minutes")}</div>
                  </div>
                  <div className="text-gray-400 font-bold">:</div>
                  <div className="bg-white rounded-lg p-2 text-center w-14 shadow-sm border" style={{ borderColor: `${activeVariant.color}30` }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(seconds)}</div>
                    <div className="text-[8px] uppercase text-gray-500">{t("seconds")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured products carousel with enhanced styling */}
            <div className="flex-1 mb-6 relative">
              <Carousel
                className="w-full cursor-grab active:cursor-grabbing"
                setApi={setCarouselApi(activeVariant.id)}
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: true,
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <CarouselContent>
                  {extendedProducts.find(v => v.id === activeVariant.id)?.extendedProducts.map((product, productIndex) => (
                    <CarouselItem key={`${product.id}-${productIndex}`} className="pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                      <OffersProductCard product={product} variantColor={activeVariant.color} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-1 border-none bg-white/80 hover:bg-white text-gray-800" />
                <CarouselNext className="right-1 border-none bg-white/80 hover:bg-white text-gray-800" />
              </Carousel>
            </div>

            {/* Enhanced call to action */}
            <div className="mt-2 flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border" style={{ borderColor: `${activeVariant.color}30` }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full text-white" style={{ backgroundColor: activeVariant.color }}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{t("limitedTimeOffer") || "Ofertă limitată"}</h3>
                  <p className="text-sm text-gray-500">{t("untilEndOfWeek") || "Până la sfârșitul săptămânii"}</p>
                </div>
              </div>
              <Link href={`/catalog?category=${activeVariant.id}`}>
                <ShimmerButton
                  className="text-white px-6 py-2.5 rounded-xl font-medium"
                  style={{ backgroundColor: activeVariant.color }}
                >
                  {t("shopNow") || "Shop Now"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </MacbookMockUp>

        {/* Mobile version - visible only on small screens */}
        <MobileContent>
          <div className={`p-4 ${activeVariant.bgClassName} relative overflow-hidden`}>
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>

            {/* Enhanced mobile header with modern design */}
            <div className="mb-6 relative z-10">
              {/* Main title with gradient effect */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle, ${activeVariant.color}80 0%, transparent 70%)` }}></div>

                  <h2 className="font-bold text-2xl text-white mb-1 flex items-center">
                    <activeVariant.icon className="h-6 w-6 mr-2 text-white/90" />
                    {language === 'ru' ? `Акция недели` : `Oferta săptămânii`}
                  </h2>
                  <p className="text-sm text-white/80 max-w-[90%]">
                    {language === 'ru' ? 'Успейте приобрести товары со скидкой до конца недели!' : 'Profită de reduceri substanțiale până la sfârșitul săptămânii!'}
                  </p>
                </div>
              </div>

              {/* Enhanced countdown section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5"></div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-full bg-white/20">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/90 font-medium">
                      {language === 'ru' ? 'Осталось времени' : 'Timp rămas'}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 animate-pulse">
                    <Flame className="h-3.5 w-3.5 mr-1" />
                    {t("weeklyOffers") || "Oferte Săptămânale"}
                  </Badge>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-2" style={{ borderColor: `${activeVariant.color}40` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(days)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold">{t("days")}</div>
                  </div>
                  <div className="text-white/80 font-bold">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-2" style={{ borderColor: `${activeVariant.color}40` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(hours)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold">{t("hours")}</div>
                  </div>
                  <div className="text-white/80 font-bold">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-2" style={{ borderColor: `${activeVariant.color}40` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(minutes)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold">{t("minutes")}</div>
                  </div>
                  <div className="text-white/80 font-bold">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-2" style={{ borderColor: `${activeVariant.color}40` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(seconds)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold">{t("seconds")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best deal badge */}
            <div className="relative z-10 mb-4 flex justify-center">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
                <Award className="h-4 w-4 mr-1.5" />
                {language === 'ru' ? 'Лучшие предложения недели' : 'Cele mai bune oferte ale săptămânii'}
              </div>
            </div>

            {/* Enhanced mobile carousel - two items display */}
            <div className="relative">
              <Carousel
                className="w-full cursor-grab active:cursor-grabbing"
                setApi={setCarouselApi(activeVariant.id)}
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: true,
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <CarouselContent>
                  {extendedProducts.find(v => v.id === activeVariant.id)?.extendedProducts.map((product, productIndex) => (
                    <CarouselItem key={`${product.id}-${productIndex}`} className="basis-1/2 pl-2">
                      <OffersProductCard product={product} variantColor={activeVariant.color} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-0 border-none bg-white/80 hover:bg-white shadow-md text-gray-800 h-8 w-8" />
                <CarouselNext className="right-0 border-none bg-white/80 hover:bg-white shadow-md text-gray-800 h-8 w-8" />
              </Carousel>

              {/* Improved carousel indicators */}
              <div className="flex justify-center gap-1.5 mt-4 mb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      height: '6px',
                      width: i === 0 ? '24px' : '6px',
                      backgroundColor: i === 0 ? activeVariant.color : 'rgba(255, 255, 255, 0.4)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Enhanced call to action */}
            <div className="mt-6 relative z-10">
              <ShimmerButton
                className="w-full py-3.5 rounded-lg font-medium text-white shadow-lg flex items-center justify-center"
                style={{ backgroundColor: activeVariant.color }}
              >
                <Link href={`/catalog?category=${activeVariant.id}`} className="flex items-center">
                  {t("shopNow") || "Shop Now"}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </ShimmerButton>

              <div className="mt-3 text-center">
                <span className="text-white/70 text-xs">
                  {language === 'ru' ? '* Акция действует до конца недели' : '* Oferta valabilă până la sfârșitul săptămânii'}
                </span>
              </div>
            </div>
          </div>
        </MobileContent>
      </div>
    </section>
  );
}
