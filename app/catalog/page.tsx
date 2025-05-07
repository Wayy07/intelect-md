"use client";

import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Laptop, Smartphone, Tv, ShoppingBag, Thermometer, Scissors, Home, Printer, Gamepad2, Baby, ChevronRightCircle } from "lucide-react";
import { ALL_CATEGORIES, getCategoryName } from "@/lib/categories";
import { Separator } from "@/components/ui/separator";

export default function CatalogPage() {
  const { t, language } = useLanguage();

  // Get specific subcategories for popular categories (first 3 with nomenclature IDs)
  const popularCategories = ALL_CATEGORIES.flatMap(category =>
    category.subcategoryGroups.flatMap(group =>
      group.subcategories.filter(sub => sub.nomenclatureId)
    )
  ).slice(0, 3);

  // Category images for popular categories - using exactly 3 images
  const categoryImages = [
    "https://images.unsplash.com/photo-1592919933511-ea9d487c85e4?q=80&w=3948&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",  // Smartphones
    "https://images.unsplash.com/photo-1627372129933-9abc19b91f21?q=80&w=3738&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",  // Smartphones
    "https://images.unsplash.com/photo-1627405452946-31ce7c7ff785?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  // Map category IDs to respective images
  const categoryMapping = [
    { id: "laptop-uri", image: categoryImages[0] },
    { id: "tablete", image: categoryImages[1] },
    { id: "smartphone-uri", image: categoryImages[2] },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-16">
      {/* Enhanced centered hero section */}
      {/* <div className="relative mb-10 sm:mb-16 pb-6 sm:pb-8 text-center">
        <div className="absolute -inset-x-4 -inset-y-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-2xl opacity-70 -z-10" />
        <div className="max-w-3xl mx-auto">

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 pb-1">
            {t?.("catalog") || "Catalog"}
          </h1>

          <div className="h-1 w-16 sm:w-20 bg-primary/30 mx-auto mt-6 sm:mt-8 rounded-full" />
        </div>
      </div> */}

      {/* Main Categories - List Layout */}
      <div className="mb-10 sm:mb-16">
        {/* <h2 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center">
          <span className="mr-3 h-8 w-1 bg-primary rounded-full" />
          {t?.("main_categories") || "Main Categories"}
        </h2> */}
   <div className="mb-10 sm:mb-16">
        {/* <h2 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center">
          <span className="mr-3 h-8 w-1 bg-primary rounded-full" />
          {t?.("popular_categories") || "Popular Categories"}
        </h2> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {/* Laptops */}
          <Link
            href={`/catalog/subcategory/e42c51cb-4e62-11ea-b816-00155d1de702`}
            className="relative group overflow-hidden rounded-xl h-48 sm:h-56 md:h-64 lg:h-72 shadow-md hover:shadow-xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30 group-hover:opacity-60 transition-all z-10" />
            <div className="absolute inset-0">
              <Image
                src={categoryImages[0]}
                alt="Laptops"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                priority
              />
            </div>
            <div className="relative z-20 flex flex-col h-full p-4 sm:p-5 md:p-6 lg:p-8 text-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 group-hover:text-white/90 transition-colors">
                {language === 'ru' ? 'Ноутбуки' : 'Laptop-uri'}
              </h3>
              <div className="mt-auto flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white group-hover:translate-x-1 transition-all text-xs sm:text-sm h-8 sm:h-9"
                >
                  {t?.("view_products") || "View Products"}
                  <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Link>

          {/* Tablets */}
          <Link
            href={`/catalog/subcategory/f0295da0-4e62-11ea-b816-00155d1de702`}
            className="relative group overflow-hidden rounded-xl h-48 sm:h-56 md:h-64 lg:h-72 shadow-md hover:shadow-xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30 group-hover:opacity-60 transition-all z-10" />
            <div className="absolute inset-0">
              <Image
                src={categoryImages[1]}
                alt="Tablets"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                priority
              />
            </div>
            <div className="relative z-20 flex flex-col h-full p-4 sm:p-5 md:p-6 lg:p-8 text-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 group-hover:text-white/90 transition-colors">
                {language === 'ru' ? 'Планшеты' : 'Tablete'}
              </h3>
              <div className="mt-auto flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white group-hover:translate-x-1 transition-all text-xs sm:text-sm h-8 sm:h-9"
                >
                  {t?.("view_products") || "View Products"}
                  <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Link>

          {/* Smartphones */}
          <Link
            href={`/catalog/subcategory/d66ca3b3-4e6d-11ea-b816-00155d1de702`}
            className="relative group overflow-hidden rounded-xl h-48 sm:h-56 md:h-64 lg:h-72 shadow-md hover:shadow-xl transition-all sm:col-span-2 md:col-span-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30 group-hover:opacity-60 transition-all z-10" />
            <div className="absolute inset-0">
              <Image
                src={categoryImages[2]}
                alt="Smartphones"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 33vw"
                priority
              />
            </div>
            <div className="relative z-20 flex flex-col h-full p-4 sm:p-5 md:p-6 lg:p-8 text-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 group-hover:text-white/90 transition-colors">
                {language === 'ru' ? 'Смартфоны' : 'Smartphone-uri'}
              </h3>
              <div className="mt-auto flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white group-hover:translate-x-1 transition-all text-xs sm:text-sm h-8 sm:h-9"
                >
                  {t?.("view_products") || "View Products"}
                  <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/40 overflow-hidden shadow-sm">
          <div className="divide-y divide-border/40">
            {ALL_CATEGORIES.map(category => (
              <Link
                key={category.id}
                href={`/catalog/${category.id}`}
                className="group"
              >
                <div className="flex items-center justify-between p-3 sm:p-5 hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-primary">{getIconForCategory(category.icon, "small")}</span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-medium group-hover:text-primary transition-colors">
                        {getCategoryName(category, language || 'ro')}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                        <span className="inline-block h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary/60 mr-1.5 sm:mr-2"></span>
                        {category.subcategoryGroups.reduce((count, group) => count + group.subcategories.length, 0)} {t?.("subcategories") || "subcategories"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-medium text-primary mr-1.5 sm:mr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
                      {t?.("browse") || "Browse"}
                    </span>
                    <ChevronRightCircle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Categories - Improved tablet layout */}

    </div>
  );
}

// Helper function to render icon based on name
function getIconForCategory(iconName: string, size = "regular"): React.ReactNode {
  const iconSize = size === "small" ? "h-4 w-4 sm:h-6 sm:w-6" : "h-6 w-6";

  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className={iconSize} />;
    case 'Tv':
      return <Tv className={iconSize} />;
    case 'Laptop':
      return <Laptop className={iconSize} />;
    case 'Thermometer':
      return <Thermometer className={iconSize} />;
    case 'Scissors':
      return <Scissors className={iconSize} />;
    case 'Home':
      return <Home className={iconSize} />;
    case 'Printer':
      return <Printer className={iconSize} />;
    case 'Gamepad2':
      return <Gamepad2 className={iconSize} />;
    case 'Baby':
      return <Baby className={iconSize} />;
    case 'WashingMachine':
      return <ShoppingBag className={iconSize} />; // Fallback since WashingMachine isn't in lucide-react
    default:
      return <ShoppingBag className={iconSize} />;
  }
}
