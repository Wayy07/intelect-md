import { Suspense } from "react";
import {
  getSpecificProducts,
  getSpecificProductIds,
  getProductsByNomenclatureType,
  getSmartphoneProducts
} from "@/lib/product-api";
import { Product } from "@/lib/product-api";
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

// Nomenclature type constants
const NOMENCLATURE_TYPES = {
  SMARTPHONE: "d66ca3b3-4e6d-11ea-b816-00155d1de702"
};

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
  const nomenclatureTypeParam = getParameterValue(params.nomenclatureType);

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

  // Fetch specific products instead of category-based products
  let initialProducts: Product[] = [];
  let estimatedTotal = 0;

  try {
    console.log("Fetching products for catalog with filters");

    // Check if we need to filter by nomenclatureType (for smartphones)
    if (nomenclatureTypeParam === NOMENCLATURE_TYPES.SMARTPHONE) {
      console.log("Fetching smartphone products");
      initialProducts = await getSmartphoneProducts();
    }
    // If specific nomenclatureType is provided but not a known constant
    else if (nomenclatureTypeParam) {
      console.log(`Fetching products with nomenclatureType: ${nomenclatureTypeParam}`);
      initialProducts = await getProductsByNomenclatureType(nomenclatureTypeParam);
    }
    // Default to specific products if no nomenclatureType filter
    else {
      initialProducts = await getSpecificProducts();
    }

    console.log(`Fetched ${initialProducts.length} products`);

    // Set the estimated total to the actual count
    estimatedTotal = initialProducts.length;

    // Apply price filtering if needed
    if (hasPriceFilter) {
      console.log(`Using price filter: ${minPrice} - ${maxPrice} MDL`);

      initialProducts = initialProducts.filter(product => {
        const regularPrice = typeof product.price === 'number' ?
          product.price : parseFloat(String(product.price)) || 0;

        const reducedPrice = product.reduced_price ?
          (typeof product.reduced_price === 'number' ?
            product.reduced_price : parseFloat(String(product.reduced_price))) : null;

        const finalPrice = reducedPrice !== null ? reducedPrice : regularPrice;
        return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
      });

      // Update estimated total after filtering
      estimatedTotal = initialProducts.length;
    }

    // Apply pagination
    const startIndex = (initialPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    initialProducts = initialProducts.slice(startIndex, endIndex);

  } catch (error) {
    console.error("Error loading products for catalog:", error);
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
    nomenclatureType: nomenclatureTypeParam || "",
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
          randomSampling={false} // Don't use random sampling with specific products
        />
      </ClientWrapper>
    </Suspense>
  );
}
