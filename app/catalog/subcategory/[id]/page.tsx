"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Filter, SortAsc, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard, ProductCardCompact } from "@/app/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language-context";
import { Pagination } from "@/components/ui/pagination";
import { FilterSidebar } from "@/app/components/catalog/FilterSidebar";
import React from "react";

// Interface for brand data
interface Brand {
  id: string;
  name: string;
  code: string;
  image: string;
}

// Function to fetch all brands
async function getAllBrands(): Promise<Brand[]> {
  try {
    const response = await fetch('/api/brands');

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.status}`);
    }

    const brands = await response.json();
    return brands;
  } catch (error) {
    console.error('Error loading brands:', error);
    return [];
  }
}

// Define a unified product type that works with our card component
interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus?: number | null;
  imagini: string[];
  stoc: number;
  inStock: boolean;
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    };
  };
  descriere?: string;
  specificatii?: Record<string, string>;
  source: string;
}

// Nomenclature type mapping for display names
const nomenclatureNames: Record<string, string> = {
  "d66ca3b3-4e6d-11ea-b816-00155d1de702": "Smartphones",
  "ee525756-4e6d-11ea-b816-00155d1de702": "TVs",
  "f0295da0-4e62-11ea-b816-00155d1de702": "Tablets",
  "e42c51cb-4e62-11ea-b816-00155d1de702": "Laptops",
  // Add more mappings as needed
};

// Convert API responses to our unified format
function normalizeProduct(product: any): Product {
  // Debug logging for ROST products
  if (product.source === 'rost-api') {
    console.log(`Normalizing ROST product: ${product.id} - ${product.nume || product.name}`);
  }

  // Ensure we have valid images array with no empty strings
  let images = [];

  // Handle different image formats from different APIs
  if (Array.isArray(product.imagini) && product.imagini.length > 0) {
    images = product.imagini
      .filter(Boolean)
      .map((img: any) => typeof img === 'string' ? img : (img?.url || img?.pathGlobal || ''))
      .filter((url: string) => url.trim() !== '');
  } else if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images
      .map((img: any) => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.url || img.pathGlobal || img.path || null;
      })
      .filter(Boolean); // Remove any null/undefined/empty values
  } else if (product.image) {
    images = [typeof product.image === 'string' ? product.image : (product.image.url || product.image.pathGlobal || '')];
  }

  // Set a placeholder if no valid images
  if (images.length === 0) {
    images = ["https://placehold.co/400x400/eee/999?text=No+Image"];
  }

  // Handle pricing - ensure we have a numeric price and valid format
  let price = 0;

  // First try to use price from API if it's present and numeric
  if (product.price !== undefined && product.price !== null) {
    price = typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price).replace(/[^\d.-]/g, '')) || 0;
  } else if (product.pret !== undefined && product.pret !== null) {
    price = typeof product.pret === 'number'
      ? product.pret
      : parseFloat(String(product.pret).replace(/[^\d.-]/g, '')) || 0;
  } else if (product.mdlPrice !== undefined && product.mdlPrice !== null) {
    price = typeof product.mdlPrice === 'number'
      ? product.mdlPrice
      : parseFloat(String(product.mdlPrice).replace(/[^\d.-]/g, '')) || 0;
  }

  // Round price to avoid floating point issues
  price = Math.ceil(price);

  // If price is still 0, try originalPrice as a fallback
  if (price === 0 && product.originalPrice !== undefined && product.originalPrice !== null) {
    price = typeof product.originalPrice === 'number'
      ? product.originalPrice
      : parseFloat(String(product.originalPrice).replace(/[^\d.-]/g, '')) || 0;
  }

  // Determine discounted price - REMOVING DEFAULT DISCOUNT HERE
  let discountedPrice = null;

  // Only use explicitly defined discounts from the API, not automatic 20%
  if (product.pretRedus !== undefined && product.pretRedus !== null && product.pretRedus !== 0) {
    const pretRedusValue = typeof product.pretRedus === 'number'
      ? product.pretRedus
      : parseFloat(String(product.pretRedus).replace(/[^\d.-]/g, '')) || 0;

    if (pretRedusValue > 0 && pretRedusValue < price) {
      discountedPrice = pretRedusValue;
    }
  }
  // Only use discount percentage if it's explicitly provided by API
  else if (product.discount > 0 && price > 0 && typeof product.discount === 'number') {
    discountedPrice = Math.round((price - (price * product.discount / 100)) * 100) / 100;
  }
  // Check if price is already discounted compared to originalPrice
  else if (product.originalPrice && product.originalPrice > price && price > 0) {
    discountedPrice = price;
    price = product.originalPrice;
  }

  // Extract brand information from product
  const brandName = product.brand ||
                  (product.specificatii && product.specificatii.brand) ||
                  (product.characteristics && product.characteristics.find((c: any) =>
                     c.name === 'Brand' || c.code === 'BRAND')?.propertyList?.propertyValue?.[0]?.simpleValue);

  // Handle subcategory information correctly for ROST products
  const subcategory = {
    id: product.subcategorie?.id || product.category?.id || "1",
    nume: product.subcategorie?.nume || product.category?.name || product.category || "Electronics",
    categoriePrincipala: {
      id: product.subcategorie?.categoriePrincipala?.id || product.category?.parentId || "1",
      nume: product.subcategorie?.categoriePrincipala?.nume || product.category?.parentName || "Electronics"
    }
  };

  // Make sure stock information is correctly handled
  const inStock = product.inStock !== undefined
    ? Boolean(product.inStock)
    : (typeof product.stoc === 'number' ? product.stoc > 0 : Boolean(product.stoc));

  const stockQuantity = typeof product.stockQuantity === 'number'
    ? product.stockQuantity
    : (typeof product.stoc === 'number' ? product.stoc : 0);

  return {
    id: product.id,
    nume: product.name || product.nume || "Unknown Product",
    cod: product.article || product.code || product.cod || product.id,
    pret: price,
    pretRedus: discountedPrice,
    imagini: images,
    stoc: stockQuantity,
    inStock,
    descriere: product.description || product.descriere || '',
    specificatii: {
      ...(product.specificatii || {}),
      brand: brandName || 'Unknown'
    },
    subcategorie: subcategory,
    source: product.source || 'unknown'
  };
}

// Define type for filter option
interface FilterOption {
  id: string;
  name: string;
  count: number;
}

// Add debounce utility at the top of the component
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function NomenclatureCatalogPage() {
  const params = useParams();
  const nomenclatureId = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortOption, setSortOption] = useState("default");
  // Add state to track products with broken images
  const [productsWithBrokenImages, setProductsWithBrokenImages] = useState<Map<string, Set<string>>>(new Map());
  // Add state to track if we're fetching additional products
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // Keep track of our current page in state
  const [currentPageState, setCurrentPageState] = useState(1);
  // Add state for available brands and categories
  const [brands, setBrands] = useState<FilterOption[]>([]);
  const [allBrands, setAllBrands] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  // Add state for price range
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  // Add state for filter menu on mobile
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Add state for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    brands: [] as string[],
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    categories: [] as string[]
  });
  // Add state for detecting mobile
  const [isMobile, setIsMobile] = useState(false);
  // Add state to track if we need to fetch replacements
  const [needsReplacements, setNeedsReplacements] = useState(false);

  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add ref to track if we're already trying to fetch more products
  const isFetchingMoreRef = useRef(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Get current page from URL search params
  const currentPageFromUrl = parseInt(searchParams.get("page") || "1");
  const productsPerPage = 20;

  // Update state when URL changes
  useEffect(() => {
    setCurrentPageState(currentPageFromUrl);
  }, [currentPageFromUrl]);

  // Handle filters from URL
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const brand = searchParams.get("brand");
  const sort = searchParams.get("sort") || "default";
  const category = searchParams.get("category");

  // Update appliedFilters state from URL params
  useEffect(() => {
    setAppliedFilters({
      brands: brand ? brand.split(',') : [],
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      categories: category ? category.split(',') : []
    });
  }, [minPrice, maxPrice, brand, category]);

  // Memoize search params to prevent unnecessary re-renders
  const searchParamsString = useMemo(() => {
    // Create a stable string representation of search params
    return new URLSearchParams(
      Object.fromEntries(searchParams.entries())
    ).toString();
  }, [searchParams]);

  // Memoize the isRostRequest check
  const isRostRequest = useMemo(() => {
    return searchParams.get('type') === 'rost';
  }, [searchParams]);

  // Memoize fetchProductsForPage with useCallback
  const fetchProductsForPage = useCallback(async (page: number, limit: number) => {
    // Build query string with filters
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    queryParams.append("page", page.toString());

    // Always include inStock=true parameter
    queryParams.append("inStock", "true");

    if (minPrice) {
      queryParams.append("minPrice", minPrice);
    }

    if (maxPrice) {
      queryParams.append("maxPrice", maxPrice);
    }

    // Handle brand filter - if it's a comma-separated list, split it and append multiple brand params
    if (brand) {
      const brandIds = brand.split(',');
      brandIds.forEach(id => {
        queryParams.append("brand", id.trim());
      });
    }

    if (category) {
      queryParams.append("category", category);
    }

    if (sort && sort !== "default") {
      queryParams.append("sort", sort);
    }

    try {
      console.log("Fetching products for page:", page);
      // Use the Next.js API route instead of the direct server API
      const response = await fetch(`/api/products/by-nomenclature/${nomenclatureId}?${queryParams.toString()}`, {
        // Add client-side caching
        next: { revalidate: 300 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("Received products:", data.products.length);

        // Set source property for all products
        const productsWithSource = data.products.map((product: any) => {
          return {
            ...product,
            source: 'catalog-api'
          };
        });

        // Normalize all products to our format
        const normalizedProducts = productsWithSource.map(normalizeProduct);

        // Fetch brands and categories if available
        if (data.filters) {
          if (data.filters.brands) {
            // If API returns brands with counts, update our brands state
            const apiBrands = data.filters.brands.map((b: any) => ({
              id: b.id,
              name: b.name,
              count: b.count
            }));

            // If we don't have allBrands loaded yet, use API brands
            if (allBrands.length === 0) {
              setBrands(apiBrands);
            } else {
              // Otherwise, update counts for our all brands list
              const brandCounts = Object.fromEntries(
                apiBrands.map((b: { id: string, count: number }) => [b.id, b.count])
              );

              const updatedBrands = allBrands
                .map(brand => ({
                  ...brand,
                  count: brandCounts[brand.id] || 0
                }))
                .filter(brand => brand.count > 0);

              setBrands(updatedBrands);
            }
          }

          if (data.filters.categories) {
            setCategories(data.filters.categories.map((c: any) => ({
              id: c.id,
              name: c.name,
              count: c.count
            })));
          }

          if (data.filters.priceRange) {
            setPriceRange({
              min: data.filters.priceRange.min || 0,
              max: data.filters.priceRange.max || 50000
            });
          }
        }

        return {
          products: normalizedProducts,
          totalPages: Math.min(100, data.totalPages || 1),
          totalProducts: data.total || 0
        };
      } else {
        console.error("Failed to fetch products:", data.message);
        return { products: [], totalPages: 1, totalProducts: 0 };
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], totalPages: 1, totalProducts: 0 };
    }
  }, [nomenclatureId, minPrice, maxPrice, brand, category, sort]);

  // Memoize fetchRostProductsForPage with useCallback
  const fetchRostProductsForPage = useCallback(async (page: number, limit: number) => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    queryParams.append("page", page.toString());

    // Always include inStock=true parameter
    queryParams.append("inStock", "true");

    if (minPrice) {
      queryParams.append("minPrice", minPrice);
    }

    if (maxPrice) {
      queryParams.append("maxPrice", maxPrice);
    }

    // Handle brand filter - if it's a comma-separated list, split it and append multiple brand params
    if (brand) {
      const brandIds = brand.split(',');
      brandIds.forEach(id => {
        queryParams.append("brand", id.trim());
      });
    }

    if (sort && sort !== "default") {
      queryParams.append("sort", sort);
    }

    try {
      console.log("Fetching ROST products for page:", page);
      // Use the Next.js API route for ROST products with the dynamic category ID
      const response = await fetch(`/api/products/by-rost-category/${nomenclatureId}?${queryParams.toString()}`, {
        // Add client-side caching
        next: { revalidate: 300 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ROST products: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("Received ROST products:", data.products.length);
        console.log("ROST product sample:", data.products.length > 0 ? JSON.stringify(data.products[0]).substring(0, 200) + '...' : 'No products');

        // Make sure all products have source set to 'rost-api' before normalization
        const productsWithSource = data.products.map((product: any) => {
          return {
            ...product,
            source: 'rost-api'
          };
        });

        // Normalize all products to our format
        const normalizedProducts = productsWithSource.map(normalizeProduct);
        console.log("Normalized product sample:", normalizedProducts.length > 0 ? JSON.stringify(normalizedProducts[0]).substring(0, 200) + '...' : 'No products');

        // Handle brands if available
        if (data.brands) {
          setBrands(data.brands.map((b: any) => ({
            id: b.id || b.brand,
            name: b.name || b.brand,
            count: b.count || 0
          })));
        }

        return {
          products: normalizedProducts,
          totalPages: Math.min(100, data.totalPages || 1),
          totalProducts: data.total || 0
        };
      } else {
        console.error("Failed to fetch ROST products:", data.message);
        return { products: [], totalPages: 1, totalProducts: 0 };
      }
    } catch (error) {
      console.error("Error fetching ROST products:", error);
      return { products: [], totalPages: 1, totalProducts: 0 };
    }
  }, [nomenclatureId, minPrice, maxPrice, brand, sort]);

  // Define fetchMoreProducts here, now that dependencies are defined
  const fetchMoreProducts = useCallback(async () => {
    // Use our ref to prevent multiple concurrent fetches
    if (currentPageState >= totalPages || isFetchingMoreRef.current) return;

    // Set both state and ref
    setIsFetchingMore(true);
    isFetchingMoreRef.current = true;

    try {
      console.log("Fetching more products to replace broken images...");
      // Check if this is a ROST API request
      const isRostRequest = searchParams.get('type') === 'rost';

      // Fetch the next page
      const nextPage = currentPageState + 1;
      let result;

      if (isRostRequest) {
        // Use ROST API for any children's category
        result = await fetchRostProductsForPage(nextPage, productsPerPage);
      } else {
        // Use standard API
        result = await fetchProductsForPage(nextPage, productsPerPage);
      }

      if (result.products.length > 0) {
        // Add these products to our existing set, but filter out any that were already in our list
        const existingIds = new Set(products.map(p => p.id));
        const newProducts = result.products.filter((p: Product) => !existingIds.has(p.id));

        if (newProducts.length > 0) {
          console.log(`Adding ${newProducts.length} new replacement products`);
          // Update our products with the combined list
          setProducts(prevProducts => [...prevProducts, ...newProducts]);

          // Update our current page internally (but don't change the URL)
          setCurrentPageState(nextPage);
        } else {
          console.log("No new unique products found on next page");
        }
      }
    } catch (error) {
      console.error("Error fetching additional products:", error);
    } finally {
      // Wait a moment before allowing another fetch to prevent rapid re-fetching
      setTimeout(() => {
        setIsFetchingMore(false);
        isFetchingMoreRef.current = false;
      }, 1000);
    }
  }, [currentPageState, totalPages, products, fetchProductsForPage, fetchRostProductsForPage, productsPerPage, searchParams]);

  // Main fetch function as useCallback
  const fetchInitialProducts = useCallback(async () => {
    setIsLoading(true);
    // Reset broken images tracking when fetching new products
    setProductsWithBrokenImages(new Map());

    let result;
    if (isRostRequest) {
      // Use the new ROST API for children's categories
      console.log(`Using ROST API for category: ${nomenclatureId}`);
      result = await fetchRostProductsForPage(currentPageFromUrl, productsPerPage);
    } else {
      // Use standard API for other products
      result = await fetchProductsForPage(currentPageFromUrl, productsPerPage);
    }

    setProducts(result.products);
    setTotalPages(result.totalPages);
    setTotalProducts(result.totalProducts);
    setIsLoading(false);
  }, [nomenclatureId, currentPageFromUrl, isRostRequest, fetchProductsForPage, fetchRostProductsForPage, productsPerPage]);

  // Optimize dependency array in main useEffect
  useEffect(() => {
    fetchInitialProducts();
  }, [fetchInitialProducts]); // All dependencies are now encapsulated in fetchInitialProducts

  // Create filtered products array - filter out products with no valid images
  const productsWithValidImages = products.filter(product => {
    // Skip products with no images at all
    if (!product.imagini || product.imagini.length === 0) {
      return false;
    }

    // Check if all images for this product are broken
    if (productsWithBrokenImages.has(product.id)) {
      const brokenUrls = productsWithBrokenImages.get(product.id);
      // If all images are broken, filter out this product
      if (brokenUrls && brokenUrls.size >= product.imagini.length) {
        return false;
      }
    }

    // Keep product if it has at least one valid image
    return true;
  });

  // Use valid products but trigger replacement fetching if needed
  useLayoutEffect(() => {
    // If we don't have enough products with valid images
    if (!isLoading && productsWithValidImages.length < productsPerPage) {
      console.log(`Need ${productsPerPage - productsWithValidImages.length} replacement products`);
      setNeedsReplacements(true);
    } else {
      setNeedsReplacements(false);
    }
  }, [productsWithValidImages.length, isLoading, productsPerPage]);

  // Effect to fetch replacement products when needed
  useEffect(() => {
    if (needsReplacements && !isFetchingMoreRef.current) {
      console.log("Fetching replacement products...");
      fetchMoreProducts();
    }
  }, [needsReplacements, fetchMoreProducts]);

  // Final products to display - always limit to productsPerPage
  const displayProducts = productsWithValidImages.slice(0, productsPerPage);
  const displayCount = displayProducts.length;
  const needsMoreProducts = displayCount < productsPerPage && !isLoading;

  // Extract brand information from product
  const extractBrandsFromProducts = (products: Product[]): Record<string, number> => {
    const brandCounts: Record<string, number> = {};

    products.forEach(product => {
      // Get brand from specifications
      const brandInfo = product.specificatii?.brand;
      if (brandInfo) {
        brandCounts[brandInfo] = (brandCounts[brandInfo] || 0) + 1;
      }
    });

    console.log("Extracted brand counts:", brandCounts);
    return brandCounts;
  };

  // Function to load all brands and filter by those with products in this nomenclature
  const loadBrandsWithProductCounts = async () => {
    try {
      // Check if this is a ROST API request
      const isRostRequest = searchParams.get('type') === 'rost';

      if (isRostRequest) {
        console.log("ROST API request detected - skipping brand API fetch and using direct ROST brands");

        // For ROST products, we'll get brands directly from the ROST API endpoint
        // rather than a separate brands API call
        const rostQueryParams = new URLSearchParams();
        rostQueryParams.append("limit", "1");
        rostQueryParams.append("page", "1");

        // Make a minimal request to the ROST category endpoint to get available brands
        const rostResponse = await fetch(`/api/products/by-rost-category/${nomenclatureId}?${rostQueryParams.toString()}`);

        if (!rostResponse.ok) {
          console.error(`Failed to fetch ROST products: ${rostResponse.status}`);
          return;
        }

        const rostData = await rostResponse.json();

        if (rostData.brands && Array.isArray(rostData.brands)) {
          console.log(`Got ${rostData.brands.length} brands directly from ROST API`);

          // Set brands directly from ROST API response
          const rostBrands = rostData.brands.map((brand: any) => ({
            id: brand.id || brand.name,
            name: brand.name,
            count: brand.count || 0
          }));

          setBrands(rostBrands);
          setAllBrands(rostBrands);
        } else {
          console.log("No brands returned from ROST API");
          setBrands([]);
          setAllBrands([]);
        }

        return;
      }

      // Only execute this code for non-ROST requests
      console.log("Loading all brands from API...");
      // First, get all brands (we need their names)
      const brandsResponse = await fetch('/api/brands', {
        cache: 'no-store' // Ensure we get fresh data
      });

      if (!brandsResponse.ok) {
        throw new Error(`Failed to fetch brands: ${brandsResponse.status}`);
      }

      const allBrandsData = await brandsResponse.json();
      console.log(`Loaded ${allBrandsData.length} total brands from API`);

      // Create a map of brand IDs to brand names for quick lookup
      const brandMap = new Map();
      allBrandsData.forEach((brand: Brand) => {
        brandMap.set(brand.id, brand.name);
      });

      // Now fetch brand counts for this nomenclature
      console.log(`Fetching brand counts for nomenclature ${nomenclatureId}...`);
      const brandCountsResponse = await fetch(`/api/brands/by-nomenclature/${nomenclatureId}`, {
        cache: 'no-store'
      });

      if (!brandCountsResponse.ok) {
        throw new Error(`Failed to fetch brand counts: ${brandCountsResponse.status}`);
      }

      const brandCountsData = await brandCountsResponse.json();

      if (!brandCountsData.success) {
        throw new Error('Failed to get brand counts');
      }

      console.log(`Got brand counts for ${brandCountsData.totalProducts} products across ${brandCountsData.totalBrands} brands`);

      // Create FilterOption objects only for brands that have products
      const brandsWithProducts = Object.entries(brandCountsData.brandCounts)
        .filter(([brandId, count]) => (count as number) > 0 && brandMap.has(brandId))
        .map(([brandId, count]) => ({
          id: brandId,
          name: brandMap.get(brandId) || brandId,
          count: count as number
        }))
        .sort((a, b) => {
          // Sort by count (most products first)
          if (a.count !== b.count) return b.count - a.count;

          // Then by name
          return a.name.localeCompare(b.name);
        });

      console.log(`Created ${brandsWithProducts.length} brand filters with product counts`);

      // Store all brands
      setAllBrands(allBrandsData.map((brand: Brand) => ({
        id: brand.id,
        name: brand.name,
        count: brandCountsData.brandCounts[brand.id] || 0
      })));

      // Set only brands with products to display
      setBrands(brandsWithProducts);
    } catch (error) {
      console.error("Error loading brands with product counts:", error);
    }
  };

  // Load brands with product counts on component mount
  useEffect(() => {
    loadBrandsWithProductCounts();
  }, [nomenclatureId]);

  // Handle image loading errors with improved approach - try alternative images
  const handleImageError = useCallback((productId: string, imageUrl: string) => {
    console.warn(`Image ${imageUrl} for product ${productId} failed to load`);

    // Track which URLs failed for each product
    setProductsWithBrokenImages(prev => {
      const updated = new Map(prev);

      if (!updated.has(productId)) {
        updated.set(productId, new Set());
      }

      // Add the failed URL to the set
      updated.get(productId)?.add(imageUrl);

      return updated;
    });
  }, []);

  // Function to get a valid image for a product
  const getValidImageUrl = useCallback((product: Product) => {
    // If this product has no broken images recorded, use the first image
    if (!productsWithBrokenImages.has(product.id)) {
      return product.imagini[0];
    }

    // Get the set of broken image URLs for this product
    const brokenUrls = productsWithBrokenImages.get(product.id);

    // Find the first image URL that hasn't been marked as broken
    const validImage = product.imagini.find(url => !brokenUrls?.has(url));

    // If we found a valid image, use it
    if (validImage) {
      return validImage;
    }

    // If all images are broken, use a placeholder
    return "https://placehold.co/400x400/eee/999?text=No+Image";
  }, [productsWithBrokenImages]);

  // Handle applying filters
  const handleApplyFilters = (filters: any) => {
    // Save applied filters to state
    setAppliedFilters(filters);

    // Build new URL with filters
    const newParams = new URLSearchParams(searchParams.toString());

    // Update or remove price filters
    if (filters.minPrice !== undefined && filters.minPrice > priceRange.min) {
      newParams.set("minPrice", filters.minPrice.toString());
    } else {
      newParams.delete("minPrice");
    }

    if (filters.maxPrice !== undefined && filters.maxPrice < priceRange.max) {
      newParams.set("maxPrice", filters.maxPrice.toString());
    } else {
      newParams.delete("maxPrice");
    }

    // Update or remove brand filter
    if (filters.brands && filters.brands.length > 0) {
      newParams.set("brand", filters.brands.join(','));
    } else {
      newParams.delete("brand");
    }

    // Update or remove category filter
    if (filters.categories && filters.categories.length > 0) {
      newParams.set("category", filters.categories.join(','));
    } else {
      newParams.delete("category");
    }

    // Reset to page 1 when changing filters
    newParams.set("page", "1");

    router.push(`/catalog/subcategory/${nomenclatureId}?${newParams.toString()}`);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    // Build new URL without filters
    const newParams = new URLSearchParams();

    // Keep sort if it's set
    if (sort && sort !== "default") {
      newParams.set("sort", sort);
    }

    // Reset to page 1
    newParams.set("page", "1");

    router.push(`/catalog/subcategory/${nomenclatureId}?${newParams.toString()}`);
  };

  // Helper function to determine which pages to show in pagination
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all of them
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always include first, last, and pages close to current
    const pages = new Set<number>([1, totalPages]);

    // Add current page and 2 on each side when possible
    for (let i = Math.max(2, currentPageFromUrl - 2); i <= Math.min(totalPages - 1, currentPageFromUrl + 2); i++) {
      pages.add(i);
    }

    // Convert to sorted array using Array.from
    return Array.from(pages).sort((a, b) => a - b);
  };

  const visiblePages = getVisiblePages();

  // Get indices where we need to insert ellipses
  const getEllipsisPositions = () => {
    if (visiblePages.length <= 1) return [];

    const positions = [];
    for (let i = 1; i < visiblePages.length; i++) {
      if (visiblePages[i] - visiblePages[i-1] > 1) {
        positions.push(i);
      }
    }
    return positions;
  };

  const ellipsisPositions = getEllipsisPositions();

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPageFromUrl) return;

    // Build the new URL with existing filters
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());

    router.push(`/catalog/subcategory/${nomenclatureId}?${newParams.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value);

    // Build the new URL with the sort parameter
    const newParams = new URLSearchParams(searchParams.toString());

    if (value !== "default") {
      newParams.set("sort", value);
    } else {
      newParams.delete("sort");
    }

    // Reset to page 1 when changing sort
    newParams.set("page", "1");

    router.push(`/catalog/subcategory/${nomenclatureId}?${newParams.toString()}`);
  };

  // Handle going back to main catalog
  const handleBackToCatalog = () => {
    router.push("/catalog");
  };

  // Get display name for the nomenclature type
  const getNomenclatureName = () => {
    return nomenclatureNames[nomenclatureId] || "Products";
  };

  return (
    <div className="container py-4 px-1 xl:pr-10 xl:pl-10">
      {/* Header with breadcrumbs is now handled by FilterSidebar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filters Section */}
        <FilterSidebar
          categories={categories}
          brands={brands}
          priceRange={priceRange}
          appliedFilters={appliedFilters}
          totalProducts={totalProducts}
          activeNomenclatureId={nomenclatureId}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isMobile={isMobile}
        />

        {/* Products Section */}
        <div className="flex-1">
          {/* Mobile Filter Button and Sorting in inline flex row */}
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="md:hidden">
              <FilterSidebar
                categories={categories}
                brands={brands}
                priceRange={priceRange}
                appliedFilters={appliedFilters}
                totalProducts={totalProducts}
                activeNomenclatureId={nomenclatureId}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isMobile={true}
              />
            </div>

            <p className="text-sm text-muted-foreground hidden md:block">
              {totalProducts > 0
                ? `${totalProducts} ${t?.("products_found") || "products found"}`
                : t?.("no_products_found") || "No products found"}
            </p>

            <div className="flex items-center gap-2 ml-auto">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder={t?.("sort_by") || "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">{t?.("default") || "Default"}</SelectItem>
                  <SelectItem value="price-asc">{t?.("price_low_to_high") || "Price: Low to High"}</SelectItem>
                  <SelectItem value="price-desc">{t?.("price_high_to_low") || "Price: High to Low"}</SelectItem>
                  <SelectItem value="newest">{t?.("newest") || "Newest"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-1 md:gap-1">
              {Array(productsPerPage).fill(0).map((_, i) => (
                <div key={i} className="h-[320px] rounded-xl overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-1">
              {displayProducts.map((product) => (
                <div key={product.id} className="relative h-full">
                  {/* Use ProductCardCompact for mobile and ProductCard for desktop */}
                  <div className="block md:hidden h-full">
                    <ProductCardCompact
                      product={product}
                      hideDiscount={true}
                      onImageError={(productId, imageUrl) => handleImageError(productId, imageUrl)}
                      getValidImageUrl={() => getValidImageUrl(product)}
                    />
                  </div>
                  <div className="hidden md:block h-full">
                    <ProductCard
                      product={product}
                      hideDiscount={true}
                      onImageError={(productId, imageUrl) => handleImageError(productId, imageUrl)}
                      getValidImageUrl={() => getValidImageUrl(product)}
                    />
                  </div>
                  {/* Show stock indicator only for mobile */}
                  {product.stoc > 0 && (
                    <div className="absolute top-2 right-2 z-10 bg-green-500/90 text-white text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm md:hidden">
                      {t?.("in_stock") || "In Stock"}
                    </div>
                  )}
                </div>
              ))}

              {/* Fill empty slots with skeletons if needed and we're loading replacements */}
              {needsMoreProducts && isFetchingMore &&
                Array(productsPerPage - displayProducts.length).fill(0).map((_, i) => (
                  <div key={`skeleton-${i}`} className="h-[320px] rounded-xl overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-2">
                {t?.("no_products_found") || "No products found"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md px-4 text-sm">
                {t?.("no_products_description") ||
                  "We couldn't find any products that match your criteria. Try adjusting your filters or check back later."}
              </p>
            </div>
          )}

          {/* Separate loading indicator for fetching more products */}
          {isFetchingMore && !needsMoreProducts && (
            <div className="flex items-center justify-center py-4 mt-4">
              <div className="text-primary flex flex-col items-center">
                <Loader2 className="animate-spin h-6 w-6 text-primary mb-2" />
                <span className="text-sm">{t?.("loading_more") || "Se încarcă mai multe produse..."}</span>
              </div>
            </div>
          )}

          {/* Pagination - make it more compact */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.PrevButton
                      onClick={() => handlePageChange(Math.max(1, currentPageFromUrl - 1))}
                      disabled={currentPageFromUrl <= 1}
                      aria-label={t?.("pagination_previous") || "Previous"}
                    />
                  </Pagination.Item>

                  {/* Render pages with ellipses at calculated positions */}
                  {visiblePages.map((page, index) => {
                    // Add any needed ellipsis before this page
                    const hasEllipsisBefore = ellipsisPositions.includes(index);

                    return (
                      <React.Fragment key={`page-${page}`}>
                        {hasEllipsisBefore && (
                          <Pagination.Item key={`ellipsis-${index}`}>
                            <Pagination.Ellipsis />
                          </Pagination.Item>
                        )}
                        <Pagination.Item>
                          <Pagination.Link
                            isActive={page === currentPageFromUrl}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Link>
                        </Pagination.Item>
                      </React.Fragment>
                    );
                  })}

                  <Pagination.Item>
                    <Pagination.NextButton
                      onClick={() => handlePageChange(Math.min(totalPages, currentPageFromUrl + 1))}
                      disabled={currentPageFromUrl >= totalPages}
                      aria-label={t?.("pagination_next") || "Next"}
                    />
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
