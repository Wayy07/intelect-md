import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

// In-memory storage for favorites
interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

// Global store for favorites
const favoriteStore: Map<string, FavoriteItem[]> = new Map();

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// GET /api/favorites - Get user's favorite products
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session || !session.user) {
      console.log("Unauthorized: No valid session", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching favorites for user:", session.user.id);

    try {
      // Get favorites from in-memory store
      const userFavorites = favoriteStore.get(session.user.id) || [];
      console.log("Favorites found:", userFavorites.length);

      // Return just the list of product IDs
      return NextResponse.json({
        favorites: userFavorites.map((fav) => fav.productId),
      });
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
      return NextResponse.json(
        { error: "Error fetching favorites", details: error?.message || String(error) },
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
    const session = await getServerSession(getAuthOptions());

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

      // Get user's favorites
      const userFavorites = favoriteStore.get(session.user.id) || [];

      // Check if already exists
      const existingFavorite = userFavorites.find(fav => fav.productId === productId);

      if (existingFavorite) {
        return NextResponse.json(
          { message: "Product already in favorites" },
          { status: 200 }
        );
      }

      // Create new favorite
      const newFavorite: FavoriteItem = {
        id: generateId(),
        userId: session.user.id,
        productId,
        createdAt: new Date()
      };

      // Add to favorites
      userFavorites.push(newFavorite);
      favoriteStore.set(session.user.id, userFavorites);

      console.log("Favorite added successfully:", newFavorite.id);

      return NextResponse.json({ favorite: newFavorite }, { status: 201 });
    } catch (error: any) {
      console.error("Error adding to favorites:", error);
      return NextResponse.json(
        { error: "Error adding to favorites", details: error?.message || String(error) },
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

    const session = await getServerSession(getAuthOptions());

    if (!session || !session.user) {
      console.log("Unauthorized: No valid session", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Removing favorite for user:", session.user.id, "productId:", productId);

    try {
      // Get user's favorites
      const userFavorites = favoriteStore.get(session.user.id) || [];

      // Filter out the product to remove
      const updatedFavorites = userFavorites.filter(fav => fav.productId !== productId);

      // Calculate how many were removed
      const removedCount = userFavorites.length - updatedFavorites.length;

      // Update the store
      favoriteStore.set(session.user.id, updatedFavorites);

      console.log("Removed favorites:", removedCount);

      return NextResponse.json(
        { message: "Product removed from favorites", count: removedCount },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error removing from favorites:", error);
      return NextResponse.json(
        { error: "Error removing from favorites", details: error?.message || String(error) },
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
