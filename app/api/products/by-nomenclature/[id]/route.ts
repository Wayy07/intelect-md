import { NextRequest, NextResponse } from 'next/server';

// Add cache export options
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

// Define interfaces for the expected data structure
interface PriceType {
  name: string;
  code: string;
}

interface PriceList {
  id: string;
  productId: string;
  price: number;
  currency: string;
  priceType?: PriceType;
}

interface Product {
  id: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  currencyCode?: string;
  [key: string]: any; // For other properties
}

/**
 * API route handler for fetching products by nomenclature type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Resolve params before accessing its properties
    const resolvedParams = await Promise.resolve(params);
    const nomenclatureId = resolvedParams.id;

    // Get the search params
    const searchParams = request.nextUrl.searchParams;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Build the API URL with all query parameters
    const apiEndpoint = `${apiUrl}/products/by-nomenclature/${nomenclatureId}?${searchParams.toString()}`;

    console.log(`Proxying request to: ${apiEndpoint}`);

    // Forward the request to the backend server
    const response = await fetch(apiEndpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Error from API: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          message: `Error fetching products: ${response.status} ${response.statusText}`
        },
        { status: response.status }
      );
    }

    // Get the data from the API
    const data = await response.json();

    // If we have products, fetch price lists to get the correct pricing
    if (data.success && data.products && data.products.length > 0) {
      try {
        // Fetch price lists from the server - fix the URL
        // Using 'pricelists' instead of 'price-lists' (note: no hyphen)
        const priceListResponse = await fetch(`${apiUrl}/pricelists`, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 600 }, // Cache price lists for 10 minutes
        });

        console.log(`Price list API response status: ${priceListResponse.status}`);

        if (priceListResponse.ok) {
          const priceListData = await priceListResponse.json();

          if (priceListData.success && priceListData.priceLists) {
            console.log(`Found ${priceListData.priceLists.length} price entries to process`);

            // Create a mapping of product IDs to their price lists for faster lookup
            const productPriceMaps = new Map();

            // First, organize price lists by product ID
            priceListData.priceLists.forEach((priceEntry: PriceList) => {
              if (priceEntry.productId) {
                if (!productPriceMaps.has(priceEntry.productId)) {
                  productPriceMaps.set(priceEntry.productId, []);
                }
                productPriceMaps.get(priceEntry.productId).push(priceEntry);
              }
            });

            console.log(`Created price map for ${productPriceMaps.size} unique products`);

            // Process products with price list data
            data.products = data.products.map((product: Product) => {
              // Try to find price data for this product
              let productPrices = productPriceMaps.get(product.id) || [];

              if (productPrices.length === 0) {
                // Try matching by other possibly matching IDs
                if (product.productId) {
                  productPrices = productPriceMaps.get(product.productId) || [];
                }
              }

              if (productPrices.length > 0) {
                // Look for online price first in the product's price list
                const onlinePrice = productPrices.find((p: PriceList) =>
                  (p.priceType && p.priceType.name === "Online") ||
                  (p.priceType && p.priceType.code === "000000010")
                );

                if (onlinePrice) {
                  // Found an online price - use it
                  console.log(`Found Online price ${onlinePrice.price} for product ${product.name || product.id}`);
                  product.price = onlinePrice.price;
                  product.originalPrice = onlinePrice.price;
                  product.currency = onlinePrice.currency || 'MDL';
                  product.currencyCode = onlinePrice.priceType?.code || '498';
                } else {
                  // No online price - use the first available price
                  const anyPrice = productPrices[0];
                  console.log(`No Online price found, using fallback price ${anyPrice.price} for product ${product.name || product.id}`);
                  product.price = anyPrice.price;
                  product.originalPrice = anyPrice.price;
                  product.currency = anyPrice.currency || 'MDL';
                  product.currencyCode = anyPrice.priceType?.code || '498';
                }
              } else {
                // No price found in price lists - ensure price field is properly set from existing data
                console.log(`No price data found for product ${product.name || product.id}`);

                // Make sure we have a numeric price
                if (product.price === undefined || product.price === null) {
                  product.price = 0;
                } else if (typeof product.price === 'string') {
                  product.price = parseFloat(product.price) || 0;
                }

                // If we have a numeric price in originalPrice, but not in price, use originalPrice
                if (product.originalPrice !== undefined &&
                    product.originalPrice !== null &&
                    typeof product.originalPrice === 'number' &&
                    (product.price === 0 || isNaN(product.price))) {
                  product.price = product.originalPrice;
                }

                // Ensure we have currency info
                if (!product.currency) {
                  product.currency = 'MDL';
                }
              }

              // Add discount field if not present but we can calculate it
              if (product.originalPrice && product.price && product.originalPrice > product.price) {
                // Calculate discount percentage
                const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
                product.discount = Math.round(discount);
              }

              return product;
            });
          }
        } else {
          // Log error if price list API fails
          console.error(`Failed to fetch price lists: ${priceListResponse.status} - ${priceListResponse.statusText}`);

          // Try alternative endpoint as fallback
          const altPriceListResponse = await fetch(`${apiUrl}/prices`, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
            cache: 'no-store',
          });

          console.log(`Alternative price API response status: ${altPriceListResponse.status}`);

          if (altPriceListResponse.ok) {
            // Process alternative price source
            console.log("Using alternative price endpoint");
            // Process similar to above...
          }
        }
      } catch (priceError) {
        console.error('Error fetching price lists:', priceError);
        // Continue with original products if price list fetch fails
      }
    }

    // Return the data with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    console.error('Error in nomenclature products API route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
