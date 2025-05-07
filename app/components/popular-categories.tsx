"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ALL_CATEGORIES, getCategoryName } from "@/lib/categories";
import {
  WashingMachine,
  Smartphone,
  Tv,
  Thermometer,
  Watch,
  Gamepad2,
  Scissors,
  Shirt,
  Baby,
  Home,
  Sofa,
  Hammer,
  Bike,
  Car,
  Dog,
  LucideIcon,
  ArrowRight,
  Laptop,
  Printer
} from "lucide-react";
import { motion } from "framer-motion";

// A map of icon names to their components
const iconMap: Record<string, LucideIcon> = {
  WashingMachine,
  Smartphone,
  Tv,
  Thermometer,
  Watch,
  Gamepad2,
  Scissors,
  Shirt,
  Baby,
  Home,
  Sofa,
  Hammer,
  Bike,
  Car,
  Dog,
  Laptop,
  Printer
};

// Color map for categories - using navy blue instead of primary
const colorMap: Record<string, {color: string, gradient: string, bgLight: string}> = {
  "electronice": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "smartphone": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "tv": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "climate": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "watches": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "gaming": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "beauty": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "fashion": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "kids": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "home": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "furniture": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "tools": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "sports": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "auto": {
    color: "#111D4A",
    gradient: "from-[#111D4A]/90 to-[#111D4A]/70",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  },
  "pets": {
    color: "#111D4A",
    gradient: "from-[#111D4A] to-[#111D4A]/80",
    bgLight: "from-[#111D4A]/5 to-[#111D4A]/10"
  }
};

export default function PopularCategories() {
  const { t, language } = useLanguage();
  const router = useRouter();

  // Take the first 8 categories to display
  const categories = ALL_CATEGORIES.slice(0, 8);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/catalog?category=${categoryId}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background decorative elements */}



      <div className="container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%] relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            className="text-3xl font-bold text-[#111D4A] sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("popular_categories")}
          </motion.h2>

          <motion.div
            className="h-1.5 w-24 rounded-full bg-gradient-to-r from-[#111D4A] to-[#111D4A]/50 mx-auto mb-6"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 96 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />


        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => {
            const colorInfo = colorMap[category.id] || {
              color: "var(--primary)",
              gradient: "from-primary to-primary/80",
              bgLight: "from-primary/5 to-primary/10"
            };

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 25px -5px rgba(17, 29, 74, 0.1), 0 10px 10px -5px rgba(17, 29, 74, 0.04)"
                }}
                className="overflow-hidden rounded-xl border border-[#111D4A]/10 transition-all duration-300 bg-white"
                style={{ boxShadow: "0 4px 6px -1px rgba(17, 29, 74, 0.1), 0 2px 4px -1px rgba(17, 29, 74, 0.06)" }}
              >
                <button
                  className="w-full h-full p-4 flex flex-col items-center justify-center gap-3 group relative"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {/* Subtle gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colorInfo.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Icon container */}
                  <div
                    className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rounded-3xl bg-[#111D4A]/10"
                  >
                    {iconMap[category.icon] && React.createElement(iconMap[category.icon], {
                      className: "h-6 w-6 md:h-7 md:w-7 text-[#111D4A]"
                    })}


                  </div>

                  <div className="text-center relative z-10">
                    <h3 className="font-medium text-sm md:text-base text-gray-800 group-hover:text-[#111D4A] group-hover:font-semibold transition-all">
                      {getCategoryName(category, language)}
                    </h3>
                    <div className="h-0.5 w-0 bg-[#111D4A]/50 rounded-full mx-auto mt-1 group-hover:w-1/2 transition-all duration-300"></div>
                  </div>

                </button>
              </motion.div>
            );
          })}
        </motion.div>


      </div>
    </section>
  );
}
