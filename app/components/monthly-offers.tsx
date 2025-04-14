"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  Flame,
  Laptop,
  Calendar,
  Clock,
  ArrowRight,
  Award
} from "lucide-react";
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
import { ProductCard, ProductCardCompact } from "@/app/components/ui/product-card";

// Define the category variants with focus only on TVs
const VARIANTS = [
  {
    id: "tvs",
    title: {
      ro: "Televizoare",
      ru: "Телевизоры"
    },
    subtitle: {
      ro: "Samsung TV",
      ru: "Samsung TV"
    },
    icon: Laptop,
    color: "#034694", // Samsung dark blue
    accent: "bg-blue-800",
    bgClassName: "bg-gradient-to-br from-[#034694] via-[#1E5AA3] to-[#0A2A5E]", // Enhanced gradient
    products: [] as MockProduct[] // Will be populated with API data
  }
];

// MacBook Mockup Component for desktop view
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

/**
 * Adapter function to ensure mock product compatibility with ProductCard component
 */
function adaptProduct(product: MockProduct): any {
  return {
    ...product,
    // Ensure specificatii is always a Record<string, string> if it exists
    specificatii: product.specificatii ?
      Object.fromEntries(
        Object.entries(product.specificatii).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(", ") : value
        ])
      ) : undefined,
    // Ensure proper category structure for product links
    subcategorie: {
      id: product.subcategorie?.id || product.id || "tvs",
      nume: product.subcategorie?.nume || "Televizoare",
      categoriePrincipala: {
        id: product.subcategorie?.categoriePrincipala?.id || "electronics",
        nume: product.subcategorie?.categoriePrincipala?.nume || "Electronics"
      }
    }
  };
}

export default function MonthlyOffers() {
  const { t, language } = useLanguage();
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [variants, setVariants] = useState(VARIANTS);
  const [isPaused, setIsPaused] = useState(false);
  const carouselApi = useRef<CarouselApi | null>(null);

  // TVs is the only category now
  const activeVariantId = "tvs";

  // Set up countdown timer for the end of the current month
  useEffect(() => {
    const calculateTimeToEndOfMonth = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Time until end of month in milliseconds
      const distance = endOfMonth.getTime() - now.getTime();

      // Calculate time components
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, distance };
    };

    // Update countdown immediately
    const { days, hours, minutes, seconds, distance } = calculateTimeToEndOfMonth();
    setDays(days);
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);

    // Set up interval to update countdown
    const timer = setInterval(() => {
      const { days, hours, minutes, seconds, distance } = calculateTimeToEndOfMonth();

      setDays(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);

      // If countdown is over, reset for next month
      if (distance < 0) {
        clearInterval(timer);

        // Set up for next month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch monthly offers data
  useEffect(() => {
    // Import dynamically to avoid server/client mismatch
    import('@/lib/product-api').then(async ({ getMonthlyOffers }) => {
      try {
        // Fetch monthly offers from the API
        const monthlyOffers = await getMonthlyOffers();

        console.log('Fetched monthly offers:', monthlyOffers);

        // Update variants with real data - now just TVs
        const updatedVariants = VARIANTS.map(variant => {
          const variantId = variant.id as keyof typeof monthlyOffers;
          return {
            ...variant,
            products: monthlyOffers[variantId] || []
          };
        });

        setVariants(updatedVariants);
      } catch (error) {
        console.error('Error fetching monthly offers:', error);
        // Fallback to mock data on error
        const updatedVariants = VARIANTS.map(variant => ({
          ...variant,
          products: getRandomProducts(16).slice(0, 8)
        }));
        setVariants(updatedVariants);
      }
    });
  }, []);

  // Auto-scroll animation for the carousel
  useEffect(() => {
    if (!carouselApi.current || isPaused) return;

    const interval = setInterval(() => {
      if (!isPaused && carouselApi.current) {
        carouselApi.current.scrollNext();
      }
    }, 5000); // Scroll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [isPaused]);

  // Format the number with leading zero
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };

  // Get current active variant
  const activeVariant = variants[0]; // Only one variant now

  // Create duplicate products for continuous scrolling effect if needed
  const products = activeVariant.products;

  // Set up carousel API
  const setCarouselApi = useCallback((api: CarouselApi | null) => {
    if (carouselApi.current !== api) {
      carouselApi.current = api;
    }
  }, []);

  // Get current month name
  const getCurrentMonthName = () => {
    const monthNames = {
      ro: [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie',
        'Mai', 'Iunie', 'Iulie', 'August',
        'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
      ],
      ru: [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август',
        'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ]
    };

    const currentMonth = new Date().getMonth();
    return monthNames[language as keyof typeof monthNames][currentMonth];
  };

  return (
    <section className="container mx-auto py-8 md:py-12 px-4 sm:px-6 xl:px-6 xl:max-w-[90%] 3xl:px-16 3xl:max-w-[85%] relative">
      {/* Decorative background elements - visible on all screens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-blue-400 mix-blend-multiply blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-6 md:mb-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm mb-3">
            <Flame className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {language === 'ru' ? 'Предложения месяца' : 'Ofertele lunii'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mt-3 text-gray-800 drop-shadow-sm">
            {language === 'ru' ? `Предложения ${getCurrentMonthName()}` : `Ofertele lunii ${getCurrentMonthName()}`}
          </h2>
        </div>

        {/* MacBook Mockup (desktop and tablet only) */}
        <MacbookMockUp>
          <div className={`w-full rounded-t-[10px] border-2 border-[rgb(18,18,18)] border-solid bg-white p-6 flex flex-col ${activeVariant.bgClassName} bg-opacity-90 relative overflow-hidden`}>
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>

            {/* Enhanced header with modern design */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-5 mb-6" style={{ borderColor: `${activeVariant.color}30` }}>
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-3xl text-white drop-shadow-md">
                    {language === 'ru' ? `Акция месяца` : `Oferta lunii`}
                  </h2>
                  <p className="text-sm text-white/90 mt-1 max-w-md">
                    {language === 'ru' ? 'Успейте приобрести товары со скидкой до конца недели!' : 'Profită de reduceri substanțiale până la sfârșitul săptămânii!'}
                  </p>
                </div>
              </div>

              {/* Enhanced countdown timer */}
              <div className="flex items-center p-3 rounded-xl bg-white/20 backdrop-blur-md shadow-lg border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-md border-b-2" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(days)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("days")}</div>
                  </div>
                  <div className="text-white font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-md border-b-2" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(hours)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("hours")}</div>
                  </div>
                  <div className="text-white font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-md border-b-2" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(minutes)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("minutes")}</div>
                  </div>
                  <div className="text-white font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-md border-b-2" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(seconds)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("seconds")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured products carousel with ProductCard component */}
            <div className="flex-1 mb-6 relative">
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
                  {products.map((product, productIndex) => (
                    <CarouselItem key={`${product.id}-${productIndex}`} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <ProductCard product={adaptProduct(product)} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-1 border-none bg-white/90 hover:bg-white/100 text-gray-800 shadow-md hover:scale-105 transition-transform" />
                <CarouselNext className="right-1 border-none bg-white/90 hover:bg-white/100 text-gray-800 shadow-md hover:scale-105 transition-transform" />
              </Carousel>

              {/* Carousel indicators */}
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      height: '4px',
                      width: i === 0 ? '20px' : '4px',
                      backgroundColor: i === 0 ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </MacbookMockUp>

        {/* Mobile version - visible only on small screens */}
        <MobileContent>
          <div className={`p-4 ${activeVariant.bgClassName} relative overflow-hidden`}>
            {/* Enhanced decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>

            {/* Enhanced mobile header with modern design */}
            <div className="mb-6 relative z-10">
              {/* Main title with gradient effect */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle, ${activeVariant.color}80 0%, transparent 70%)` }}></div>

                  <h2 className="font-bold text-2xl text-white mb-1 flex items-center">
                    <activeVariant.icon className="h-6 w-6 mr-2 text-white/90" />
                    {language === 'ru' ? `Акция месяца` : `Oferta lunii`}
                  </h2>
                  <p className="text-sm text-white/90 max-w-[90%] leading-relaxed">
                    {language === 'ru' ? 'Успейте приобрести товары со скидкой до конца недели!' : 'Profită de reduceri substanțiale până la sfârșitul săptămânii!'}
                  </p>
                </div>
              </div>

              {/* Enhanced countdown section */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-3 overflow-hidden relative">
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
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-b-2" style={{ borderColor: `${activeVariant.color}` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(days)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t("days")}</div>
                  </div>
                  <div className="text-white/80 font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-b-2" style={{ borderColor: `${activeVariant.color}` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(hours)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t("hours")}</div>
                  </div>
                  <div className="text-white/80 font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-b-2" style={{ borderColor: `${activeVariant.color}` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(minutes)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t("minutes")}</div>
                  </div>
                  <div className="text-white/80 font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-[22%] shadow-md border-b-2" style={{ borderColor: `${activeVariant.color}` }}>
                    <div className="text-lg font-bold" style={{ color: activeVariant.color }}>{formatNumber(seconds)}</div>
                    <div className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t("seconds")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best deal badge */}
            <div className="relative z-10 mb-4 flex justify-center">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center animate-pulse">
                <Award className="h-4 w-4 mr-1.5" />
                {language === 'ru' ? 'Лучшие предложения месяца' : 'Cele mai bune oferte ale lunii'}
              </div>
            </div>

            {/* Enhanced mobile carousel - two items display */}
            <div className="relative">
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
                  {products.map((product, productIndex) => (
                    <CarouselItem key={`${product.id}-${productIndex}`} className="basis-full pl-2 sm:basis-1/2">
                      <ProductCardCompact product={adaptProduct(product)} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-0 border-none bg-white/90 hover:bg-white shadow-md text-gray-800 h-8 w-8" />
                <CarouselNext className="right-0 border-none bg-white/90 hover:bg-white shadow-md text-gray-800 h-8 w-8" />
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
                <Link href={`/catalog?category=${activeVariantId}`} className="flex items-center">
                  {t("shopNow") || "Shop Now"}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </ShimmerButton>

              <div className="mt-3 text-center">
                <span className="text-white/80 text-xs bg-white/10 px-3 py-1 rounded-full">
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
