import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalog | Intelect",
  description: "Browse our complete catalog of products. Find the latest tech, gadgets, and electronics at competitive prices.",
  openGraph: {
    title: "Product Catalog | Intelect",
    description: "Browse our complete catalog of products. Find the latest tech, gadgets, and electronics at competitive prices.",
    type: "website",
  },
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {children}
    </section>
  );
}
