import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for a specific ROST product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Fetching ROST product with ID: ${id}`);

    // API Base URL from environment variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Fetch from our Express server's ROST products API
    const response = await fetch(`${API_URL}/rost-products/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 } // Disable revalidation caching
    });

    if (!response.ok) {
      console.error(`Error fetching ROST product: ${response.status}`);
      return NextResponse.json(
        { success: false, message: "ROST product not found" },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ROST product:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      },
      { status: 500 }
    );
  }
}
