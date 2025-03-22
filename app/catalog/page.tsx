import { Suspense } from "react";
import {
  getRandomProductsFromCategories,
  getEstimatedProductCount,
  getProductsFromCategoriesWithPriceFilter
} from "@/lib/product-api";
import { Product } from "@/lib/product-api";
import { ensureCategoriesLoaded } from "@/lib/product-api";
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

// Add a new function to get the total product count with price filter
/**
 * Get the total count of products that match the price filter
 * This is more accurate than the estimate for pagination
 */
async function getFilteredProductCount(categories: string[], priceRange: [number, number]): Promise<number> {
  try {
    // Make sure all categories are loaded first
    await ensureCategoriesLoaded(categories);

    const cache = global.productCache!;
    const allProducts: Product[] = [];

    // Collect products from all requested categories
    categories.forEach(category => {
      const categoryProducts = cache.categoryProducts.get(category) || [];
      allProducts.push(...categoryProducts);
    });

    // Deduplicate products
    const uniqueProducts = Array.from(
      new Map(allProducts.map(product => [product.id, product])).values()
    );

    // Apply price filter to get actual count
    const filteredCount = uniqueProducts.filter(product => {
      const regularPrice = typeof product.price === 'number' ?
        product.price : parseFloat(String(product.price)) || 0;

      const reducedPrice = product.reduced_price ?
        (typeof product.reduced_price === 'number' ?
          product.reduced_price : parseFloat(String(product.reduced_price))) : null;

      const finalPrice = reducedPrice !== null ? reducedPrice : regularPrice;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    }).length;

    return filteredCount;
  } catch (error) {
    console.error("Error counting filtered products:", error);
    return 0;
  }
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

  // Parse comma-separated values for multiple categories/subcategories/brands
  const categories = categoryParam ? categoryParam.split(',') : [];
  const subcategories = subcategoryParam ? subcategoryParam.split(',') : [];
  const brands = brandParam ? brandParam.split(',') : [];

  const minPriceParam = getParameterValue(params.minPrice);
  const maxPriceParam = getParameterValue(params.maxPrice);
  const searchQuery = getParameterValue(params.q);
  const sortParam = getParameterValue(params.sort);
  const inStockParam = getParameterValue(params.inStock);
  const pageParam = getParameterValue(params.page) || '1';

  // Parse the initial page
  const initialPage = parseInt(pageParam, 10) || 1;

  // Parse price range
  const minPrice = minPriceParam ? parseFloat(minPriceParam) : 0;
  const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : 9999;
  const hasPriceFilter = (minPrice > 0 || maxPrice < 9999);

  // Set price range for filtering
  const priceRange: [number, number] = [minPrice, maxPrice];

  // Determine which categories to fetch based on filters
  let categoriesToFetch: string[] = [];
  let initialProducts: any[] = [];
  let estimatedTotal = 0;

  try {
    // Determine which categories to fetch
    if (subcategories.length > 0) {
      // Case 1: Specific subcategory(ies) requested
      categoriesToFetch = subcategories;
      console.log(`Using ${subcategories.length} subcategories: ${subcategories.join(', ')}`);
    }
    else if (categories.length > 0) {
      // Case 2: Specific main category(ies) requested
      const allSubcategories: string[] = [];

      // Collect all subcategories for each requested category
      categories.forEach(categoryId => {
        const categorySubcategories = ALL_CATEGORIES
          .find(cat => cat.id === categoryId)
          ?.subcategories.map(sub => sub.id) || [];

        allSubcategories.push(...categorySubcategories);
      });

      categoriesToFetch = allSubcategories;
      console.log(`Using ${categoriesToFetch.length} subcategories for ${categories.length} categories`);
    }
    else {
      // Case 3: No specific category - use all subcategories
      categoriesToFetch = ALL_SUBCATEGORY_IDS;
      console.log(`Using all ${categoriesToFetch.length} subcategories`);
    }

    // Calculate pagination offset
    const offset = (initialPage - 1) * PRODUCTS_PER_PAGE;

    // Get estimated product count for pagination UI
    estimatedTotal = await getEstimatedProductCount(categoriesToFetch);
    console.log(`Estimated total products: ~${estimatedTotal}`);

    // Check if the user has applied a price filter
    if (hasPriceFilter) {
      console.log(`Using price filter: ${minPrice} - ${maxPrice} MDL`);

      // Get the actual total count of products matching the price filter
      const actualFilteredCount = await getFilteredProductCount(categoriesToFetch, priceRange);
      console.log(`Found ${actualFilteredCount} total products matching price filter ${priceRange[0]}-${priceRange[1]}`);

      // Update estimated total with the accurate count
      estimatedTotal = actualFilteredCount;

      // Calculate the total number of pages
      const totalPages = Math.ceil(actualFilteredCount / PRODUCTS_PER_PAGE);

      // Make sure we're not requesting a page that doesn't exist
      const safeInitialPage = Math.min(initialPage, Math.max(1, totalPages));

      // Use price-filtered product fetching
      const startTime = Date.now();
      initialProducts = await getProductsFromCategoriesWithPriceFilter(
        categoriesToFetch,
        priceRange,
        PRODUCTS_PER_PAGE,
        (safeInitialPage - 1) * PRODUCTS_PER_PAGE
      );
      const duration = Date.now() - startTime;
      console.log(`Fetched ${initialProducts.length} price-filtered products in ${duration}ms`);
    } else {
      // No price filter, use regular random product selection
      console.log("Fast loading catalog with random product sampling...");

      // Get random selection of products for this page
      if (categoriesToFetch.length > 0) {
        const startTime = Date.now();
        initialProducts = await getRandomProductsFromCategories(categoriesToFetch, PRODUCTS_PER_PAGE);
        const duration = Date.now() - startTime;
        console.log(`Fetched ${initialProducts.length} random products in ${duration}ms`);
      }
    }

  } catch (error) {
    console.error("Error loading catalog products:", error);
    initialProducts = [];
    estimatedTotal = 0;
  }

  // Set initial filters based on URL parameters
  const initialFilters: FilterOptions = {
    priceRange: priceRange,
    categories: categories,
    subcategories: subcategories,
    brands: brands,
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
          totalProducts={estimatedTotal}
          productsPerPage={PRODUCTS_PER_PAGE}
          serverPagination={true}
          randomSampling={!hasPriceFilter} /* Only use random sampling when not filtering by price */
        />
      </ClientWrapper>
    </Suspense>
  );
}
