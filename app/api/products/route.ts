import { NextRequest, NextResponse } from "next/server";
import { allProducts, Product } from "@/app/utils/mock-data";

// GET /api/products - Get all products with optional filters
export async function GET(request: NextRequest) {
  try {
    // Get URL params
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const search = searchParams.get("search");
    const onSale = searchParams.get("onSale") === "true";
    const latest = searchParams.get("latest") === "true";
    const limit = Number(searchParams.get("limit") || "30");
    const page = Number(searchParams.get("page") || "1");

    // Apply filters
    let filteredProducts: Product[] = [...allProducts];

    if (category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.subcategorie.categoriePrincipala.id === category
      );
    }

    if (subcategory) {
      filteredProducts = filteredProducts.filter(
        (p) => p.subcategorie.id === subcategory
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.nume.toLowerCase().includes(searchLower) ||
          p.descriere?.toLowerCase().includes(searchLower)
      );
    }

    if (onSale) {
      filteredProducts = filteredProducts.filter((p) => p.pretRedus !== null);
    }

    if (latest) {
      // Sort by newest (use the order in the array for now)
      filteredProducts = filteredProducts.slice(0, 10);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Count for pagination metadata
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Return products with pagination metadata
    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
