import { ProductList } from "@/app/components/product-list";
import { Suspense } from "react";
import { getAllCategories } from "@/lib/product-api";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  category?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Await searchParams before accessing its properties
  const params = await Promise.resolve(searchParams);
  const category = params.category;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        {category ? `Products in ${category}` : "All Products"}
      </h1>

      <Suspense fallback={<div>Loading categories...</div>}>
        <CategorySelector currentCategory={category} />
      </Suspense>

      <div className="mt-8">
        <ProductList category={category} />
      </div>
    </div>
  );
}

// Categories selector component
async function CategorySelector({
  currentCategory
}: {
  currentCategory?: string
}) {
  // Get categories from server component
  const categories = await getAllCategories();

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/catalog/products"
        className={`px-4 py-2 rounded-full text-sm ${
          !currentCategory
            ? "bg-primary text-primary-foreground"
            : "bg-secondary hover:bg-secondary/80"
        }`}
      >
        All
      </Link>

      {categories.map((category) => (
        <Link
          key={category}
          href={`/catalog/products?category=${encodeURIComponent(category)}`}
          className={`px-4 py-2 rounded-full text-sm ${
            currentCategory === category
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
