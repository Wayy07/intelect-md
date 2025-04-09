import { NextRequest, NextResponse } from "next/server";
import { allProducts } from "@/app/utils/mock-data";

/**
 * GET handler for product listing with filters
 */
export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get("limit") || "10";
  const page = searchParams.get("page") || "1";
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock");

  // Build query string for the API
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append("limit", limit);
  if (page) queryParams.append("page", page);
  if (category) queryParams.append("category", category);
  if (subcategory) queryParams.append("subcategory", subcategory);
  if (brand) queryParams.append("brand", brand);
  if (search) queryParams.append("search", search);
  if (minPrice) queryParams.append("minPrice", minPrice);
  if (maxPrice) queryParams.append("maxPrice", maxPrice);
  if (inStock) queryParams.append("inStock", inStock);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    // Try to fetch from our Express API server
    const response = await fetch(`${API_URL}/products?${queryParams.toString()}`, {
      cache: "no-store",
      next: { revalidate: 0 } // Disable revalidation caching
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    console.log('API fetch failed, falling back to mock data');

    // Fallback to mock data if API fails
    // Filter products based on query params
    let filteredProducts = [...allProducts];

    // Apply filters from query params
    if (category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.subcategorie?.categoriePrincipala?.id === category
      );
    }

    if (subcategory) {
      filteredProducts = filteredProducts.filter(
        (p) => p.subcategorie?.id === subcategory
      );
    }

    if (brand) {
      // Ensure brand is a string
      const brandStr = Array.isArray(brand) ? brand[0] : brand;
      filteredProducts = filteredProducts.filter((p) => {
        const productBrand = p.specificatii?.brand;
        // Check if brand exists and handle string or array
        if (!productBrand) return false;

        const brandValue = typeof productBrand === 'string'
          ? productBrand.toLowerCase()
          : Array.isArray(productBrand) && productBrand.length > 0
            ? productBrand[0].toLowerCase()
            : '';

        return brandValue === brandStr.toLowerCase();
      });
    }

    if (search) {
      // Ensure search is a string
      const searchStr = typeof search === 'string' ? search : '';
      const searchLower = searchStr.toLowerCase();

      filteredProducts = filteredProducts.filter(
        (p) =>
          p.nume.toLowerCase().includes(searchLower) ||
          (p.descriere && p.descriere.toLowerCase().includes(searchLower)) ||
          p.cod.toLowerCase().includes(searchLower)
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      filteredProducts = filteredProducts.filter(
        (p) => (p.pretRedus || p.pret) >= min
      );
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(
        (p) => (p.pretRedus || p.pret) <= max
      );
    }

    if (inStock === "true") {
      filteredProducts = filteredProducts.filter((p) => p.stoc > 0);
    }

    // Apply pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const startIdx = (pageNum - 1) * limitNum;
    const endIdx = startIdx + limitNum;

    const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      total: filteredProducts.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredProducts.length / limitNum)
    });
  } catch (error) {
    console.error('Error fetching products:', error);

    // Return mock data as fallback on error
    return NextResponse.json({
      success: true,
      products: allProducts.slice(0, parseInt(limit)),
      total: allProducts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(allProducts.length / parseInt(limit))
    });
  }
}
