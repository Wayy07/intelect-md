"use client";

import { LanguageProvider } from "@/lib/language-context";
import React from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
