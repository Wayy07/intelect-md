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
import { ProductCard, ProductCardCompact, MobileProductCard } from "@/app/components/ui/product-card";

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
    color: "#111D4A", // Dark navy blue
    accent: "bg-indigo-900",
    bgClassName: "bg-gradient-to-br from-[#111D4A] via-[#1E2A4D] to-[#0A1133]", // Enhanced gradient with navy
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


        {/* MacBook Mockup (desktop and tablet only) */}
        <MacbookMockUp>
          <div className={`w-full rounded-t-[10px] border-2 border-[rgb(18,18,18)] border-solid bg-white p-6 flex flex-col ${activeVariant.bgClassName} bg-opacity-90 relative overflow-hidden`}>
            {/* Enhanced background decorative elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-indigo-300/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent"></div>

            {/* Modern 3D-style header with depth */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-6 mb-6" style={{ borderColor: `${activeVariant.color}30` }}>
              <div className="flex items-center space-x-4 mb-4 md:mb-0 relative">
                <div className="p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-white drop-shadow-md" />
                </div>
                <div className="relative">
                  <span className="absolute -left-1 -top-1 w-12 h-8 bg-indigo-500/20 rounded-lg blur-md"></span>
                  <h2 className="font-extrabold text-4xl text-white drop-shadow-xl relative">
                    {language === 'ru' ? `Акция месяца` : `Oferta lunii`}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-medium text-white/90">
                      {getCurrentMonthName()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/40"></span>
                    <p className="text-sm text-white/90 max-w-md">
                      {language === 'ru' ? 'Эксклюзивные предложения' : 'Oferte exclusive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3D effect countdown timer */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-white/80" />
                  <span className="text-xs uppercase tracking-wider font-medium text-white/80">
                    {language === 'ru' ? 'До конца предложения:' : 'Timp rămas:'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-lg border-b-4 transform hover:-translate-y-1 transition-transform" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(days)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("days")}</div>
                  </div>
                  <div className="text-white font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-lg border-b-4 transform hover:-translate-y-1 transition-transform" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(hours)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("hours")}</div>
                  </div>
                  <div className="text-white font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-lg border-b-4 transform hover:-translate-y-1 transition-transform" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(minutes)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("minutes")}</div>
                  </div>
                  <div className="text-white font-bold text-lg">:</div>
                  <div className="bg-white/90 rounded-lg p-2 text-center w-14 shadow-lg border-b-4 transform hover:-translate-y-1 transition-transform" style={{ borderColor: activeVariant.color }}>
                    <div className="text-xl font-bold" style={{ color: activeVariant.color }}>{formatNumber(seconds)}</div>
                    <div className="text-[9px] uppercase text-gray-500 font-semibold tracking-wider">{t("seconds")}</div>
                  </div>
                </div>
              </div>
            </div>



            {/* Enhanced featured products carousel similar to special-offers.tsx */}
            <div className="flex-1 mb-6 relative">
              {/* Add subtle highlight line above carousel */}
              <div className="absolute -top-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

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
                <CarouselContent className="py-4">
                  {products.map((product, productIndex) => (
                    <CarouselItem key={`${product.id}-${productIndex}`} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                        className="h-full rounded-xl overflow-hidden border border-white/30 bg-gradient-to-b from-white to-white/90 relative group shadow-md hover:shadow-lg"
                      >
                        {/* Card top highlight */}
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#111D4A]/50 via-[#111D4A] to-[#111D4A]/50 opacity-70 z-20"></div>

                        {/* Enhanced hover effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#111D4A]/10 via-[#111D4A]/5 to-transparent transition-opacity duration-300"></div>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 border border-[#111D4A]/30 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

                        {/* Add subtle corner accent */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#111D4A]/20 to-transparent rounded-bl-xl"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-[#111D4A]/10 to-transparent rounded-tr-xl"></div>

                        <ProductCard product={adaptProduct(product)} disableLink={false} />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-0 bg-white border-[#111D4A]/30 border-2 text-[#111D4A] shadow-sm hover:bg-[#111D4A]/10 hover:text-[#0A1133] hover:border-[#111D4A]/50 transition-all duration-200 opacity-90 hover:opacity-100" />
                <CarouselNext className="right-0 bg-white border-[#111D4A]/30 border-2 text-[#111D4A] shadow-sm hover:bg-[#111D4A]/10 hover:text-[#0A1133] hover:border-[#111D4A]/50 transition-all duration-200 opacity-90 hover:opacity-100" />
              </Carousel>

              {/* Add subtle highlight line below carousel */}
              <div className="absolute -bottom-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              {/* Enhanced carousel indicators */}
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.5, scale: 0.9 }}
                    animate={{
                      opacity: i === 0 ? 1 : 0.5,
                      width: i === 0 ? '20px' : '4px',
                     }}
                    whileHover={{ opacity: 0.8 }}
                    className="h-1.5 rounded-full bg-white transition-all duration-300"
                    style={{
                      width: i === 0 ? '20px' : '4px',
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
            {/* Improved background elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#111D4A]/40 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#0A1133]/40 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>

            {/* Enhanced mobile header with modern design */}
            <div className="mb-6 relative z-10">
              {/* Main title with enhanced design */}
              <div className="relative mb-4">
                <div className="relative bg-white/15 backdrop-blur-md p-4 rounded-lg border border-white/20 overflow-hidden">
                  {/* Dynamic glowing accent */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${activeVariant.color}60 0%, transparent 70%)` }}></div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 backdrop-blur-sm text-xs font-medium text-white inline-flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {getCurrentMonthName()}
                    </span>
                  </div>

                  <h2 className="font-bold text-2xl text-white mb-1 flex items-center">
                    {language === 'ru' ? `Акция месяца` : `Oferta lunii`}
                  </h2>
                  <p className="text-sm text-white/90 max-w-[90%] leading-relaxed">
                    {language === 'ru' ? 'Успейте приобрести товары со скидкой до конца недели!' : 'Profită de reduceri substanțiale până la sfârșitul săptămânii!'}
                  </p>
                </div>
              </div>

              {/* Solid countdown section */}
              <div className="bg-[#1E2B54] rounded-lg border border-[#3D4A7A] p-3 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#111D4A]/80"></div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-full bg-white/20">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/90 font-medium">
                      {language === 'ru' ? 'Осталось времени' : 'Timp rămas'}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/30 text-white border-indigo-400/30 animate-pulse">
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
              <div className="bg-gradient-to-r from-indigo-800 to-[#111D4A] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center animate-pulse">
                <Award className="h-4 w-4 mr-1.5" />
                {language === 'ru' ? 'Лучшие предложения месяца' : 'Cele mai bune oferte ale lunii'}
              </div>
            </div>

            {/* Enhanced mobile carousel similar to special-offers */}
            <div className="relative max-w-full">
              {/* Add subtle highlight line above carousel */}
              <div className="absolute -top-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

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
                <CarouselContent className="py-4">
                  {products.map((product, productIndex) => (
                    <CarouselItem key={`${product.id}-${productIndex}`} className="basis-full pl-2 sm:basis-1/2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl overflow-hidden border border-[#3D4A7A] bg-white relative group shadow-md"
                      >
                        {/* Card top highlight */}
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#111D4A]/50 via-[#111D4A] to-[#111D4A]/50 opacity-70 z-20"></div>

                        {/* Enhanced hover effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#111D4A]/5 to-transparent transition-opacity duration-300"></div>

                        <MobileProductCard product={adaptProduct(product)} />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-0 bg-white border-[#111D4A]/30 border text-[#111D4A] shadow-sm hover:bg-[#111D4A]/10 hover:text-[#0A1133] transition-all duration-200 h-8 w-8" />
                <CarouselNext className="right-0 bg-white border-[#111D4A]/30 border text-[#111D4A] shadow-sm hover:bg-[#111D4A]/10 hover:text-[#0A1133] transition-all duration-200 h-8 w-8" />
              </Carousel>

              {/* Add subtle highlight line below carousel */}
              <div className="absolute -bottom-2 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              {/* Enhanced carousel indicators */}
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.5, scale: 0.9 }}
                    animate={{
                      opacity: i === 0 ? 1 : 0.5,
                      width: i === 0 ? '20px' : '4px',
                     }}
                    whileHover={{ opacity: 0.8 }}
                    className="h-1.5 rounded-full bg-white transition-all duration-300"
                    style={{
                      width: i === 0 ? '20px' : '4px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Improved call to action */}
            <div className="mt-6 relative z-10">
              <Link href={`/catalog?category=${activeVariantId}`} className="w-full block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#111D4A] hover:bg-[#0A1133] w-full py-3.5 rounded-lg font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  {t("shopNow") || "Shop Now"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

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
