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

  // Force a fresh initialization on each page load to ensure cache is up to date
  try {
    // Ensure cache is initialized with our categories
    console.log("Initializing product cache with defined subcategories...");
    await initializeProductCache(allDefinedSubcategoryIds);
    global.productCacheInitialized = true;
  } catch (error) {
    console.error("Error initializing product cache:", error);
  }

  // Determine which API endpoint to use based on category
  let initialProducts: any[] = [];

  try {
    // Debug log
    console.log("Starting catalog fetch with parameters:", {
      category: categoryParam,
      subcategory: subcategoryParam
    });

    if (categoryParam) {
      // Case 1: If a specific main category is requested
      console.log(`Fetching products for main category: ${categoryParam}`);

      // Get all subcategories for this main category
      const categorySubcategoryIds = ALL_CATEGORIES
        .find(cat => cat.id === categoryParam)
        ?.subcategories.map(sub => sub.id) || [];

      console.log(`Found ${categorySubcategoryIds.length} subcategories for category ${categoryParam}:`, categorySubcategoryIds);

      if (categorySubcategoryIds.length > 0) {
        // Try to get products for each subcategory individually and combine them
        const allProducts = await Promise.all(
          categorySubcategoryIds.map(subcatId => getProductsByCategory(subcatId))
        );

        // Flatten the arrays
        initialProducts = allProducts.flat();

        // Deduplicate products by ID
        initialProducts = Array.from(
          new Map(initialProducts.map(product => [product.id, product])).values()
        );

        if (initialProducts.length === 0) {
          console.log("No products found for subcategories, falling back to all products");
          const allApiProducts = await getAllProducts();

          // Filter to include only products from these subcategories
          initialProducts = allApiProducts.filter((product: any) =>
            categorySubcategoryIds.includes(product.category)
          );
        }
      }
      console.log(`Fetched ${initialProducts.length} products for category ${categoryParam}`);
    }
    else if (subcategoryParam) {
      // Case 2: If a specific subcategory is requested
      console.log(`Fetching products for subcategory: ${subcategoryParam}`);
      const productsData = await getProductsByCategory(subcategoryParam);

      if (productsData.length === 0) {
        console.log(`No products found for subcategory ${subcategoryParam}, falling back to all products`);
        const allApiProducts = await getAllProducts();

        // Filter to include only products from this subcategory
        initialProducts = allApiProducts.filter((product: any) =>
          product.category === subcategoryParam
        );
      } else {
        initialProducts = productsData;
      }

      console.log(`Fetched ${initialProducts.length} products for subcategory ${subcategoryParam}`);
    }
    else {
      // Case 3: No specific category - fetch products from ALL defined categories
      console.log("Fetching products from all defined categories");

      // Extract all subcategory IDs from ALL_CATEGORIES
      const allDefinedSubcategoryIds = ALL_CATEGORIES.flatMap(
        category => category.subcategories.map(sub => sub.id)
      );

      console.log(`Fetching products for ${allDefinedSubcategoryIds.length} defined subcategories:`, allDefinedSubcategoryIds);

      // Try to get products for each subcategory individually and combine them
      const allSubcategoryProducts = await Promise.all(
        allDefinedSubcategoryIds.map(async (subcatId) => {
          try {
            const products = await getProductsByCategory(subcatId);
            console.log(`Fetched ${products.length} products for subcategory ${subcatId}`);
            return products;
          } catch (error) {
            console.error(`Error fetching products for subcategory ${subcatId}:`, error);
            return [];
          }
        })
      );

      // Check if we got any products
      const totalProductsFound = allSubcategoryProducts.reduce((acc, curr) => acc + curr.length, 0);
      console.log(`Total products found from subcategory fetching: ${totalProductsFound}`);

      // Flatten the arrays
      initialProducts = allSubcategoryProducts.flat();

      // Deduplicate products by ID
      initialProducts = Array.from(
        new Map(initialProducts.map(product => [product.id, product])).values()
      );

      if (initialProducts.length === 0) {
        // If no products found using categories, fall back to all products
        console.log("No products found by categories, falling back to all products");
        try {
          const allApiProducts = await getAllProducts();
          console.log(`getAllProducts returned ${allApiProducts.length} total products`);

          // Filter to only include products in our defined categories
          initialProducts = allApiProducts.filter((product: any) => {
            const isInCategory = allDefinedSubcategoryIds.includes(product.category);
            return isInCategory;
          });

          console.log(`After filtering, found ${initialProducts.length} products in our defined categories`);

          // If we still have zero products, just use all products
          if (initialProducts.length === 0) {
            console.log("No products found in our categories, using all products instead");
            initialProducts = allApiProducts;
          }
        } catch (error) {
          console.error("Error fetching all products:", error);
          // Provide a minimal set of products as fallback
          initialProducts = [];
        }
      }

      console.log(`Fetched ${initialProducts.length} products from defined categories`);
    }
  } catch (error) {
    console.error("Error loading catalog products:", error);
    initialProducts = [];
  }

  // Final deduplication to ensure no duplicates
  initialProducts = Array.from(
    new Map(initialProducts.map(product => [product.id, product])).values()
  );

  console.log(`Final count after deduplication: ${initialProducts.length} products`);

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
