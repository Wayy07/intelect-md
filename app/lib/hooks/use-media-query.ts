"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to check if a media query matches
 * @param query The media query to check, e.g. "(max-width: 768px)"
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Set the initial value
      setMatches(media.matches);

      // Create a listener function to update state when match changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add the listener
      media.addEventListener("change", listener);

      // Clean up on unmount
      return () => {
        media.removeEventListener("change", listener);
      };
    }

    return undefined;
  }, [query]);

  return matches;
}
