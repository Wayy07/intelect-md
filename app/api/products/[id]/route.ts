import { NextRequest, NextResponse } from "next/server";
import { mockProducts } from '../mock-data';

// GET /api/products/:id - Get a single product by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // In Next.js App Router with App Router, we need to await the params
    // The context object is provided by Next.js and contains the route parameters
    const { id } = context.params;

    // Find product in mock database
    const product = mockProducts.find(p => p.id === id);

    // Return 404 if product not found
    if (!product) {
      return NextResponse.json(
        { error: 'Produsul nu a fost găsit' },
        { status: 404 }
      );
    }

    // Simulate slight delay to mimic real API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return product
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Eroare la preluarea detaliilor produsului' },
      { status: 500 }
    );
  }
}
