import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for similar products
 */
export async function GET(request: NextRequest) {
  try {
    // Get productId and limit from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const limit = searchParams.get("limit") || "8";

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // API Base URL from environment variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    console.log(`Fetching similar products for product ${productId} from ${API_URL}/similar-products`);

    // Build the query string
    const queryParams = new URLSearchParams();
    queryParams.append("productId", productId);
    queryParams.append("limit", limit);

    try {
      // Fetch data from the server API
      const response = await fetch(`${API_URL}/similar-products?${queryParams.toString()}`, {
        cache: 'no-store',
        next: { revalidate: 0 } // Disable revalidation caching
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.products?.length || 0} similar products from the API`);
        return NextResponse.json(data);
      }

      console.error(`Error fetching similar products: ${response.status} ${response.statusText}`);

      // If similar-products fails, try falling back to regular products API with brand filter
      console.log('Attempting fallback to products API with brand filter...');

      // First, get the current product to extract its brand
      const productResponse = await fetch(`${API_URL}/products/${productId}`, {
        cache: 'no-store'
      });

      if (!productResponse.ok) {
        throw new Error(`Failed to fetch product details: ${productResponse.status}`);
      }

      const productData = await productResponse.json();
      const brand = productData.product?.brand;

      if (brand) {
        // Now fetch products with the same brand
        const brandsQueryParams = new URLSearchParams();
        brandsQueryParams.append("brand", brand);
        brandsQueryParams.append("limit", limit);
        brandsQueryParams.append("inStock", "true");

        const brandResponse = await fetch(`${API_URL}/products?${brandsQueryParams.toString()}`, {
          cache: 'no-store'
        });

        if (brandResponse.ok) {
          const brandData = await brandResponse.json();
          if (brandData.success && brandData.products && brandData.products.length > 0) {
            console.log(`Fallback successful: found ${brandData.products.length} products of brand ${brand}`);
            return NextResponse.json({
              success: true,
              products: brandData.products,
              source: 'fallback-brand'
            });
          }
        }
      }

      // If all else fails, return an empty products array rather than an error
      return NextResponse.json({
        success: true,
        products: [],
        message: "No similar products found after fallback attempts"
      });

    } catch (fetchError) {
      console.error('Fetch error in similar-products API route:', fetchError);
      // Return empty products array instead of error to avoid breaking the UI
      return NextResponse.json({
        success: true,
        products: [],
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      });
    }
  } catch (error) {
    console.error('Error in similar-products API route:', error);
    // Return empty products array instead of error to avoid breaking the UI
    return NextResponse.json({
      success: true,
      products: [],
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
