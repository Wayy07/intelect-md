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
  ArrowRight
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
  Dog
};

// Color map for categories - using theme colors instead of hex values
const colorMap: Record<string, {color: string, gradient: string, bgLight: string}> = {
  "electronice": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "smartphone": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "tv": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "climate": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "watches": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "gaming": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "beauty": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "fashion": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "kids": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "home": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "furniture": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "tools": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "sports": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
  },
  "auto": {
    color: "var(--primary)",
    gradient: "from-primary/90 to-primary/70",
    bgLight: "from-primary/5 to-primary/10"
  },
  "pets": {
    color: "var(--primary)",
    gradient: "from-primary to-primary/80",
    bgLight: "from-primary/5 to-primary/10"
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
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%] relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("popular_categories")}
          </motion.h2>

          <motion.div
            className="h-1.5 w-24 rounded-full bg-gradient-to-r from-primary to-primary/50 mx-auto mb-6"
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
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className="overflow-hidden rounded-xl border border-gray-100 transition-all duration-300 bg-white"
                style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
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
                    className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rounded-3xl bg-primary/10"
                  >
                    {iconMap[category.icon] && React.createElement(iconMap[category.icon], {
                      className: "h-6 w-6 md:h-7 md:w-7 text-primary"
                    })}

                    {/* Circle decorations */}
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="text-center relative z-10">
                    <h3 className="font-medium text-sm md:text-base group-hover:font-semibold transition-all">
                      {getCategoryName(category, language)}
                    </h3>

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
