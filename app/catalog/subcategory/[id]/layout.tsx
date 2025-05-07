import { Metadata } from "next";

// Define nomenclature type mapping for display names and metadata
const nomenclatureNames: Record<string, string> = {
  "d66ca3b3-4e6d-11ea-b816-00155d1de702": "Smartphones",
  "ee525756-4e6d-11ea-b816-00155d1de702": "TVs",
  "ee525756-4e6d-11ea-b816-00155d1de701": "Tablets",
  // Add more mappings as needed
};

// Define metadata descriptions for each nomenclature type
const nomenclatureDescriptions: Record<string, string> = {
  "d66ca3b3-4e6d-11ea-b816-00155d1de702": "Browse our selection of the latest smartphones from top brands. Find the perfect phone with great features at competitive prices.",
  "ee525756-4e6d-11ea-b816-00155d1de702": "Explore our range of high-quality TVs, from 4K and OLED to Smart TVs. Find the perfect television for your home entertainment.",
  "ee525756-4e6d-11ea-b816-00155d1de701": "Discover our collection of tablets from leading brands. Perfect for work, entertainment, or browsing on the go.",
  // Add more descriptions as needed
};

// Generate metadata based on the nomenclature ID
export async function generateMetadata({
  params
}: {
  params: { id: string | string[] | undefined }
}): Promise<Metadata> {
  // Ensure params is properly resolved before accessing properties
  const resolvedParams = await Promise.resolve(params);
  const nomenclatureId = Array.isArray(resolvedParams.id)
    ? resolvedParams.id[0]
    : resolvedParams.id || "";

  const nomenclatureName = nomenclatureNames[nomenclatureId] || "Products";
  const description = nomenclatureDescriptions[nomenclatureId] ||
    "Browse our catalog of quality products. Find what you need at competitive prices.";

  return {
    title: `${nomenclatureName} | Intelect Shop`,
    description,
    openGraph: {
      title: `${nomenclatureName} - Intelect`,
      description,
      type: "website",
    },
  };
}

export default function NomenclatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50/50">
      {children}
    </section>
  );
}
