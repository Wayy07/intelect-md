import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for ROST products
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "10";
    const page = searchParams.get("page") || "1";
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const productId = searchParams.get("productId");

    // API Base URL from environment variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    if (productId) {
      // If productId is provided, fetch a specific product
      console.log(`Fetching ROST product with ID: ${productId}`);

      const response = await fetch(`${API_URL}/rost-products/${productId}`, {
        cache: 'no-store',
        next: { revalidate: 0 } // Disable revalidation caching
      });

      if (!response.ok) {
        console.error(`Error fetching ROST product: ${response.status}`);
        throw new Error(`Failed to fetch ROST product: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Otherwise, fetch a list of products with filters
      console.log('Fetching ROST products with filters');

      // Build query string
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append("limit", limit);
      if (page) queryParams.append("page", page);
      if (category) queryParams.append("category", category);
      if (brand) queryParams.append("brand", brand);
      if (search) queryParams.append("search", search);
      if (minPrice) queryParams.append("minPrice", minPrice);
      if (maxPrice) queryParams.append("maxPrice", maxPrice);
      if (inStock) queryParams.append("inStock", inStock);

      const response = await fetch(`${API_URL}/rost-products?${queryParams.toString()}`, {
        cache: 'no-store',
        next: { revalidate: 0 } // Disable revalidation caching
      });

      if (!response.ok) {
        console.error(`Error fetching ROST products: ${response.status}`);
        throw new Error(`Failed to fetch ROST products: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error in ROST products API route:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      },
      { status: 500 }
    );
  }
}
