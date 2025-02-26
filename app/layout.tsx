import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/layout/header-wrapper";
import { cn } from "@/lib/utils";
import { CookieConsent } from "@/components/cookie-consent";
import { LanguageProvider } from "@/lib/language-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intelect MD",
  description: "Magazin online de tehnică și electronice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <LanguageProvider>
          <HeaderWrapper />
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
