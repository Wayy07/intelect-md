"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { Toaster } from "@/app/components/ui/toaster";
import { clearSessionRetryCount } from "@/lib/session-utils";

export function Providers({ children }: { children: ReactNode }) {
  // Clear retry counter when component mounts
  useEffect(() => {
    clearSessionRetryCount();
  }, []);

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
      <Toaster />
    </SessionProvider>
  );
}
