import { NextRequest, NextResponse } from "next/server";
import { getSpecificProducts, getSpecificProductIds } from "@/lib/product-api";

// GET /api/products/verify - Verify our specific product fetching is working
export async function GET(request: NextRequest) {
  try {
    // Get IDs we're trying to fetch
    const productIds = await getSpecificProductIds();

    // Fetch the products
    const products = await getSpecificProducts();

    // Check how many we successfully retrieved
    const successCount = products.length;
    const totalRequested = productIds.length;
    const successRate = (successCount / totalRequested) * 100;

    // Get the IDs we actually retrieved
    const retrievedIds = products.map(p => p.id);

    // Find which IDs weren't retrieved
    const missingIds = productIds.filter(id => !retrievedIds.includes(id));

    return NextResponse.json({
      success: true,
      status: `Successfully fetched ${successCount} of ${totalRequested} requested products (${successRate.toFixed(1)}%)`,
      requestedIds: productIds,
      retrievedIds: retrievedIds,
      missingIds: missingIds,
      products: products.map(p => ({
        id: p.id,
        title: p.titleRO || p.titleEN || p.titleRU,
        price: p.price,
        reduced_price: p.reduced_price
      }))
    });
  } catch (error) {
    console.error("Error verifying product fetching:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify product fetching",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
