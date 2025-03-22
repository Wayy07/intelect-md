"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Package } from "lucide-react";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/app/contexts/favorites-context";
import { useToast } from "@/app/components/ui/use-toast";
import { useLanguage } from "@/lib/language-context";
import FilterSystem from "@/app/components/catalog/FilterSystem";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ALL_CATEGORIES, ALL_SUBCATEGORY_IDS, HAIR_ACCESSORIES_ID } from "@/lib/categories";
import { getProductsByCategory, getProductsByCategories, getAllProducts } from "@/lib/product-api";
import { Product, FilterOptions, CatalogContentProps } from "./_types";

export default function CatalogContent({
  initialProducts,
  initialFilters,
  initialPage,
  searchQuery,
  totalProducts = 0,
  productsPerPage = 12,
  serverPagination = false,
  randomSampling = false
}: CatalogContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>(initialFilters);

  // Screen size state
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [productsPerPageState, setProductsPerPageState] = useState(productsPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [totalProductCount, setTotalProductCount] = useState(totalProducts);

  // Transform API products to our internal Product interface
  const transformProducts = (apiProducts: any[]): Product[] => {
    return apiProducts.map(product => ({
      id: product.id,
      nume: product.name || product.titleRO || product.titleRU || "",
      cod: product.SKU || "",
      pret: parseFloat(product.price) || 0,
      pretRedus: product.reduced_price ? parseFloat(product.reduced_price) : null,
      imagini: product.img ? [product.img] : [],
      stoc: parseInt(product.on_stock || "0"),
      subcategorie: {
        id: product.subcategory_id || "unknown",
        nume: product.subcategory_name || product.subcategory || "",
        categoriePrincipala: {
          id: product.category_id || "unknown",
          nume: product.category_name || product.category || ""
        }
      },
      stare: product.condition || ""
    }));
  };

  // Detect screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
        setProductsPerPageState(6); // 6 products for mobile
      } else if (width < 1024) {
        setScreenSize("tablet");
        setProductsPerPageState(9); // 9 products for tablet (3x3 grid)
      } else {
        setScreenSize("desktop");
        setProductsPerPageState(12); // 12 products for desktop (3x4 grid)
      }
    };

    // Initial call
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize products on mount
  useEffect(() => {
    try {
      const transformedProducts = transformProducts(initialProducts);
      setFilteredProducts(transformedProducts);

      if (serverPagination) {
        // If using server pagination, we're already showing the correct products
        setDisplayedProducts(transformedProducts);

        // Calculate total pages (with estimate if using random sampling)
        setTotalPages(Math.ceil(totalProducts / productsPerPageState));
        setTotalProductCount(totalProducts);
      } else {
        // If using client pagination, apply filters
        const filtered = applyFilters(transformedProducts, currentFilters, searchQuery);
        setFilteredProducts(filtered);
        setTotalPages(Math.ceil(filtered.length / productsPerPageState));
        setTotalProductCount(filtered.length);
        updateDisplayedProducts(filtered, currentPage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [initialProducts, initialFilters, initialPage, totalProducts]);

  // Update pagination when productsPerPage changes
  useEffect(() => {
    if (serverPagination) {
      setTotalPages(Math.ceil(totalProductCount / productsPerPageState));
    } else if (filteredProducts.length > 0) {
      setTotalPages(Math.ceil(filteredProducts.length / productsPerPageState));
      updateDisplayedProducts(filteredProducts, currentPage);
    }
  }, [productsPerPageState, filteredProducts, currentPage, serverPagination, totalProductCount]);

  // Handle filter changes from the FilterSystem component
  const handleFilterChange = async (newFilters: FilterOptions) => {
    try {
      setIsLoading(true);

      // Check which filters are being applied
      const { categories, subcategories } = newFilters;
      console.log("Applying filters:", newFilters);

      // Reset pagination on filter change
      setCurrentPage(1);

      // With server-side pagination, we need to navigate to update the URL and fetch new data
      const currentParams = new URLSearchParams(searchParams.toString());

      // Update filter parameters
      if (categories.length > 0) {
        currentParams.set("category", categories.join(','));
      } else {
        currentParams.delete("category");
      }

      if (subcategories.length > 0) {
        currentParams.set("subcategory", subcategories.join(','));
      } else {
        currentParams.delete("subcategory");
      }

      if (newFilters.priceRange[0] > 0) {
        currentParams.set("minPrice", newFilters.priceRange[0].toString());
      } else {
        currentParams.delete("minPrice");
      }

      if (newFilters.priceRange[1] < 9999) {
        currentParams.set("maxPrice", newFilters.priceRange[1].toString());
      } else {
        currentParams.delete("maxPrice");
      }

      if (newFilters.brands.length > 0) {
        currentParams.set("brand", newFilters.brands.join(','));
      } else {
        currentParams.delete("brand");
      }

      if (newFilters.sortOption) {
        currentParams.set("sort", newFilters.sortOption);
      } else {
        currentParams.delete("sort");
      }

      if (newFilters.inStock) {
        currentParams.set("inStock", "true");
      } else {
        currentParams.delete("inStock");
      }

      // Reset to page 1
      currentParams.set("page", "1");

      // If using server pagination, navigate to apply filters
      if (serverPagination) {
        router.push(`/catalog?${currentParams.toString()}`);
        return; // The navigation will trigger a server refetch
      }

      // For client-side filtering, apply filters directly
      setCurrentFilters(newFilters);
      const filtered = applyFilters(transformProducts(initialProducts), newFilters, searchQuery);
      setFilteredProducts(filtered);
      setTotalPages(Math.ceil(filtered.length / productsPerPageState));
      setTotalProductCount(filtered.length);
      updateDisplayedProducts(filtered, 1); // Reset to first page

      // Update URL without full page navigation
      router.replace(`/catalog?${currentParams.toString()}`, { scroll: false });

    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to products
  const applyFilters = (
    productsToFilter: Product[],
    filters: FilterOptions,
    searchQuery: string
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
        // Ensure we're working with properly parsed numbers
        const regularPrice = typeof product.pret === 'number' ? product.pret : parseFloat(String(product.pret)) || 0;
        const reducedPrice = product.pretRedus ?
          (typeof product.pretRedus === 'number' ? product.pretRedus : parseFloat(String(product.pretRedus))) : null;

        // Use reduced price if available, otherwise use regular price
        const price = reducedPrice !== null ? reducedPrice : regularPrice;

        // Debug information
        if (process.env.NODE_ENV === 'development') {
          console.log(`Price filter - Product: ${product.nume}, RegularPrice: ${regularPrice}, ReducedPrice: ${reducedPrice}, FinalPrice: ${price}`);
          console.log(`Price filter - Range: ${filters.priceRange[0]} to ${filters.priceRange[1]}`);
          console.log(`Price filter - Comparison: ${price >= filters.priceRange[0]} && ${price <= filters.priceRange[1]}`);
        }

        // Convert strings to numbers if needed and use strict equality checks
        const minPrice = typeof filters.priceRange[0] === 'string' ? parseFloat(filters.priceRange[0]) : filters.priceRange[0];
        const maxPrice = typeof filters.priceRange[1] === 'string' ? parseFloat(filters.priceRange[1]) : filters.priceRange[1];

        return (price >= minPrice && price <= maxPrice);
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
          const priceA = a.pretRedus !== null && a.pretRedus !== undefined ? a.pretRedus : (a.pret || 0);
          const priceB = b.pretRedus !== null && b.pretRedus !== undefined ? b.pretRedus : (b.pret || 0);
          return priceA - priceB;
        });
        break;
      case "price-desc":
        results = results.sort((a, b) => {
          const priceA = a.pretRedus !== null && a.pretRedus !== undefined ? a.pretRedus : (a.pret || 0);
          const priceB = b.pretRedus !== null && b.pretRedus !== undefined ? b.pretRedus : (b.pret || 0);
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

    return results;
  };

  // Update displayed products based on pagination
  const updateDisplayedProducts = (products: Product[], page: number) => {
    const startIndex = (page - 1) * productsPerPageState;
    const endIndex = startIndex + productsPerPageState;
    setDisplayedProducts(products.slice(startIndex, endIndex));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL with page parameter
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", page.toString());

    if (serverPagination) {
      // For server pagination, navigate to new URL to trigger data refetch

      // Show loading state before navigation when using random sampling
      if (randomSampling) {
        setIsLoading(true);
      }

      router.push(`/catalog?${currentParams.toString()}`);
    } else {
      // For client pagination, update URL without navigation and update displayed products
      router.push(`/catalog?${currentParams.toString()}`, { scroll: false });
      updateDisplayedProducts(filteredProducts, page);
    }

    // Scroll to top of results
    window.scrollTo({
      top: document.getElementById("catalog-results")?.offsetTop || 0,
      behavior: "smooth",
    });
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
      {/* Header with category title and view options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6">
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>
              {randomSampling
                ? `${t?.("showing") || "Showing"} ${productsPerPage} ${t?.("random_products") || "random products"}`
                : `${filteredProducts.length} ${t?.("products") || "products"}`
              }
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
            initialFilters={currentFilters}
          />
        </div>

        {/* Products grid */}
        <div id="catalog-results" className="col-span-1 lg:col-span-3">
          {/* Mobile/Tablet filters */}
          <div className="block lg:hidden mb-3">
            <FilterSystem
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
            />
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
