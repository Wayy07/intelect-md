"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, X, Package, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { SearchResultCard } from "@/app/components/ui/product-card";
import { allProducts } from "@/app/utils/mock-data";
import { useOnClickOutside } from "@/lib/hooks";
import { RefObject } from "react";

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

  // Search dropdown state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
        <div className="container px-4 py-4">
          <div className="flex flex-col gap-3">
            {/* Logo and top elements */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <div className="relative h-12 w-12 overflow-hidden">
                  <Image
                    src="/logo.jpg"
                    alt="Intelect MD"
                    fill
                    className="object-contain rounded-full border border-gray-100 shadow-sm"
                    priority
                  />
                </div>
                <div className="ml-3">
                  <h1 className="font-bold text-xl">Intelect MD</h1>
                  <p className="text-xs text-muted-foreground">
                    {t?.("techStore") || "Your Tech Store"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                {/* Phone number */}
                <a
                  href="tel:+37360175111"
                  className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>+373 60 175 111</span>
                </a>

                {/* Language switcher */}
                <div className="flex items-center gap-2 border-l pl-3">
                  <button
                    className={cn(
                      "transition-all duration-200 w-7 h-7 overflow-hidden rounded-full relative",
                      language === "ro"
                        ? "ring-2 ring-primary ring-offset-1"
                        : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => {
                      setLanguage("ro");
                      window.location.reload();
                    }}
                    aria-label="Romanian Language"
                    title="Romanian Language"
                  >
                    <Image
                      src="https://cdn.countryflags.com/thumbs/moldova/flag-round-250.png"
                      alt="Moldova Flag"
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  </button>
                  <button
                    className={cn(
                      "transition-all duration-200 w-7 h-7 overflow-hidden rounded-full relative",
                      language === "ru"
                        ? "ring-2 ring-primary ring-offset-1"
                        : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => {
                      setLanguage("ru");
                      window.location.reload();
                    }}
                    aria-label="Russian Language"
                    title="Russian Language"
                  >
                    <svg className="w-full h-full" viewBox="0 0 512 512">
                      <circle
                        style={{ fill: "#F0F0F0" }}
                        cx="256"
                        cy="256"
                        r="256"
                      />
                      <path
                        style={{ fill: "#0052B4" }}
                        d="M496.077,345.043C506.368,317.31,512,287.314,512,256s-5.632-61.31-15.923-89.043H15.923
                        C5.633,194.69,0,224.686,0,256s5.633,61.31,15.923,89.043L256,367.304L496.077,345.043z"
                      />
                      <path
                        style={{ fill: "#D80027" }}
                        d="M256,512c110.071,0,203.906-69.472,240.077-166.957H15.923C52.094,442.528,145.929,512,256,512z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar with Dropdown */}
            <div className="flex-1 w-full" ref={searchRef}>
              <div className="relative">
                <form className="relative" onSubmit={handleSearch}>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={
                      t?.("searchPlaceholder") || "Search products..."
                    }
                    className={cn(
                      "w-full h-11 pl-11 pr-11 text-sm rounded-full border",
                      "bg-accent/40 transition-all duration-200 focus:outline-none",
                      "focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/20",
                      "placeholder:text-muted-foreground/70 shadow-sm",
                      isSearchFocused &&
                        "border-primary/40 ring-2 ring-primary/20 bg-background"
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />

                  {/* Clear or Search button */}
                  <button
                    type={searchTerm ? "button" : "submit"}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-all text-primary"
                    aria-label={searchTerm ? "Clear" : "Search"}
                    onClick={searchTerm ? handleClearSearch : undefined}
                  >
                    {searchTerm ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </form>

                {/* Background overlay when search is active */}
                {isSearchFocused && (
                  <div
                    className="fixed inset-0 bg-black/20 z-[990]"
                    onClick={() => setIsSearchFocused(false)}
                  />
                )}

                {/* Search Results Dropdown */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden z-[9999] max-h-[70vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="py-4 px-3 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>{t?.("searching") || "Searching..."}</span>
                      </div>
                    ) : searchTerm.length < 2 ? (
                      <div className="py-4 px-3 text-center text-muted-foreground">
                        {t?.("typeTwoChars") ||
                          "Type at least 2 characters to search"}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-4 px-3 text-center text-muted-foreground">
                        {t?.("noResults") || "No products found"}
                      </div>
                    ) : (
                      <>
                        <div className="p-2">
                          {searchResults.map((product) => (
                            <SearchResultCard
                              key={product.id}
                              product={product}
                              onClick={() => handleProductSelect(product.id)}
                            />
                          ))}
                        </div>

                        {/* View all results button */}
                        <div className="border-t p-2">
                          <button
                            onClick={handleSearch}
                            className="w-full py-2 px-3 text-sm text-center font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-md transition-colors"
                          >
                            {t?.("viewAllResults") ||
                              `View all results (${searchResults.length})`}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
