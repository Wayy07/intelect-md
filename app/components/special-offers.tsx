"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/app/components/ui/product-card"
import { useToast } from "@/app/components/ui/use-toast"
import { Toaster } from "@/app/components/ui/toaster"
import { Tags } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface Product {
  id: string
  nume: string
  cod: string
  pret: number
  pretRedus?: number | null
  imagini: string[]
  stoc: number
  subcategorie: {
    id: string
    nume: string
    categoriePrincipala: {
      id: string
      nume: string
    }
  }
}

export default function SpecialOffers() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSpecialOffers = async () => {
      try {
        // Mock data instead of API call
        // This would be replaced with a call to your custom API
        const mockProducts: Product[] = [
          {
            id: "1",
            nume: "Smart TV Example 55\"",
            cod: "TV-001",
            pret: 9999,
            pretRedus: 7999,
            imagini: ["https://i.pinimg.com/736x/ef/5b/0f/ef5b0fa991fb97235d512b5de5cd449b.jpg"],
            stoc: 5,
            subcategorie: {
              id: "sub1",
              nume: "Smart TV",
              categoriePrincipala: {
                id: "cat1",
                nume: "Electronice"
              }
            }
          },
          {
            id: "2",
            nume: "Wireless Headphones Pro",
            cod: "WH-002",
            pret: 1999,
            pretRedus: 1499,
            imagini: ["https://i.pinimg.com/736x/78/51/41/785141f59aabd3352ccc34398cd0f40a.jpg"],
            stoc: 20,
            subcategorie: {
              id: "sub2",
              nume: "Căști",
              categoriePrincipala: {
                id: "cat2",
                nume: "Accesorii"
              }
            }
          },
          {
            id: "3",
            nume: "Gaming Console X",
            cod: "GC-003",
            pret: 7999,
            pretRedus: 6999,
            imagini: ["https://i.pinimg.com/736x/1b/bc/f3/1bbcf394f2f999b67b6f9c7dd7f415e2.jpg"],
            stoc: 8,
            subcategorie: {
              id: "sub3",
              nume: "Console",
              categoriePrincipala: {
                id: "cat3",
                nume: "Gaming"
              }
            }
          }
        ];

        setProducts(mockProducts);
      } catch (error) {
        console.error("Error setting mock products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate loading delay for mock data
    setTimeout(fetchSpecialOffers, 500);
  }, []);

  // Add global style to hide main category tags on mobile
  useEffect(() => {
    const styleTag = document.createElement('style')

    // Target the main category tag specifically based on its position and content
    styleTag.textContent = `
      @media (max-width: 768px) {
        /* Hide main category tag in product cards, keep discount tag visible */
        .absolute.left-3.top-3.z-10.flex.flex-wrap.gap-2 .rounded-full.bg-primary.px-2\\.5.py-1.text-xs.font-medium.text-white:nth-child(2) {
          display: none !important;
        }
      }
    `
    document.head.appendChild(styleTag)

    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", product)
    toast({
      title: t("addedToCart"),
      description: t("productAddedToCart"),
    })
  }

  const handleAddToFavorites = (product: Product) => {
    // TODO: Implement favorites functionality
    console.log("Add to favorites:", product)
    toast({
      title: t("addedToFavorites"),
      description: t("productAddedToFavorites"),
    })
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-100 animate-pulse">
              <div className="aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // No offers available
  if (products.length === 0) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t("specialOffers")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("noOffersAvailable")}
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
              <Tags className="h-7 w-7 text-primary" />
              {t("specialOffers")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("discoverDiscountedProducts")}
            </p>
          </div>

          <Link
            href="/catalog?onSale=true"
            className="hidden md:inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("seeAllOffers")}
          </Link>
        </div>

        {/* Product grid - responsive for both mobile and desktop */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:grid-cols-4">
          {products.slice(0, 12).map((product) => (
            <div
              key={product.id}
              className="h-full"
            >
              <Link href={`/produs/${product.id}`} className="block h-full">
                <ProductCard
                  product={product}
                  onAddToFavorites={handleAddToFavorites}
                  disableLink={true}
                />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/catalog?onSale=true"
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("seeAllOffers")}
            <span className="ml-1 text-xs">→</span>
          </Link>
        </div>
      </section>
      <Toaster />
    </>
  )
}
