import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to brands.json file
    const filePath = path.join(process.cwd(), 'server', '.cache', 'brands.json');

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error('Brands file not found:', filePath);

      // Try to fetch brands from the server API
      try {
        const response = await fetch('http://localhost:3001/api/brands');
        if (!response.ok) {
          throw new Error(`Server API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.brands && Array.isArray(data.brands)) {
          return NextResponse.json(data.brands);
        }
      } catch (serverError) {
        console.error('Error fetching brands from server API:', serverError);
      }

      return NextResponse.json([], { status: 404 });
    }

    // Read the brands file
    const brandsData = fs.readFileSync(filePath, 'utf8');
    let brands = JSON.parse(brandsData);

    console.log(`Loaded ${brands.length} brands from file.`);

    // Return the brands
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error serving brands data:', error);
    return NextResponse.json([], { status: 500 });
  }
}
