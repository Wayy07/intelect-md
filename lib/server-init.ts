"use server";
import "server-only";

import { initializeProductCache } from "./product-api";

// Initialization flag to prevent multiple initializations
let isInitializing = false;
let isInitialized = false;

// Target categories to fetch (add your specific categories here)
const targetCategories: string[] = [
  // The category mentioned by the user
  "PRODUS ASTEPTAT NOG",
  // Add other categories as needed
];

/**
 * Initializes server-side services and caches
 */
export async function initializeServer() {
  // Prevent concurrent initializations
  if (isInitializing || isInitialized) return;

  isInitializing = true;
  console.log("🔄 Server initialization started...");

  try {
    // Initialize product cache with target categories
    await initializeProductCache(targetCategories.length > 0 ? targetCategories : undefined);

    // Add other initialization tasks here if needed

    isInitialized = true;
    console.log("✅ Server initialization completed successfully");
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
  } finally {
    isInitializing = false;
  }
}

/**
 * Checks if the server is initialized
 */
export async function isServerInitialized() {
  return isInitialized;
}
