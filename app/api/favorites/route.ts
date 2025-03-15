import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Get user's favorite products
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("Unauthorized: No valid session", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching favorites for user:", session.user.id);

    try {
      const favorites = await prisma.favoriteProduct.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log("Favorites found:", favorites.length);

      // Return just the list of product IDs
      return NextResponse.json({
        favorites: favorites.map((fav) => fav.productId),
      });
    } catch (dbError: any) {
      console.error("Database error fetching favorites:", dbError);
      return NextResponse.json(
        { error: "Database error fetching favorites", details: dbError?.message || String(dbError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in GET /api/favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a product to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("Unauthorized: No valid session", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { productId } = await req.json();

      if (!productId) {
        return NextResponse.json(
          { error: "Product ID is required" },
          { status: 400 }
        );
      }

      console.log("Adding favorite for user:", session.user.id, "productId:", productId);

      // Check if already exists
      const existingFavorite = await prisma.favoriteProduct.findFirst({
        where: {
          userId: session.user.id,
          productId,
        },
      });

      if (existingFavorite) {
        return NextResponse.json(
          { message: "Product already in favorites" },
          { status: 200 }
        );
      }

      // Add to favorites
      const favorite = await prisma.favoriteProduct.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });

      console.log("Favorite added successfully:", favorite.id);

      return NextResponse.json({ favorite }, { status: 201 });
    } catch (dbError: any) {
      console.error("Database error adding to favorites:", dbError);
      return NextResponse.json(
        { error: "Database error adding to favorites", details: dbError?.message || String(dbError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/favorites:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a product from favorites
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("Unauthorized: No valid session", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Removing favorite for user:", session.user.id, "productId:", productId);

    try {
      const result = await prisma.favoriteProduct.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      });

      console.log("Deletion result:", result);

      return NextResponse.json(
        { message: "Product removed from favorites", count: result.count },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error("Database error removing from favorites:", dbError);
      return NextResponse.json(
        { error: "Database error removing from favorites", details: dbError?.message || String(dbError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in DELETE /api/favorites:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
