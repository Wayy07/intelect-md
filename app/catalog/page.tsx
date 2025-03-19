"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Grid, Package, List, Heart, ChevronDown, X, Home } from "lucide-react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/app/contexts/favorites-context";
import { useToast } from "@/app/components/ui/use-toast";
import { useLanguage } from "@/lib/language-context";
import FilterSystem, {
  FilterOptions,
} from "@/app/components/catalog/FilterSystem";
import { allProducts } from "@/app/utils/mock-data";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCart } from "@/app/contexts/cart-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus?: number | null;
  imagini: string[];
  stoc: number;
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    };
  };
  stare?: string;
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  );
}

// Loading skeleton component for Suspense boundary
function CatalogLoading() {
  return (
    <div className="container py-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-4 md:mb-0"></div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Filter and products skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="hidden lg:block">
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-6 bg-gray-100 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="col-span-1 lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border rounded-lg p-3 aspect-[9/16]">
                <div className="h-40 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions | null>(
    null
  );

  // Screen size state
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  // Get initial filter values from URL params
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const brandParam = searchParams.get("brand");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const searchQuery = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "featured";
  const inStockParam = searchParams.get("inStock") === "true";

  // Get page from URL or default to 1
  const pageParam = searchParams.get("page");
  const initialPage = pageParam ? parseInt(pageParam) : 1;

  // Detect screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
        setProductsPerPage(6); // 6 products for mobile
      } else if (width < 1024) {
        setScreenSize("tablet");
        setProductsPerPage(9); // 9 products for tablet (3x3 grid)
      } else {
        setScreenSize("desktop");
        setProductsPerPage(12); // 12 products for desktop (3x4 grid)
      }
    };

    // Initial call
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial filter options
  const initialFilters: FilterOptions = {
    priceRange:
      minPriceParam && maxPriceParam
        ? [parseInt(minPriceParam), parseInt(maxPriceParam)]
        : [0, 20000],
    categories: categoryParam ? categoryParam.split(",") : [],
    subcategories: subcategoryParam ? subcategoryParam.split(",") : [],
    brands: brandParam ? brandParam.split(",") : [],
    sortOption: sortParam,
    inStock: inStockParam,
  };

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      try {
        // Use the mock data directly
        applyFilters(allProducts, initialFilters);
        setCurrentFilters(initialFilters);
        setCurrentPage(initialPage);
      } catch (error) {
        console.error("Error loading catalog:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Update pagination when productsPerPage changes
  useEffect(() => {
    if (filteredProducts.length > 0) {
      setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
      updateDisplayedProducts(filteredProducts, currentPage);
    }
  }, [productsPerPage, filteredProducts, currentPage]);

  // Handle filter changes from the FilterSystem component
  const handleFilterChange = (newFilters: FilterOptions) => {
    applyFilters(allProducts, newFilters);
    setCurrentFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change

    // Update URL to reflect first page
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", "1");
    router.push(`/catalog?${currentParams.toString()}`);
  };

  // Apply filters to products
  const applyFilters = (
    productsToFilter: Product[],
    filters: FilterOptions
  ) => {
    let results = [...productsToFilter];

    // If search query is present, apply it first and prioritize it
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      results = productsToFilter.filter(
        (product) =>
          product.nume.toLowerCase().includes(query) ||
          product.subcategorie.nume.toLowerCase().includes(query) ||
          product.subcategorie.categoriePrincipala.nume
            .toLowerCase()
            .includes(query) ||
          product.cod.toLowerCase().includes(query)
      );

      // When search query is present, we might want to skip other filters
      // to show all search results, but still apply sorting
    } else {
      // Apply other filters only if no search query is present

      // Filter by categories
      if (filters.categories.length > 0) {
        results = results.filter((product) =>
          filters.categories.includes(
            product.subcategorie.categoriePrincipala.id
          )
        );
      }

      // Filter by subcategories
      if (filters.subcategories.length > 0) {
        results = results.filter((product) =>
          filters.subcategories.includes(product.subcategorie.id)
        );
      }

      // Filter by price range
      results = results.filter((product) => {
        const price = product.pretRedus || product.pret;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });

      // Filter by brands
      if (filters.brands.length > 0) {
        // Mock filter by brand - in a real app would check product brand property
        results = results.filter((product) =>
          filters.brands.some((brand) => product.id.includes(brand))
        );
      }

      // Filter by in-stock status
      if (filters.inStock) {
        results = results.filter((product) => product.stoc > 0);
      }
    }

    // Sort results
    switch (filters.sortOption) {
      case "price-asc":
        results = results.sort((a, b) => {
          const priceA = a.pretRedus || a.pret;
          const priceB = b.pretRedus || b.pret;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        results = results.sort((a, b) => {
          const priceA = a.pretRedus || a.pret;
          const priceB = b.pretRedus || b.pret;
          return priceB - priceA;
        });
        break;
      case "name-asc":
        results = results.sort((a, b) => a.nume.localeCompare(b.nume));
        break;
      case "name-desc":
        results = results.sort((a, b) => b.nume.localeCompare(a.nume));
        break;
      case "newest":
        // Mock sorting by newest - in a real app would use a date property
        results = results.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "featured":
      default:
        // Keep the default order or implement featured logic
        break;
    }

    setFilteredProducts(results);
    setTotalPages(Math.ceil(results.length / productsPerPage));
    updateDisplayedProducts(results, currentPage);
  };

  // Update displayed products based on pagination
  const updateDisplayedProducts = (products: Product[], page: number) => {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    setDisplayedProducts(products.slice(startIndex, endIndex));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateDisplayedProducts(filteredProducts, page);

    // Update URL with page parameter
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", page.toString());
    router.push(`/catalog?${currentParams.toString()}`);

    // Scroll to top of results
    window.scrollTo({
      top: document.getElementById("catalog-results")?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  // Generate page title based on filters
  const getPageTitle = () => {
    const { categories, subcategories } = currentFilters || initialFilters;

    if (searchQuery) {
      return `${t?.("search_results") || "Search Results"}: "${searchQuery}"`;
    }

    if (subcategories.length === 1) {
      // Get subcategory name from filtered products
      const subcategoryProduct = filteredProducts.find(
        (p) => p.subcategorie.id === subcategories[0]
      );
      return (
        subcategoryProduct?.subcategorie.nume || t?.("catalog") || "Catalog"
      );
    }

    if (categories.length === 1) {
      // Get category name from filtered products
      const categoryProduct = filteredProducts.find(
        (p) => p.subcategorie.categoriePrincipala.id === categories[0]
      );
      return (
        categoryProduct?.subcategorie.categoriePrincipala.nume ||
        t?.("catalog") ||
        "Catalog"
      );
    }

    return t?.("catalog") || "Catalog";
  };

  // Handle adding/removing favorites
  const handleAddToFavorites = (product: Product) => {
    toggleFavorite(product.id);

    const isFavorite = favorites.includes(product.id);
    if (!isFavorite) {
      toast({
        title: t?.("added_to_favorites") || "Added to favorites",
        description:
          t?.("product_added_to_favorites") ||
          "Product added to your favorites",
      });
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    // Maximum visible pagination links before ellipsis
    const maxVisible = 5;

    // Calculate the range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink href="#" onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      pages.push(
        <PaginationItem key="last">
          <PaginationLink href="#" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="container px-2 py-8 sm:py-8 md:py-8">
      {/* The mobile/tablet breadcrumb has been moved to FilterSystem.tsx */}

      {/* Header with category title and view options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6">
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>
              {filteredProducts.length} {t?.("products") || "products"}
            </span>
          </div>
        </div>
      </div>

      {/* Main content area with filters and products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6">
        {/* Filter column - desktop */}
        <div className="hidden lg:block">
          <FilterSystem
            onFilterChange={handleFilterChange}
            initialFilters={currentFilters || initialFilters}
          />
        </div>

        {/* Products grid */}
        <div id="catalog-results" className="col-span-1 lg:col-span-3">
          {/* Mobile/Tablet filters */}
          <div className="block lg:hidden mb-3">
            <FilterSystem
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters || initialFilters}
            />

            {/* Active filters display (compact) */}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-2 sm:p-3 aspect-[9/16]"
                >
                  <div className="h-40 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 sm:p-8 text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {t?.("no_products_found") || "No products found"}
              </h3>
              <p className="text-gray-500 mb-3 sm:mb-4">
                {t?.("try_adjusting_filters") ||
                  "Try adjusting your filters or search criteria"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset all filters and refresh the page
                  window.location.href = "/catalog";
                }}
              >
                {t?.("clear_all_filters") || "Clear all filters"}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                {displayedProducts.map((product) => (
                  <div key={product.id} className="h-full">
                    {screenSize === "mobile" ? (
                      <ProductCardCompact
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        onFavoriteToggle={() => handleAddToFavorites(product)}
                      />
                    ) : (
                      <ProductCard
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        onFavoriteToggle={() => handleAddToFavorites(product)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={() => handlePageChange(currentPage - 1)}
                          />
                        </PaginationItem>
                      )}

                      {renderPaginationItems()}

                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={() => handlePageChange(currentPage + 1)}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
