import { NextRequest, NextResponse } from "next/server";
import { allProducts } from "@/app/utils/mock-data";

/**
 * GET handler for product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // With App Router, params are already resolved, no need to await
  const id = params.id;

  // First try to fetch from our real API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    // Fetch from our Express API server
    const response = await fetch(`${API_URL}/products/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 } // Disable revalidation caching
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fallback to mock data if API fails
    console.log(`API fetch failed for product ${id}, falling back to mock data`);

  // Find the product by ID in the mock data
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);

    // Fallback to mock data if there's an error
    const product = allProducts.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
  }

    return NextResponse.json({ success: true, product });
  }
}
