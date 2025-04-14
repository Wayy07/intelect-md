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

  // Transform API products to UI format
  const transformProducts = (apiProducts: any[]): Product[] => {
    return apiProducts.filter(product => {
      // For smartphone listings, verify each product is properly formed
      const nomenclatureType = product.nomenclatureType;
      if (nomenclatureType === "d66ca3b3-4e6d-11ea-b816-00155d1de702") {
        // Verify this has the minimum fields required
        return product &&
               product.id &&
               (product.name || product.titleRO || product.nume) &&
               (product.isSmartphone !== false); // Skip products explicitly marked as non-smartphones
      }
      return true; // Keep all non-smartphone products
    }).map(product => {
      // Check if product is already in the expected format
      if (product.nume && product.cod) {
        return product;
      }

      // Transform product from the API format to the UI format
      return {
        id: product.id,
        nume: product.name || product.titleRO || `Product ${product.SKU}`,
        cod: product.SKU || product.article || `SKU-${product.id}`,
        pret: typeof product.price === 'number'
          ? product.price
          : parseFloat(product.price) || 0,
        pretRedus: product.reduced_price
          ? parseFloat(product.reduced_price)
          : (product.discount && product.discount > 0
              ? product.price * (1 - product.discount/100)
              : null),
        imagini: product.images
          ? product.images.map((img: any) => img.url || img.pathGlobal || img)
          : [product.image || product.img].filter(Boolean),
        stoc: product.inStock === false
          ? 0
          : (product.stockQuantity || product.on_stock
              ? parseInt(product.stockQuantity || product.on_stock, 10)
              : 10),
        subcategorie: {
          id: product.subcategory?.id || product.category || "unknown-category",
          nume: product.subcategory?.name || product.category || "Unknown Category",
          categoriePrincipala: {
            id: product.category || "main",
            nume: product.categoryName || "Main Category"
          }
        },
        stare: "nou",
        // Preserve original smartphone data for filtering
        nomenclatureType: product.nomenclatureType,
        characteristics: product.characteristics,
        source: product.source
      };
    });
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
    console.log("Applying new filters:", newFilters);
    setCurrentFilters(newFilters);

    try {
      setIsLoading(true);

      // Since we're using specific products, we don't need to fetch by category
      // Instead we'll just filter the existing products client-side

      // Fetch all specific products (they're already cached server-side)
      const response = await fetch('/api/products/specific');

      if (!response.ok) {
        console.error("Failed to fetch specific products:", response.status);
        // Fallback to using initialProducts
        const filtered = applyFilters(
          transformProducts(initialProducts),
          newFilters,
          searchQuery || ""
        );
        setFilteredProducts(filtered);
        setTotalProductCount(filtered.length);
        updateURL(newFilters, 1);
        return;
      }

      const data = await response.json();
      const allProducts = transformProducts(data.products || []);

      // Apply filters client-side
      const filtered = applyFilters(allProducts, newFilters, searchQuery || "");

      // Update state
      setFilteredProducts(filtered);
      setTotalProductCount(filtered.length);

      // Update URL to reflect new filters
      updateURL(newFilters, 1);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Fallback to filtering the initial products
      const filtered = applyFilters(
        transformProducts(initialProducts),
        newFilters,
        searchQuery || ""
      );
      setFilteredProducts(filtered);
      setTotalProductCount(filtered.length);
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

      // Filter by nomenclature type
      if (filters.nomenclatureType) {
        results = results.filter((product: any) =>
          product.nomenclatureType === filters.nomenclatureType
        );
      }

      // Apply smartphone-specific filters if the nomenclature type is for smartphones
      if (filters.nomenclatureType === "d66ca3b3-4e6d-11ea-b816-00155d1de702") {
        // Filter by API source
        if (filters.source) {
          results = results.filter((product: any) =>
            product.source === filters.source
          );
        }

        // Filter by operating system
        if (filters.operatingSystem && filters.operatingSystem.length > 0) {
          results = results.filter((product: any) => {
            if (!product.characteristics) return false;

            // Try to find OS in product characteristics
            const osCharacteristic = product.characteristics.find((c: any) =>
              (c.name && (
                c.name.toLowerCase().includes("operating system") ||
                c.name.toLowerCase().includes("os")
              )) || (c.code && c.code.toLowerCase().includes("os"))
            );

            if (!osCharacteristic || !osCharacteristic.propertyList || !osCharacteristic.propertyList.propertyValue) {
              // If no characteristic found, try the product name
              return filters.operatingSystem.some(os =>
                product.nume && product.nume.toLowerCase().includes(os.toLowerCase())
              );
            }

            const osValue = osCharacteristic.propertyList.propertyValue[0]?.simpleValue;
            return osValue && filters.operatingSystem.some(os =>
              osValue.toLowerCase().includes(os.toLowerCase())
            );
          });
        }

        // Filter by storage
        if (filters.storage && filters.storage.length > 0) {
          results = results.filter((product: any) => {
            if (!product.characteristics) return false;

            // Try to find storage in product characteristics
            const storageCharacteristic = product.characteristics.find((c: any) =>
              (c.name && (
                c.name.toLowerCase().includes("storage") ||
                c.name.toLowerCase().includes("memory")
              )) || (c.code && c.code.toLowerCase().includes("storage"))
            );

            if (!storageCharacteristic || !storageCharacteristic.propertyList || !storageCharacteristic.propertyList.propertyValue) {
              // If no characteristic found, try the product name
              return filters.storage.some(storage =>
                product.nume && product.nume.toLowerCase().includes(`${storage}gb`)
              );
            }

            const storageValue = storageCharacteristic.propertyList.propertyValue[0]?.simpleValue;
            return storageValue && filters.storage.some(storage =>
              storageValue.toLowerCase().includes(`${storage}gb`) ||
              storageValue.toLowerCase().includes(`${storage} gb`)
            );
          });
        }

        // Filter by RAM
        if (filters.ram && filters.ram.length > 0) {
          results = results.filter((product: any) => {
            if (!product.characteristics) return false;

            // Try to find RAM in product characteristics
            const ramCharacteristic = product.characteristics.find((c: any) =>
              (c.name && c.name.toLowerCase().includes("ram")) ||
              (c.code && c.code.toLowerCase().includes("ram"))
            );

            if (!ramCharacteristic || !ramCharacteristic.propertyList || !ramCharacteristic.propertyList.propertyValue) {
              // If no characteristic found, try the product name
              return filters.ram.some(ram =>
                product.nume && product.nume.toLowerCase().includes(`${ram}gb ram`)
              );
            }

            const ramValue = ramCharacteristic.propertyList.propertyValue[0]?.simpleValue;
            return ramValue && filters.ram.some(ram =>
              ramValue.toLowerCase().includes(`${ram}gb`) ||
              ramValue.toLowerCase().includes(`${ram} gb`)
            );
          });
        }
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

  // Helper function to update the URL with current filters and page
  const updateURL = (filters: FilterOptions, page: number) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    // Update or remove URL parameters based on filter values
    if (filters.priceRange[0] > 0) {
      currentParams.set("minPrice", filters.priceRange[0].toString());
    } else {
      currentParams.delete("minPrice");
    }

    if (filters.priceRange[1] < 9999) {
      currentParams.set("maxPrice", filters.priceRange[1].toString());
    } else {
      currentParams.delete("maxPrice");
    }

    if (filters.categories.length > 0) {
      currentParams.set("category", filters.categories.join(","));
    } else {
      currentParams.delete("category");
    }

    if (filters.subcategories.length > 0) {
      currentParams.set("subcategory", filters.subcategories.join(","));
    } else {
      currentParams.delete("subcategory");
    }

    if (filters.brands.length > 0) {
      currentParams.set("brand", filters.brands.join(","));
    } else {
      currentParams.delete("brand");
    }

    if (filters.sortOption && filters.sortOption !== "featured") {
      currentParams.set("sort", filters.sortOption);
    } else {
      currentParams.delete("sort");
    }

    if (filters.inStock) {
      currentParams.set("inStock", "true");
    } else {
      currentParams.delete("inStock");
    }

    // Update nomenclature type parameter
    if (filters.nomenclatureType) {
      currentParams.set("nomenclatureType", filters.nomenclatureType);
    } else {
      currentParams.delete("nomenclatureType");
    }

    // Update smartphone-specific parameters
    if (filters.operatingSystem && filters.operatingSystem.length > 0) {
      currentParams.set("os", filters.operatingSystem.join(","));
    } else {
      currentParams.delete("os");
    }

    if (filters.storage && filters.storage.length > 0) {
      currentParams.set("storage", filters.storage.join(","));
    } else {
      currentParams.delete("storage");
    }

    if (filters.ram && filters.ram.length > 0) {
      currentParams.set("ram", filters.ram.join(","));
    } else {
      currentParams.delete("ram");
    }

    if (filters.source) {
      currentParams.set("source", filters.source);
    } else {
      currentParams.delete("source");
    }

    // Always include page parameter (except for page 1)
    if (page > 1) {
      currentParams.set("page", page.toString());
    } else {
      currentParams.delete("page");
    }

    // Avoid page reloads for client-side filtering
    const newUrl = `?${currentParams.toString()}`;
    router.push(newUrl, { scroll: false });
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
