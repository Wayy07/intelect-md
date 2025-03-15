import { NextRequest, NextResponse } from "next/server";

// Import our mock product database
import { mockProducts, Product } from "./mock-data";

// GET /api/products - Get a list of products with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get search params from URL
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const searchTerm = searchParams.get('search')?.toLowerCase();
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || Number.MAX_SAFE_INTEGER;
    const sortBy = searchParams.get('sortBy') || 'default'; // default, price-asc, price-desc, name-asc, name-desc
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;

    // Filter products based on query parameters
    let filteredProducts = [...mockProducts];

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(
        p => p.subcategorie.categoriePrincipala.id === category
      );
    }

    // Filter by subcategory
    if (subcategory) {
      filteredProducts = filteredProducts.filter(
        p => p.subcategorie.id === subcategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        p =>
          p.nume.toLowerCase().includes(searchTerm) ||
          p.cod.toLowerCase().includes(searchTerm) ||
          p.descriere?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by price range
    filteredProducts = filteredProducts.filter(
      p => {
        const price = p.pretRedus || p.pret;
        return price >= minPrice && price <= maxPrice;
      }
    );

    // Sort products
    if (sortBy === 'price-asc') {
      filteredProducts.sort((a, b) => (a.pretRedus || a.pret) - (b.pretRedus || b.pret));
    } else if (sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => (b.pretRedus || b.pret) - (a.pretRedus || a.pret));
    } else if (sortBy === 'name-asc') {
      filteredProducts.sort((a, b) => a.nume.localeCompare(b.nume));
    } else if (sortBy === 'name-desc') {
      filteredProducts.sort((a, b) => b.nume.localeCompare(a.nume));
    }

    // Calculate pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Simulate a slight delay to mimic real API behavior
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return paginated products with metadata
    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Eroare la preluarea produselor' },
      { status: 500 }
    );
  }
}
