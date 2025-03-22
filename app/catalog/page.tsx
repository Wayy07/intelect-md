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

// Pagination settings
const PRODUCTS_PER_PAGE = 12;

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

  // Calculate pagination parameters
  const offset = (initialPage - 1) * PRODUCTS_PER_PAGE;
  const limit = PRODUCTS_PER_PAGE;

  // Determine which categories to fetch based on filters
  let categoriesToFetch: string[] = [];
  let initialProducts: any[] = [];
  let totalProducts = 0;

  try {
    console.log("Loading catalog products with server-side pagination...");

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

    // First get total count (we need this for client-side pagination)
    if (categoriesToFetch.length > 0) {
      // Get all products to determine total count
      const allCategoryProducts = await getProductsByCategories(categoriesToFetch);
      totalProducts = allCategoryProducts.length;
      console.log(`Total products in selected categories: ${totalProducts}`);

      // Now fetch only the paginated products for this page
      initialProducts = await getProductsByCategories(categoriesToFetch, { offset, limit });
      console.log(`Fetched ${initialProducts.length} products for page ${initialPage}`);
    }

  } catch (error) {
    console.error("Error loading catalog products:", error);
    initialProducts = [];
    totalProducts = 0;
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
          totalProducts={totalProducts}
          productsPerPage={PRODUCTS_PER_PAGE}
          serverPagination={true}
        />
      </ClientWrapper>
    </Suspense>
  );
}
