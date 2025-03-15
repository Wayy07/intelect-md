"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { handleSessionError } from "@/lib/session-utils";

/**
 * A wrapper around useSession that handles the "No valid session" error
 * This is especially useful during development when hot reloading
 * can cause session initialization issues.
 */
export const useProtectedSession = () => {
  const session = useSession();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      console.log("Session status:", session.status);
    }

    // Handle any session errors
    if (session.status === "error" && session.data === null) {
      handleSessionError(new Error("No valid session { session: null }"));
    }
  }, [session.status, session.data]);

  return session;
};
