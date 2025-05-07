"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/ui/use-toast";
import { Toaster } from "@/app/components/ui/toaster";
import {
  ProductCard,
  ProductCardCompact,
  MobileProductCard,
} from "@/app/components/ui/product-card";
import { useLanguage } from "@/lib/language-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Home, ChevronRight, Baby, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { useMediaQuery } from "@/app/lib/hooks/use-media-query";
import Link from "next/link";
import Image from "next/image";
import { childrenToys as mockToys } from "@/app/utils/mock-data";

// Create our own pagination components since they're not exported from the UI library
const PaginationContent = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={`flex flex-row items-center gap-1 ${className || ""}`} {...props} />
);

const PaginationItem = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={className} {...props} />
);

const PaginationLink = ({
  className,
  isActive = false,
  ...props
}: React.ComponentProps<typeof Link> & { isActive?: boolean }) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={`${className || ""} ${
      isActive
        ? "bg-[#111D4A] text-white"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
    } px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#111D4A] focus:ring-offset-2`}
    {...props}
  />
);

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof Link>) => (
  <Link
    aria-label="Go to previous page"
    className={`${className || ""} inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#111D4A] focus:ring-offset-2`}
    {...props}
  >
    <ChevronRight className="h-4 w-4 rotate-180" />
    <span>Previous</span>
  </Link>
);

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof Link>) => (
  <Link
    aria-label="Go to next page"
    className={`${className || ""} inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#111D4A] focus:ring-offset-2`}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </Link>
);

const PaginationEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-hidden
    className={`${className || ""} flex h-9 w-9 items-center justify-center text-gray-400`}
    {...props}
  >
    ...
  </span>
);

export default function KidsToysPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("relevant");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const searchParams = useSearchParams();

  // Search and filter parameters
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        // Main categories for kids toys
        const kidsToyCategories = ["Lego mix", "jucării", "LEGO", "copii", "toys"];

        // Start with "Lego mix" as priority, then try others
        let response;
        let data;
        let foundProducts = false;

        for (const category of kidsToyCategories) {
          response = await fetch(`/api/rost-products?inStock=true&limit=24&category=${encodeURIComponent(category)}`);

          if (response.ok) {
            data = await response.json();
            if (data.products.length >= 8) {
              foundProducts = true;
              break;
            }
          }
        }

        // If we didn't find enough products, try search terms
        if (!foundProducts) {
          const searchTerms = ["jucării", "toys", "LEGO", "puzzle", "plush"];

          for (const term of searchTerms) {
            response = await fetch(`/api/rost-products?inStock=true&limit=24&search=${encodeURIComponent(term)}`);

            if (response.ok) {
              data = await response.json();
              if (data.products.length >= 8) {
                foundProducts = true;
                break;
              }
            }
          }

          // Last resort - get any in-stock products
          if (!foundProducts) {
            response = await fetch(`/api/rost-products?inStock=true&limit=24`);
            data = await response.json();
          }
        }

        if (response && response.ok && data) {
          // Format products
          const formattedProducts = data.products.map((product: any) => ({
            id: product.id,
            nume: product.nume,
            cod: product.cod,
            pret: Math.round(parseFloat(product.pret) * 100) / 100,
            pretRedus: product.pretRedus ? Math.round(parseFloat(product.pretRedus) * 100) / 100 : null,
            imagini: Array.isArray(product.imagini) ? product.imagini : [product.imagini].filter(Boolean),
            stoc: parseInt(product.stoc || "0", 10),
            inStock: true,
            brand: product.specificatii?.brand || "",
            subcategorie: product.subcategorie || {
              id: "kids-toys",
              nume: product.category || "Jucării pentru Copii",
              categoriePrincipala: {
                id: "toys",
                nume: "Jucării"
              }
            },
            descriere: product.descriere || "",
            source: "rost-api"
          }));

          // Apply sorting
          const sortedProducts = sortProducts(formattedProducts, sortOption);

          setProducts(sortedProducts);
          setTotalPages(Math.ceil(sortedProducts.length / 12));
        } else {
          // Use mock data if API fails
          console.error("Error fetching products, using mock data");
          setProducts(mockToys);
          setTotalPages(Math.ceil(mockToys.length / 12));

          toast({
            title: "Nu s-au putut încărca produsele",
            description: "Am încărcat produse demonstrative în locul lor.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching kids toys:", error);
        setProducts(mockToys);
        setTotalPages(Math.ceil(mockToys.length / 12));

        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca datele. Se folosesc date demonstrative.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Sorting function
  const sortProducts = (products: any[], option: string) => {
    const productsCopy = [...products];

    switch (option) {
      case "price-asc":
        return productsCopy.sort((a, b) => {
          const priceA = a.pretRedus !== null ? a.pretRedus : a.pret;
          const priceB = b.pretRedus !== null ? b.pretRedus : b.pret;
          return priceA - priceB;
        });
      case "price-desc":
        return productsCopy.sort((a, b) => {
          const priceA = a.pretRedus !== null ? a.pretRedus : a.pret;
          const priceB = b.pretRedus !== null ? b.pretRedus : b.pret;
          return priceB - priceA;
        });
      case "name-asc":
        return productsCopy.sort((a, b) => a.nume.localeCompare(b.nume));
      case "name-desc":
        return productsCopy.sort((a, b) => b.nume.localeCompare(a.nume));
      case "discount":
        return productsCopy.sort((a, b) => {
          const discountA = a.pretRedus ? ((a.pret - a.pretRedus) / a.pret) * 100 : 0;
          const discountB = b.pretRedus ? ((b.pret - b.pretRedus) / b.pret) * 100 : 0;
          return discountB - discountA;
        });
      default: // relevance
        return productsCopy;
    }
  };

  // Get current page's products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * 12;
    const endIndex = startIndex + 12;
    return products.slice(startIndex, endIndex);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    const sorted = sortProducts([...products], value);
    setProducts(sorted);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse">
              <div className="aspect-[3/2] bg-gray-200 rounded-t-xl"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-9 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-1" />
                  {t("home") || "Home"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/catalog">{t("catalog") || "Catalog"}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t("childrenToys") || "Jucării pentru Copii"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#111D4A] rounded-xl shadow-sm">
            <Baby className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t("childrenToys") || "Jucării pentru Copii"}</h1>
        </div>
        <p className="text-gray-600 max-w-2xl">
          {t("childrenToysDescription") || "Descoperă o colecție variată de jucării educative, creative și distractive pentru copii de toate vârstele. De la jocuri de constructii LEGO până la jucării de pluș și multe altele."}
        </p>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* Mobile filter button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t("filters") || "Filtre"}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{t("filters") || "Filtre"}</SheetTitle>
                <SheetDescription>
                  {t("applyFilters") || "Aplică filtrele pentru a rafina rezultatele"}
                </SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("priceRange") || "Interval de preț"}</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 5000]}
                      max={10000}
                      step={100}
                      onValueChange={handlePriceRangeChange}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>{priceRange[0]} Lei</span>
                      <span>{priceRange[1]} Lei</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t("categories") || "Categorii"}</h3>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mr-2 cursor-pointer hover:bg-gray-100">LEGO</Badge>
                    <Badge variant="outline" className="mr-2 cursor-pointer hover:bg-gray-100">Puzzle</Badge>
                    <Badge variant="outline" className="mr-2 cursor-pointer hover:bg-gray-100">Plush</Badge>
                    <Badge variant="outline" className="mr-2 cursor-pointer hover:bg-gray-100">Educational</Badge>
                  </div>
                </div>
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">{t("applyFilters") || "Aplică filtrele"}</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* View toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 rounded-none ${view === 'grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setView('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 rounded-none ${view === 'list' ? 'bg-gray-100' : ''}`}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t("sortBy") || "Sortează după"}:</span>
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">{t("relevance") || "Relevanță"}</SelectItem>
              <SelectItem value="price-asc">{t("priceLowToHigh") || "Preț (crescător)"}</SelectItem>
              <SelectItem value="price-desc">{t("priceHighToLow") || "Preț (descrescător)"}</SelectItem>
              <SelectItem value="name-asc">{t("nameAZ") || "Nume (A-Z)"}</SelectItem>
              <SelectItem value="name-desc">{t("nameZA") || "Nume (Z-A)"}</SelectItem>
              <SelectItem value="discount">{t("biggestDiscount") || "Reducere"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products grid */}
      {getCurrentPageProducts().length > 0 ? (
        <div className={
          view === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "flex flex-col gap-4"
        }>
          {getCurrentPageProducts().map((product) => (
            <div key={product.id} className="h-full">
              {isMobile ? (
                <MobileProductCard product={product} />
              ) : view === 'grid' ? (
                <ProductCard product={product} />
              ) : (
                <ProductCardCompact product={product} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Baby className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("noProductsFound") || "Nu s-au găsit produse"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {t("noProductsFoundDescription") || "Nu am găsit produse care să corespundă criteriilor tale. Încearcă să modifici filtrele sau caută altceva."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Show first page, last page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              // Show ellipsis between page ranges
              if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Toaster />
    </div>
  );
}
