import { NextResponse } from 'next/server';
import { ALL_CATEGORIES } from '@/lib/categories';

export async function GET(request) {
  try {
    console.log('Catalog structure endpoint called');

    // Check if we should force a refresh of the data (for client caching)
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Always return the static categories from our constants
    return NextResponse.json({
      success: true,
      categories: ALL_CATEGORIES,
      message: 'Using static catalog structure'
    });
  } catch (error) {
    console.error('API Error in catalog structure endpoint:', error);

    // Return categories from our constants in case of error
    return NextResponse.json(
      {
        success: true,
        categories: ALL_CATEGORIES,
        error: error.message,
        message: 'Using default categories due to error'
      },
      { status: 200 } // Return 200 OK even on error since we're providing fallback data
    );
  }
}
