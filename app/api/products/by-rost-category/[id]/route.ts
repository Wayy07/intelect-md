import { NextRequest, NextResponse } from 'next/server';

// Add cache export options
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * API route handler for fetching ROST products by category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Resolve params before accessing its properties
    const resolvedParams = await Promise.resolve(params);
    const categoryId = resolvedParams.id;

    // Get the search params
    const searchParams = request.nextUrl.searchParams;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Build the API URL for ROST products by category
    const apiEndpoint = `${apiUrl}/rost-products/by-category/${categoryId}?${searchParams.toString()}`;

    console.log(`Fetching ROST products by category: ${apiEndpoint}`);

    // Forward the request to the backend server with caching
    const response = await fetch(apiEndpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Error from API: ${response.status} ${response.statusText}`);

      // If we can't fetch from the ROST API, fall back to empty products
      return NextResponse.json(
        {
          success: true,
          products: [],
          total: 0,
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '20'),
          totalPages: 0,
          message: `No products found for category ${categoryId}`
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          }
        }
      );
    }

    // Get the data from the API
    const data = await response.json();

    // Return the ROST products data with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    console.error('Error in ROST category products API route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        products: [],
        total: 0,
        page: parseInt(request.nextUrl.searchParams.get('page') || '1'),
        limit: parseInt(request.nextUrl.searchParams.get('limit') || '20'),
        totalPages: 0
      },
      { status: 500 }
    );
  }
}
