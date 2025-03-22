import { Suspense } from "react";
import { getProductsByCategory, getProductsByCategories } from "@/lib/product-api";
import { ALL_CATEGORIES, ALL_SUBCATEGORY_IDS } from "@/lib/categories";
import CatalogContent from "./CatalogContent";
import CatalogLoading from "./CatalogLoading";
import { FilterOptions } from "./_types";
import ClientWrapper from "./ClientWrapper";

// Use appropriate rendering strategy
// This allows using searchParams while still working with revalidation
export const dynamic = 'auto';
export const revalidate = 3600; // Revalidate this page at most once per hour

// Maximum number of products to show initially
const MAX_INITIAL_PRODUCTS = 100;

// Helper function to safely extract parameters
function getParameterValue(param: string | string[] | undefined): string {
  if (!param) return '';
  return typeof param === 'string' ? param : param[0] || '';
}

// This is the server component
export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // await searchParams before accessing properties (required in Next.js 15+)
  const params = await searchParams || {};

  // Extract parameters directly
  const categoryParam = getParameterValue(params.category);
  const subcategoryParam = getParameterValue(params.subcategory);
  const brandParam = getParameterValue(params.brand);
  const minPriceParam = getParameterValue(params.minPrice);
  const maxPriceParam = getParameterValue(params.maxPrice);
  const searchQuery = getParameterValue(params.q);
  const sortParam = getParameterValue(params.sort);
  const inStockParam = getParameterValue(params.inStock);
  const pageParam = getParameterValue(params.page) || '1';

  // Parse the initial page
  const initialPage = parseInt(pageParam, 10) || 1;

  // Determine which categories to fetch based on filters
  let categoriesToFetch: string[] = [];
  let initialProducts: any[] = [];

  try {
    console.log("Loading catalog products with on-demand approach...");

    // Determine which categories to fetch
    if (subcategoryParam) {
      // Case 1: Specific subcategory requested
      categoriesToFetch = [subcategoryParam];
      console.log(`Fetching subcategory: ${subcategoryParam}`);
    }
    else if (categoryParam) {
      // Case 2: Specific main category requested
      categoriesToFetch = ALL_CATEGORIES
        .find(cat => cat.id === categoryParam)
        ?.subcategories.map(sub => sub.id) || [];

      console.log(`Fetching ${categoriesToFetch.length} subcategories for category: ${categoryParam}`);
    }
    else {
      // Case 3: No specific category - fetch a sample of subcategories
      categoriesToFetch = ALL_SUBCATEGORY_IDS.slice(0, 5);
      console.log(`Fetching ${categoriesToFetch.length} sample subcategories`);
    }

    // Fetch products for the selected categories (this will cache them automatically)
    if (categoriesToFetch.length > 0) {
      initialProducts = await getProductsByCategories(categoriesToFetch);
      console.log(`Found ${initialProducts.length} products from selected categories`);
    }

    // Limit initial products to prevent memory issues
    if (initialProducts.length > MAX_INITIAL_PRODUCTS) {
      console.log(`Limiting initial products from ${initialProducts.length} to ${MAX_INITIAL_PRODUCTS}`);
      initialProducts = initialProducts.slice(0, MAX_INITIAL_PRODUCTS);
    }

  } catch (error) {
    console.error("Error loading catalog products:", error);
    initialProducts = [];
  }

  // Set initial filters based on URL parameters
  const initialFilters: FilterOptions = {
    priceRange: [
      minPriceParam ? parseFloat(minPriceParam) : 0,
      maxPriceParam ? parseFloat(maxPriceParam) : 9999
    ],
    categories: categoryParam ? [categoryParam] : [],
    subcategories: subcategoryParam ? [subcategoryParam] : [],
    brands: brandParam ? [brandParam] : [],
    sortOption: sortParam || "price-asc",
    inStock: inStockParam === "true" ? true : false,
  };

  return (
    <Suspense fallback={<CatalogLoading />}>
      <ClientWrapper>
        <CatalogContent
          initialProducts={initialProducts}
          initialFilters={initialFilters}
          initialPage={initialPage}
          searchQuery={searchQuery}
        />
      </ClientWrapper>
    </Suspense>
  );
}
