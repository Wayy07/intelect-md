import { Suspense } from "react";
import {
  getSpecificProducts,
  getSpecificProductIds,
  getProductsByNomenclatureType,
  getSmartphoneProducts,
  getSmartphoneProductsFromMultipleSources
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

// Category mappings for easy identification
const CATEGORY_MAPPINGS = {
  SMARTPHONE_CATEGORIES: ["smartphone-uri-si-gadget-uri", "telefoane", "smartphones"],
  SMARTPHONE_SUBCATEGORIES: ["smartphone-uri", "smartphones", "mobile", "telefoane"]
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
  const sourceParam = getParameterValue(params.source);

  // Auto-detect smartphone category/subcategory and set nomenclature type
  let effectiveNomenclatureType = nomenclatureTypeParam;
  if (!effectiveNomenclatureType && categoryParam) {
    const lowerCategory = categoryParam.toLowerCase();
    const lowerSubcategory = subcategoryParam ? subcategoryParam.toLowerCase() : '';

    // Check if this is a smartphone category or subcategory
    const isSmartphoneCategory = CATEGORY_MAPPINGS.SMARTPHONE_CATEGORIES.some(
      cat => lowerCategory.includes(cat)
    );

    const isSmartphoneSubcategory = CATEGORY_MAPPINGS.SMARTPHONE_SUBCATEGORIES.some(
      subcat => lowerSubcategory.includes(subcat)
    );

    if (isSmartphoneCategory || isSmartphoneSubcategory) {
      console.log('Auto-detected smartphone category - setting nomenclature type');
      effectiveNomenclatureType = NOMENCLATURE_TYPES.SMARTPHONE;
    }
  }

  // Check for the "only in stock" parameter with a default of true for smartphones
  const inStockParam = getParameterValue(params.inStock);
  // For smartphones, default to showing only in-stock items unless explicitly set to false
  const effectiveInStock = effectiveNomenclatureType === NOMENCLATURE_TYPES.SMARTPHONE
    ? inStockParam !== "false"  // Default to true for smartphones unless explicitly false
    : inStockParam === "true";  // Regular behavior for other products

  // Parse comma-separated values for multiple categories/subcategories/brands
  const categories = categoryParam ? categoryParam.split(',') : [];
  const subcategories = subcategoryParam ? subcategoryParam.split(',') : [];
  const brands = brandParam ? brandParam.split(',') : [];

  const minPriceParam = getParameterValue(params.minPrice);
  const maxPriceParam = getParameterValue(params.maxPrice);
  const searchQuery = getParameterValue(params.q);
  const sortParam = getParameterValue(params.sort);
  const pageParam = getParameterValue(params.page) || '1';

  // Get smartphone-specific filters
  const operatingSystemParam = getParameterValue(params.os);
  const storageParam = getParameterValue(params.storage);
  const ramParam = getParameterValue(params.ram);

  // Parse these into arrays if they exist
  const operatingSystems = operatingSystemParam ? operatingSystemParam.split(',') : [];
  const storage = storageParam ? storageParam.split(',') : [];
  const ram = ramParam ? ramParam.split(',') : [];

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
    console.log(`NomenclatureType: ${effectiveNomenclatureType}`);
    console.log(`InStock: ${effectiveInStock}`);

    // Check if we need to filter by nomenclatureType (for smartphones)
    if (effectiveNomenclatureType === NOMENCLATURE_TYPES.SMARTPHONE) {
      console.log("Fetching smartphone products from multiple sources");
      // Use the new function that fetches from multiple sources
      initialProducts = await getSmartphoneProductsFromMultipleSources();

      console.log(`Initial smartphone products count: ${initialProducts.length}`);

      // Filter by source if specified
      if (sourceParam) {
        initialProducts = initialProducts.filter(product =>
          (product as any).source === sourceParam
        );
        console.log(`Filtered to ${initialProducts.length} smartphone products from source: ${sourceParam}`);
      }

      // Apply smartphone-specific filters
      if (operatingSystems.length > 0) {
        initialProducts = initialProducts.filter(product => {
          // Look for OS in product.characteristics or any other relevant field
          const productOS = (product as any).characteristics?.find((c: any) =>
            c.name?.toLowerCase().includes("operating system") ||
            c.name?.toLowerCase().includes("os")
          )?.propertyList?.propertyValue?.[0]?.simpleValue?.toLowerCase();

          return productOS && operatingSystems.some(os =>
            productOS.includes(os.toLowerCase())
          );
        });
        console.log(`Filtered to ${initialProducts.length} smartphone products by OS`);
      }

      if (storage.length > 0) {
        initialProducts = initialProducts.filter(product => {
          // Look for storage capacity in product characteristics
          const productStorage = (product as any).characteristics?.find((c: any) =>
            c.name?.toLowerCase().includes("storage") ||
            c.name?.toLowerCase().includes("memory")
          )?.propertyList?.propertyValue?.[0]?.simpleValue?.toLowerCase();

          return productStorage && storage.some(size =>
            productStorage.includes(size.toLowerCase())
          );
        });
        console.log(`Filtered to ${initialProducts.length} smartphone products by storage`);
      }

      if (ram.length > 0) {
        initialProducts = initialProducts.filter(product => {
          // Look for RAM in product characteristics
          const productRam = (product as any).characteristics?.find((c: any) =>
            c.name?.toLowerCase().includes("ram")
          )?.propertyList?.propertyValue?.[0]?.simpleValue?.toLowerCase();

          return productRam && ram.some(size =>
            productRam.includes(size.toLowerCase())
          );
        });
        console.log(`Filtered to ${initialProducts.length} smartphone products by RAM`);
      }
    }
    // If specific nomenclatureType is provided but not a known constant
    else if (effectiveNomenclatureType) {
      console.log(`Fetching products with nomenclatureType: ${effectiveNomenclatureType}`);
      initialProducts = await getProductsByNomenclatureType(effectiveNomenclatureType);
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
        const regularPrice = typeof (product as any).price === 'number' ?
          (product as any).price : parseFloat(String((product as any).price)) || 0;

        const reducedPrice = (product as any).reduced_price ?
          (typeof (product as any).reduced_price === 'number' ?
            (product as any).reduced_price : parseFloat(String((product as any).reduced_price))) : null;

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
    inStock: effectiveInStock,
    nomenclatureType: effectiveNomenclatureType || "",
    operatingSystem: operatingSystems,
    storage: storage,
    ram: ram,
    source: sourceParam || "",
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
