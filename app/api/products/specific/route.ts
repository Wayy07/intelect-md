import { NextRequest, NextResponse } from "next/server";
import { getSpecificProducts, getSpecificProductIds } from "@/lib/product-api";

// GET /api/products/specific - Get the specific products we're focusing on
export async function GET(request: NextRequest) {
  try {
    // Get all specific products
    const products = await getSpecificProducts();
    const productIds = await getSpecificProductIds();

    console.log(`API: Returning ${products.length} specific products`);

    // Return the products with a message
    return NextResponse.json({
      products,
      message: `Successfully fetched ${products.length} specific products`,
      productIds
    });
  } catch (error) {
    console.error("Error fetching specific products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch specific products",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
