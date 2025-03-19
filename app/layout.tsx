import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/layout/header-wrapper";
import FooterWrapper from "@/components/layout/footer-wrapper";
import { cn } from "@/lib/utils";
import { CookieConsent } from "@/components/cookie-consent";
import { LanguageProvider } from "@/lib/language-context";
import { CartProvider } from "@/app/contexts/cart-context";
import { Providers } from "./providers";
import { FavoritesProvider } from "@/app/contexts/favorites-context";

const inter = Inter({ subsets: ["latin"] });

// Base URL for absolute URLs
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://intelect.md";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Intelect MD | Magazin online de tehnică și electronice",
    template: "%s | Intelect MD",
  },
  description:
    "Magazin online de tehnică și electronice în Moldova. Laptop-uri, smartphone-uri, tablete și alte produse electronice la prețuri avantajoase.",
  keywords: [
    "tehnică",
    "electronice",
    "magazin online",
    "moldova",
    "laptop",
    "smartphone",
    "tablete",
    "televizoare",
    "căști",
    "smartwatch",
    "console",
    "aspiratoare",
  ],
  authors: [{ name: "Intelect MD" }],
  creator: "Intelect MD",
  publisher: "Intelect MD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  applicationName: "Intelect MD",
  category: "ecommerce",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "ro_MD",
    alternateLocale: "ru_MD",
    url: baseUrl,
    siteName: "Intelect MD",
    title: "Intelect MD | Magazin online de tehnică și electronice",
    description:
      "Magazin online de tehnică și electronice în Moldova. Laptop-uri, smartphone-uri, tablete și alte produse electronice la prețuri avantajoase.",
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Intelect MD - Magazin online de tehnică",
      },
    ],
  },
  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Intelect MD | Magazin online de tehnică și electronice",
    description:
      "Magazin online de tehnică și electronice în Moldova. Laptop-uri, smartphone-uri, tablete și alte produse electronice la prețuri avantajoase.",
    images: [`${baseUrl}/images/twitter-image.jpg`],
    creator: "@intelectmd",
  },
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },
  manifest: "/manifest.json",
  // Verification for search engines
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  // Alternate language versions
  alternates: {
    languages: {
      "ro-MD": `${baseUrl}/ro`,
      "ru-MD": `${baseUrl}/ru`,
    },
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background flex flex-col"
        )}
      >
        <Providers>
          <FavoritesProvider>
            <LanguageProvider>
              <CartProvider>
                <HeaderWrapper />
                <main className="flex-grow">{children}</main>
                <FooterWrapper />
                <CookieConsent />
              </CartProvider>
            </LanguageProvider>
          </FavoritesProvider>
        </Providers>
      </body>
    </html>
  );
}
