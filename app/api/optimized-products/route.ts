import { NextRequest, NextResponse } from "next/server";
import { allProducts as mockProducts } from "@/app/utils/mock-data";
import { Product } from "@/lib/product-api";

// Global variable to store products in memory (serverless functions)
// Note: This will persist while the server is running, but will reset on redeploys
let cachedProducts: any[] = [];
let cacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// List of specific product IDs we want to fetch
const SPECIFIC_PRODUCT_IDS = [
  "48512", "19462", "19447", "68394", "68395",
  "3587", "3544", "738", "19463", "44962",
  "19465", "19464"
];

// Convert mock products to our Product interface
function convertMockToApiProduct(mockProduct: any): any {
  return {
    id: mockProduct.id,
    SKU: mockProduct.cod,
    titleRO: mockProduct.nume,
    titleRU: mockProduct.nume,
    titleEN: mockProduct.nume,
    price: mockProduct.pret.toString(),
    reduced_price: mockProduct.pretRedus ? mockProduct.pretRedus.toString() : undefined,
    min_qty: "1",
    on_stock: mockProduct.stoc.toString(),
    img: mockProduct.imagini[0],
    category: mockProduct.subcategorie.categoriePrincipala.id
  };
}

// GET /api/optimized-products - Get only the specific products we want
export async function GET(request: NextRequest) {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedProducts.length > 0 && now - cacheTime < CACHE_TTL) {
      console.log("Serving specific products from cache");
      return NextResponse.json({
        products: cachedProducts,
        source: "cache",
        count: cachedProducts.length
      });
    }

    console.log("Cache expired or empty, getting products from mock data");

    // Convert mock products to API format
    const allApiProducts = mockProducts.map(convertMockToApiProduct);

    // For mock data, we'll just use the first 12 products if we can't match IDs
    let filteredProducts = allApiProducts.filter((product: any) =>
      SPECIFIC_PRODUCT_IDS.includes(product.id)
    );

    // If we don't have enough matching products, just use the first N
    if (filteredProducts.length < SPECIFIC_PRODUCT_IDS.length) {
      console.log(`Only found ${filteredProducts.length} matching products in mock data, using first ${SPECIFIC_PRODUCT_IDS.length} products instead`);
      filteredProducts = allApiProducts.slice(0, SPECIFIC_PRODUCT_IDS.length);
    }

    console.log(`Found ${filteredProducts.length} products from mock data`);

    // Update the cache
    cachedProducts = filteredProducts;
    cacheTime = now;

    // Return products
    return NextResponse.json({
      products: filteredProducts,
      source: "mock_data",
      count: filteredProducts.length
    });
  } catch (error) {
    console.error("Error fetching optimized products:", error);

    // If we have cached products, return them even if they're expired
    if (cachedProducts.length > 0) {
      console.log("Error processing mock data, serving stale cache");
      return NextResponse.json({
        products: cachedProducts,
        source: "stale_cache",
        count: cachedProducts.length,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
