"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useTransform,
  AnimatePresence,
  animate,
  PanInfo,
} from "framer-motion";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  Carousel,
  CarouselApi,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  SubcategoryWithCategory,
  getRandomSubcategories,
  getAllBrands,
  Brand,
} from "@/lib/mock-data";
import { useBannerStore } from "../lib/banner-data";

// Interface for Banner object
interface Banner {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  title: string;
  subtitle?: string;
  linkUrl: string;
  buttonText?: string;
}

const gridPositions = [
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-3",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

// Banner Slideshow component
const BannerSlideshow = () => {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { mainBanners } = useBannerStore();

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Set up autoplay
    const autoplayInterval = setInterval(() => {
      if (api) {
        api.scrollNext();
      }
    }, 5000);

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [api]);

  // State to track screen size
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="sm:py-0 py-8 bg-gray-50">
      {/* Mobile container */}
      <div className="md:px-0 px-4 md:max-w-none">
        {/* Fixed size container with rounded edges and white border */}
        <div className="md:rounded-none rounded-2xl border-2 border-white overflow-hidden shadow-lg">
          <Carousel
            setApi={setApi}
            className="w-full h-[200px] md:h-[500px] xl:h-[650px] 3xl:h-[750px]"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {mainBanners.map((banner: any) => (
                <CarouselItem key={banner.id}>
                  <Link
                    href={banner.linkUrl}
                    className="relative block w-full h-[200px] md:h-[500px] xl:h-[650px] 3xl:h-[750px]"
                  >
                    {/* Desktop image */}
                    <img
                      src={
                        isMobile
                          ? banner.mobileImageUrl
                          : banner.desktopImageUrl
                      }
                      alt={banner.title || banner.id}
                      className="max-w-[100%] w-full md:h-[500px] h-[200px] xl:h-[650px] 3xl:h-[750px] object-cover"
                    />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-4 md:left-8 bg-white/80 border-0 shadow-md hover:bg-white z-10" />
            <CarouselNext className="right-4 md:right-8 bg-white/80 border-0 shadow-md hover:bg-white z-10" />
          </Carousel>
        </div>
      </div>

      {/* Mobile indicators (outside container) */}
      <div className="flex md:hidden justify-center flex-wrap gap-[3px] mt-3 max-w-[300px] mx-auto">
        {mainBanners
          .slice(0, Math.min(mainBanners.length, 20))
          .map((_: any, index: number) => (
            <button
              key={`indicator-mobile-${index}`}
              onClick={() => api?.scrollTo(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === current
                  ? "bg-primary scale-110"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        {mainBanners.length > 20 && (
          <span className="text-xs text-gray-500 ml-1">...</span>
        )}
      </div>
    </div>
  );
};

const BrandLogos = () => {
  const { t } = useLanguage();

  // Animation settings - slower speed for more visible scrolling
  const baseVelocity = 0.05; // Reduced for much slower motion
  const baseX = useMotionValue(0);
  const [hoveredBrandId, setHoveredBrandId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Separate drag motion value from auto-animation value
  const dragX = useMotionValue(0);
  const combinedX = useMotionValue(0);

  // Check if we're on mobile on component mount and fetch brands
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Get brands from mock data
    setBrands(getAllBrands());

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Create a very long list of brands to ensure continuous scrolling
  // Using 4 sets of brands should be enough for a seamless appearance
  const extendedBrands = [...brands, ...brands, ...brands, ...brands];

  // Base dimensions - smaller card width on mobile
  const itemWidth = isMobile ? 130 : 170;

  // Calculate combined position by adding base animation and manual drag
  useEffect(() => {
    const updateCombinedX = () => {
      combinedX.set(baseX.get() + dragX.get());
    };

    const unsubscribeBase = baseX.onChange(updateCombinedX);
    const unsubscribeDrag = dragX.onChange(updateCombinedX);

    return () => {
      unsubscribeBase();
      unsubscribeDrag();
    };
  }, [baseX, dragX, combinedX]);

  // Animation using continuous scrolling with time-based movement
  useAnimationFrame((time) => {
    if (isDragging) return;

    // Get the width of one complete set of brands
    const brandSetWidth = brands.length * itemWidth;

    // Create a continuous motion with natural looping using modulo
    // Use a smoother animation that preserves position after dragging
    const xPos = (-time * baseVelocity) % brandSetWidth;

    // Gradually transition current position to the calculated position
    const currentX = baseX.get();
    const targetX = xPos;

    // Smooth linear interpolation between current and target
    const newX = currentX + (targetX - currentX) * 0.005;
    baseX.set(newX);
  });

  // Transform the x position for left-to-right scrolling
  const x = useTransform(combinedX, (value) => `${value}px`);

  // Drag constraints
  const containerWidth =
    typeof window !== "undefined" ? window.innerWidth : 1200;
  const brandSetWidth = brands.length * itemWidth;

  // Set up improved drag handlers
  const handleDragStart = () => {
    setIsDragging(true);
    // Stop auto-animation immediately
    dragX.set(0);
  };

  const handleDrag = (_: any, info: any) => {
    // Update drag position directly during drag for immediate feedback
    dragX.set(info.offset.x);
  };

  const handleDragEnd = (event: any, info: any) => {
    // Only update if the user actually dragged
    if (Math.abs(info.offset.x) > 5) {
      // Update the base position to include the drag
      // This is the key change - we update baseX with the dragged position
      baseX.set(baseX.get() + info.offset.x);
      // Reset drag position
      dragX.set(0);

      // Keep auto-animation paused for a longer period after user interaction
      // This gives a clear sense that the logos stay where they were dragged
      setTimeout(() => {
        setIsDragging(false);
      }, 1500); // Increased from 50ms to 1500ms (1.5 seconds)
    } else {
      setIsDragging(false);
      dragX.set(0);
    }
  };

  return (
    <div className="w-full py-10 px-4 bg-gray-50 border-t border-gray-100">
      <div
        className="relative max-w-7xl mx-auto overflow-hidden"
        ref={containerRef}
      >
        {/* Fade overlay on the edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        <div className="overflow-hidden cursor-grab active:cursor-grabbing">
          <motion.div
            ref={dragRef}
            className="flex py-2"
            style={{ x }}
            drag="x"
            dragConstraints={{
              left: -brandSetWidth,
              right: containerWidth,
            }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            dragElastic={0.2}
            whileTap={{ cursor: "grabbing" }}
            dragMomentum={false}
          >
            {extendedBrands.map((brand, index) => (
              <motion.div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0"
                style={{ width: itemWidth }}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onHoverStart={() => setHoveredBrandId(brand.id)}
                onHoverEnd={() => setHoveredBrandId(null)}
              >
                <Link
                  href={`/catalog?brand=${brand.id}`}
                  className={`flex flex-col items-center justify-center group mx-2 rounded-xl p-3
                           hover:shadow-lg transition-all duration-300 relative overflow-hidden
                           ${isMobile ? "h-[70px]" : "h-[90px]"}`}
                  onClick={(e) => {
                    // Prevent navigation when dragging on mobile
                    if (isDragging) {
                      e.preventDefault();
                    }
                  }}
                  draggable="false"
                  style={{
                    borderColor: `${brand.color}30`,
                    background: brand.background,
                    boxShadow:
                      hoveredBrandId === brand.id
                        ? `0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px ${brand.color}30`
                        : "none",
                  }}
                >
                  <motion.div
                    className={`relative ${
                      isMobile ? "h-10 w-24" : "h-12 w-32"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    style={{
                      filter:
                        hoveredBrandId === brand.id
                          ? "none"
                          : "grayscale(0.2) opacity(0.9)",
                    }}
                  >
                    <Image
                      src={brand.logo}
                      alt={brand.nameKey ? t(brand.nameKey) : brand.name}
                      fill
                      sizes={isMobile ? "96px" : "128px"}
                      className="object-contain transition-all duration-300 pointer-events-none"
                      loading="eager"
                      unoptimized
                      draggable="false"
                    />
                  </motion.div>

                  {/* Hover effect underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: brand.color,
                      transformOrigin: "left",
                    }}
                  />

                  {/* Radial hover effect */}
                  <div
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${brand.color} 0%, transparent 70%)`,
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const SubcategoryTags = () => {
  const { t } = useLanguage();
  const [allTags, setAllTags] = useState<SubcategoryWithCategory[]>([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        // Get 15 random subcategories from our centralized mock data
        const randomSubcategories = getRandomSubcategories(15);

        // Before setting the state, apply translations to the names
        const translatedSubcategories = randomSubcategories.map((subcat) => ({
          ...subcat,
          nume: t(subcat.numeKey || subcat.id),
          categoriePrincipala: {
            ...subcat.categoriePrincipala,
            nume: t(
              subcat.categoriePrincipala.numeKey ||
                subcat.categoriePrincipala.id
            ),
          },
        }));

        setAllTags(translatedSubcategories);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubcategories();
  }, [t]);

  return (
    <div className="w-full py-8 md:py-14 px-4 md:px-8 bg-gray-50">
      <h2 className="text-center text-xl md:text-2xl  mb-6 md:mb-10 font-extrabold text-gray-800">
        {t("popular_categories")}
      </h2>
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-6xl mx-auto">
        {allTags.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/catalog?category=${subcategory.categoriePrincipala.id}&subcategory=${subcategory.id}`}
            className="inline-flex items-center px-3 py-1.5 md:px-5 md:py-2.5 rounded-full
                     bg-white md:bg-gray-100 shadow-sm border border-gray-200
                     hover:bg-primary hover:border-primary hover:text-primary-foreground
                     transition-all duration-300 
                     text-sm md:text-base
                     md:hover:scale-110 md:hover:shadow-md md:hover:z-10 md:font-medium"
          >
            <span className="whitespace-nowrap">{subcategory.nume}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default function HeroSection() {
  return (
    <>
      <BannerSlideshow />
      <BrandLogos />
      <SubcategoryTags />
    </>
  );
}
