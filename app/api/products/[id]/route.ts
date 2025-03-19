import { NextRequest, NextResponse } from "next/server";
import { allProducts } from "@/app/utils/mock-data";

// GET /api/products/:id - Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Find the product by ID in the mock data
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
