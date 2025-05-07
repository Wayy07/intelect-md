"use client";

import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ChevronRightCircle, Package, Search, ShoppingCart, Tag } from "lucide-react";
import { ALL_CATEGORIES, getCategoryName, MainCategory } from "@/lib/categories";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { t, language } = useLanguage();

  // Find the current category
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);

  if (!category) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-primary">{t?.("category_not_found") || "Category Not Found"}</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist or has been removed.</p>
          <Link href="/catalog">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t?.("back_to_catalog") || "Back to Catalog"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Define an array of accent colors for category icons
  const accentColors = [
    'from-primary/80 to-primary',
    'from-blue-500 to-blue-700',
    'from-indigo-500 to-indigo-700',
    'from-violet-500 to-violet-700',
    'from-fuchsia-500 to-fuchsia-700',
  ];

  return (
    <div className="container max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-16">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-white bg-opacity-40 -z-10">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 sm:mb-8 hover:text-primary/80 transition-colors">
        <Link href="/catalog" className="inline-flex items-center hover:underline">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          {t?.("catalog") || "Catalog"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{getCategoryName(category, language || 'ro')}</span>
      </div>

      {/* Enhanced hero section */}
      <div className="relative mb-12 pb-8 text-center">
        <div className="absolute -inset-x-4 -inset-y-6 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 rounded-3xl blur-xl opacity-90 -z-10" />
        <div className="absolute -inset-1 bg-white/50 rounded-xl blur-xl opacity-80 -z-10"></div>
        <div className="max-w-3xl mx-auto py-8">

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-br from-primary/90 to-primary pb-1">
            {getCategoryName(category, language || 'ro')}
          </h1>

          <div className="h-1 w-24 bg-primary/30 mx-auto mt-6 rounded-full" />
        </div>
      </div>

      {/* Subcategory Groups */}
      {category.subcategoryGroups.map((group, index) => (
        <div key={group.id} className={`mb-12 sm:mb-16 ${index > 0 ? 'mt-8 sm:mt-12' : ''}`}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 flex items-center">
            <span className="mr-3 h-6 sm:h-8 w-1.5 bg-gradient-to-b from-primary/60 to-primary rounded-full" />
            {getCategoryName(group, language || 'ro')}
            <Badge className="ml-3 bg-primary/20 text-primary hover:bg-primary/30">
              {group.subcategories.length}
            </Badge>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.subcategories.map((subcategory, idx) => (
              <Link
                key={subcategory.id}
                href={`/catalog/subcategory/${subcategory.nomenclatureId}`}
                className="group"
              >
                <div className="bg-white h-24 sm:h-28 flex items-center rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden relative">
                  {/* Background hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />



                  {/* Content with fixed padding */}
                  <div className="flex-1 flex flex-col px-4 py-3 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {getCategoryName(subcategory, language || 'ro')}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                      {t?.("browse_products") || "Browse all products"}
                    </p>
                  </div>

                  {/* Right arrow with fixed width */}
                  <div className="w-12 sm:w-14 h-full flex items-center justify-center flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                      <ChevronRightCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
