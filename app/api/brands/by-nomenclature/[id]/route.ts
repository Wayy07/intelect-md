import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const nomenclatureId = params.id;

    // Get the API URL with all products for this nomenclature (unlimited)
    const apiUrl = `/api/products/by-nomenclature/${nomenclatureId}?limit=1000&inStock=true`;

    console.log(`Fetching brand counts for nomenclature ${nomenclatureId}`);

    // Fetch all products for this nomenclature
    const response = await fetch(new URL(apiUrl, request.url));

    if (!response.ok) {
      console.error(`Error fetching products: ${response.status}`);
      return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: response.status });
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.products)) {
      console.error('Invalid data format from products API');
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 500 });
    }

    // Count products by brand
    const brandCounts: Record<string, number> = {};

    // Process all products to extract brand counts
    data.products.forEach((product: any) => {
      // Extract brand ID using the same logic as in normalizeProduct
      let brandId = null;

      // Try to get brand directly
      if (product.brand) {
        brandId = product.brand;
      }
      // Try to get from characteristics
      else if (product.characteristics && Array.isArray(product.characteristics)) {
        const brandChar = product.characteristics.find((c: any) =>
          c.name === 'Brand' || c.name === 'Manufacturer' || c.name === 'brand'
        );
        if (brandChar?.propertyList?.propertyValue?.[0]?.simpleValue) {
          brandId = brandChar.propertyList.propertyValue[0].simpleValue;
        }
      }

      if (brandId) {
        brandCounts[brandId] = (brandCounts[brandId] || 0) + 1;
      }
    });

    console.log(`Found ${Object.keys(brandCounts).length} brands with products`);

    return NextResponse.json({
      success: true,
      brandCounts,
      totalProducts: data.products.length,
      totalBrands: Object.keys(brandCounts).length
    });

  } catch (error) {
    console.error('Error processing brand counts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
