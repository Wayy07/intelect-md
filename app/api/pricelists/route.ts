import { NextResponse } from 'next/server';

// Add caching settings
export const dynamic = 'force-dynamic';
export const revalidate = 600; // Cache for 10 minutes

/**
 * API route handler for fetching price lists
 */
export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Forward the request to the backend server with caching
    const response = await fetch(`${apiUrl}/pricelists`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      console.error(`Error from API: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          message: `Error fetching price lists: ${response.status} ${response.statusText}`
        },
        { status: response.status }
      );
    }

    // Get the data from the API
    const data = await response.json();

    // Return the data with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      }
    });
  } catch (error) {
    console.error('Error in price lists API route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
