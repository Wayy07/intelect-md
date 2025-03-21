// Safe parameter extraction function
export function getSafeParam(value: string | string[] | undefined, defaultValue: string = ''): string {
  if (value === undefined) return defaultValue;
  return Array.isArray(value) ? value[0] || defaultValue : value || defaultValue;
}

// Safely extract parameters from searchParams object without any operations on it
export function extractParams(searchParams: { [key: string]: string | string[] | undefined }) {
  // Access each property directly without spread operator or iteration
  return {
    categoryParam: getSafeParam(searchParams.category),
    subcategoryParam: getSafeParam(searchParams.subcategory),
    brandParam: getSafeParam(searchParams.brand),
    minPriceParam: getSafeParam(searchParams.minPrice),
    maxPriceParam: getSafeParam(searchParams.maxPrice),
    searchQuery: getSafeParam(searchParams.q),
    sortParam: getSafeParam(searchParams.sort),
    inStockParam: getSafeParam(searchParams.inStock),
    pageParam: getSafeParam(searchParams.page, '1'),
  };
}
