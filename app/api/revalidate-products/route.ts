import { revalidateTag } from "next/cache";
import { initializeProductCache } from "@/lib/product-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the secret from the request
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Validate the secret
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: "Invalid secret" },
        { status: 401 }
      );
    }

    // Revalidate the products tag
    revalidateTag("products");

    // Reinitialize the product cache
    await initializeProductCache();

    return NextResponse.json(
      {
        revalidated: true,
        message: "Products revalidated and cache reinitialized"
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Error revalidating products",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
