import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for product images by ID
 * This endpoint specifically gets only the imageList for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    // First try to fetch from Ultra API
    const ultraResponse = await fetch(`${API_URL}/products/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 } // Disable revalidation caching
    });

    if (ultraResponse.ok) {
      const ultraData = await ultraResponse.json();

      // If we have imageList data, return it
      if (ultraData.success &&
          ultraData.product &&
          ultraData.product.imageList &&
          ultraData.product.imageList.image) {

        return NextResponse.json({
          success: true,
          imageList: ultraData.product.imageList
        });
      }
    }

    // If Ultra API doesn't have images, try the Ultra API v2
    const ultraV2Response = await fetch(`https://api.esempla.com/product/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (ultraV2Response.ok) {
      const ultraV2Data = await ultraV2Response.json();

      // If we have imageList data from V2 API, return it
      if (ultraV2Data &&
          ultraV2Data.imageList &&
          ultraV2Data.imageList.image) {

        return NextResponse.json({
          success: true,
          imageList: ultraV2Data.imageList
        });
      }
    }

    // If neither API had images, return empty result
    return NextResponse.json({
      success: false,
      message: "No images found for this product"
    });
  } catch (error) {
    console.error('Error fetching product images:', error);

    return NextResponse.json({
      success: false,
      message: "Error fetching product images"
    }, { status: 500 });
  }
}
