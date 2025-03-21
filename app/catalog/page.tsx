import { Suspense } from "react";
import { getProductsByCategory, getProductsByCategories, getAllProducts, initializeProductCache } from "@/lib/product-api";
import { ALL_CATEGORIES, ALL_SUBCATEGORY_IDS } from "@/lib/categories";
import CatalogContent from "./CatalogContent";
import CatalogLoading from "./CatalogLoading";
import { FilterOptions } from "./_types";
import ClientWrapper from "./ClientWrapper";

// Global flag to track cache initialization
declare global {
  var productCacheInitialized: boolean;
}

// Add proper Next.js caching options
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate this page at most once per hour

// This is the server component
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await the searchParams object to access its properties (Next.js 15 requirement)
  const resolvedParams = await searchParams;

  // Extract parameters directly after awaiting
  const categoryParam = typeof resolvedParams.category === 'string' ? resolvedParams.category :
                       (Array.isArray(resolvedParams.category) && resolvedParams.category.length > 0 ? resolvedParams.category[0] : '');

  const subcategoryParam = typeof resolvedParams.subcategory === 'string' ? resolvedParams.subcategory :
                          (Array.isArray(resolvedParams.subcategory) && resolvedParams.subcategory.length > 0 ? resolvedParams.subcategory[0] : '');

  const brandParam = typeof resolvedParams.brand === 'string' ? resolvedParams.brand :
                    (Array.isArray(resolvedParams.brand) && resolvedParams.brand.length > 0 ? resolvedParams.brand[0] : '');

  const minPriceParam = typeof resolvedParams.minPrice === 'string' ? resolvedParams.minPrice :
                       (Array.isArray(resolvedParams.minPrice) && resolvedParams.minPrice.length > 0 ? resolvedParams.minPrice[0] : '');

  const maxPriceParam = typeof resolvedParams.maxPrice === 'string' ? resolvedParams.maxPrice :
                       (Array.isArray(resolvedParams.maxPrice) && resolvedParams.maxPrice.length > 0 ? resolvedParams.maxPrice[0] : '');

  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q :
                     (Array.isArray(resolvedParams.q) && resolvedParams.q.length > 0 ? resolvedParams.q[0] : '');

  const sortParam = typeof resolvedParams.sort === 'string' ? resolvedParams.sort :
                   (Array.isArray(resolvedParams.sort) && resolvedParams.sort.length > 0 ? resolvedParams.sort[0] : '');

  const inStockParam = typeof resolvedParams.inStock === 'string' ? resolvedParams.inStock :
                      (Array.isArray(resolvedParams.inStock) && resolvedParams.inStock.length > 0 ? resolvedParams.inStock[0] : '');

  const pageParam = typeof resolvedParams.page === 'string' ? resolvedParams.page :
                   (Array.isArray(resolvedParams.page) && resolvedParams.page.length > 0 ? resolvedParams.page[0] : '1');

  // Parse the initial page
  const initialPage = parseInt(pageParam, 10) || 1;

  // Make sure the product cache is initialized with our target categories
  const allDefinedSubcategoryIds = ALL_CATEGORIES.flatMap(
    category => category.subcategories.map(sub => sub.id)
  );

  // Only initialize if not already done
  if (!global.productCacheInitialized) {
    try {
      await initializeProductCache(allDefinedSubcategoryIds);
      global.productCacheInitialized = true;
    } catch (error) {
      console.error("Error initializing product cache:", error);
    }
  }

  // Determine which API endpoint to use based on category
  let initialProducts: any[] = [];

  try {
    // More efficient approach to fetch products
    if (categoryParam) {
      // Case 1: Specific main category requested
      const categorySubcategoryIds = ALL_CATEGORIES
        .find(cat => cat.id === categoryParam)
        ?.subcategories.map(sub => sub.id) || [];

      if (categorySubcategoryIds.length > 0) {
        // Fetch all products at once for better performance
        initialProducts = await getProductsByCategories(categorySubcategoryIds);
      }
    }
    else if (subcategoryParam) {
      // Case 2: Specific subcategory requested
      initialProducts = await getProductsByCategory(subcategoryParam);
    }
    else {
      // Case 3: No specific category - fetch from all defined categories at once
      initialProducts = await getProductsByCategories(allDefinedSubcategoryIds);
    }

    // If we still have no products, use a fallback approach
    if (initialProducts.length === 0) {
      const allProducts = await getAllProducts();

      // Only filter if we have category params
      if (categoryParam || subcategoryParam) {
        const filterCategories = subcategoryParam
          ? [subcategoryParam]
          : ALL_CATEGORIES.find(cat => cat.id === categoryParam)?.subcategories.map(sub => sub.id) || [];

        initialProducts = allProducts.filter((product: any) =>
          filterCategories.includes(product.category)
        );
      } else {
        // Just use all products
        initialProducts = allProducts;
      }
    }
  } catch (error) {
    console.error("Error loading catalog products:", error);
    initialProducts = [];
  }

  // Simple deduplication - the map approach is more efficient
  initialProducts = Array.from(
    new Map(initialProducts.map(product => [product.id, product])).values()
  );

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
