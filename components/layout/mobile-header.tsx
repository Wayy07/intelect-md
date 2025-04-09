"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, X, Loader2, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { SearchResultCard } from "@/app/components/ui/product-card";
import { allProducts } from "@/app/utils/mock-data";
import { useOnClickOutside } from "@/lib/hooks";
import { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Define a Product interface
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

export default function MobileHeader() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Search state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useOnClickOutside(searchRef as RefObject<HTMLElement>, () =>
    setIsSearchFocused(false)
  );

  // Handle scroll events to show header only at the top of the page
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top of the page
      if (currentScrollY <= 10 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      // Hide header when scrolling down (but only if we've scrolled a bit)
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  // Add/remove a class to the document body when search is focused
  useEffect(() => {
    if (isSearchFocused) {
      document.body.classList.add("search-dropdown-active");
    } else {
      document.body.classList.remove("search-dropdown-active");
    }

    return () => {
      document.body.classList.remove("search-dropdown-active");
    };
  }, [isSearchFocused]);

  // Real-time search functionality
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Debounce search to avoid excessive filtering
    const debounceTimer = setTimeout(() => {
      const query = searchTerm.toLowerCase().trim();

      // Filter products based on the search term
      const filteredProducts = allProducts.filter(
        (product) =>
          product.nume.toLowerCase().includes(query) ||
          product.subcategorie.nume.toLowerCase().includes(query) ||
          product.subcategorie.categoriePrincipala.nume
            .toLowerCase()
            .includes(query) ||
          product.cod.toLowerCase().includes(query)
      );

      // Limit to first 5 results for performance
      setSearchResults(filteredProducts.slice(0, 5));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirect to catalog page with search query
      const params = new URLSearchParams();
      // Use the exact search term for consistency with the dropdown results
      params.set("q", searchTerm.trim());

      // We need to ensure we're starting on page 1 and not using any other filters
      params.set("page", "1");

      // Clear any existing filters that might interfere with search results
      router.push(`/catalog?${params.toString()}`);
      setIsSearchFocused(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleProductSelect = (productId: string) => {
    // Find product details to construct the URL
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      const categoryId = product.subcategorie.categoriePrincipala.id || "all";
      const subcategoryId = product.subcategorie.id || "all";
      router.push(`/catalog?category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(subcategoryId)}&product=${encodeURIComponent(productId)}`);
      setIsSearchFocused(false);
      setSearchTerm("");
    }
  };

  const closeSearch = () => {
    setIsSearchFocused(false);
    setSearchTerm("");
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  // Focus the search input when search overlay appears
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchFocused]);

  return (
    <>
      <style jsx global>{`
        /* Hide the credit announcement bar when search dropdown is active */
        body.search-dropdown-active
          div[class*="lg:block bg-primary text-white overflow-hidden whitespace-nowrap border-t"] {
          display: none !important;
        }

        /* Prevent scrolling when search is active */
        body.search-dropdown-active {
          overflow: hidden;
        }
      `}</style>

      <div
        className={`sticky top-0 z-40 bg-white shadow-md md:hidden border-b border-gray-100 transition-transform duration-400 ease-out ${
          isVisible ? "transform-none" : "-translate-y-full"
        }`}
      >
        <div className="container px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-8 w-8 overflow-hidden">
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-contain rounded-full border border-gray-100 shadow-sm"
                  priority
                />
              </div>
            </Link>

            {/* Search Bar Trigger */}
            <div className="flex-1 relative" ref={searchRef}>
              <button
                onClick={handleSearchFocus}
                className="w-full h-9 pl-8 pr-8 text-xs rounded-full border bg-accent/40 text-left shadow-sm flex items-center"
              >
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <span className="text-muted-foreground/70">
                  {t?.("searchPlaceholder") || "Search products..."}
                </span>
              </button>
            </div>

            {/* Simple Language Switcher */}
            <button
              className="flex-shrink-0 h-7 w-8 flex items-center justify-center rounded bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium text-xs"
              onClick={() => {
                // Toggle between RO and RU
                const newLang = language === "ro" ? "ru" : "ro";
                setLanguage(newLang);
                window.location.reload();
              }}
              aria-label={language === "ro" ? "Switch to Russian" : "Switch to Romanian"}
              title={language === "ro" ? "Switch to Russian" : "Switch to Romanian"}
            >
              {language.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Search Overlay */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            className="fixed inset-0 bg-white z-50 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Header */}
            <div className="border-b border-gray-100 shadow-sm">
              <div className="container px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Back Button */}
                  <button
                    onClick={closeSearch}
                    className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Search Input */}
                  <form className="flex-1 relative" onSubmit={handleSearch}>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={t?.("searchPlaceholder") || "Search products..."}
                      className="w-full h-10 pl-10 pr-10 text-sm rounded-full border bg-accent/30 transition-all duration-200 focus:outline-none focus:bg-background focus:border-primary/30 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/70 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
                        aria-label="Clear"
                        onClick={handleClearSearch}
                      >
                        <X className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Search Results Area */}
            <div className="flex-1 overflow-y-auto pb-safe">
              <div className="container px-4 py-3">
                {isSearching ? (
                  <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                    <p>{t?.("searching") || "Searching..."}</p>
                  </div>
                ) : searchTerm.length < 2 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="mb-1 text-gray-400">
                      {t?.("typeTwoChars") || "Type at least 2 characters to search"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t?.("searchPrompt") || "Search by product name, category, or code"}
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="mb-1 font-medium">
                      {t?.("noResults") || "No products found"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t?.("tryDifferentSearch") || "Try a different search term"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="py-2">
                      <p className="text-sm text-gray-500 mb-3">
                        {t?.("searchResultsCount")?.replace("{count}", searchResults.length.toString()) ||
                        `Found ${searchResults.length} products`}
                      </p>
                      <div className="space-y-3">
                        {searchResults.map((product) => (
                          <SearchResultCard
                            key={product.id}
                            product={product}
                            onClick={() => {
                              handleProductSelect(product.id);
                              closeSearch();
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* View all results button */}
                    <div className="mt-4 mb-8">
                      <button
                        onClick={() => {
                          handleSearch({ preventDefault: () => {} } as React.FormEvent);
                          closeSearch();
                        }}
                        className="w-full py-3 text-sm text-center font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                      >
                        {t?.("viewAllResults") ||
                          `View all results (${searchResults.length})`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
