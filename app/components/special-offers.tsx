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
          },
          {
            id: "4",
            nume: "High-Performance SSD 1TB",
            cod: "SSD-004",
            pret: 1499,
            pretRedus: 999,
            imagini: ["https://i.pinimg.com/736x/c7/d0/a3/c7d0a39b5b0f2ce5eb12d66af6019212.jpg"],
            stoc: 30,
            subcategorie: {
              id: "sub4",
              nume: "Componente PC",
              categoriePrincipala: {
                id: "cat4",
                nume: "Computere"
              }
            }
          },
          {
            id: "5",
            nume: "Robot Vacuum Cleaner Pro",
            cod: "RVC-005",
            pret: 3499,
            pretRedus: 2799,
            imagini: ["https://i.pinimg.com/736x/a3/08/aa/a308aa8fcd88c9c35ad044a4d7de9386.jpg"],
            stoc: 12,
            subcategorie: {
              id: "sub5",
              nume: "Aspiratoare",
              categoriePrincipala: {
                id: "cat5",
                nume: "Electrocasnice"
              }
            }
          },
          {
            id: "6",
            nume: "Premium Coffee Machine",
            cod: "PCM-006",
            pret: 4999,
            pretRedus: 3999,
            imagini: ["https://i.pinimg.com/736x/a3/c8/81/a3c8810a3ea9090239dcbe5a4ccb5389.jpg"],
            stoc: 8,
            subcategorie: {
              id: "sub6",
              nume: "Aparate Cafea",
              categoriePrincipala: {
                id: "cat5",
                nume: "Electrocasnice"
              }
            }
          },
          {
            id: "7",
            nume: "Bluetooth Speaker System",
            cod: "BSS-007",
            pret: 2499,
            pretRedus: 1999,
            imagini: ["https://i.pinimg.com/736x/c1/b7/ce/c1b7ce97a1d7e5863c9b4cb7416b2b96.jpg"],
            stoc: 15,
            subcategorie: {
              id: "sub7",
              nume: "Boxe",
              categoriePrincipala: {
                id: "cat6",
                nume: "Audio"
              }
            }
          },
          {
            id: "8",
            nume: "Digital Camera 24MP",
            cod: "DC-008",
            pret: 5999,
            pretRedus: 4799,
            imagini: ["https://i.pinimg.com/736x/e7/5b/15/e75b15b3d020342f7b83da060b5cf5a4.jpg"],
            stoc: 7,
            subcategorie: {
              id: "sub8",
              nume: "Camere Foto",
              categoriePrincipala: {
                id: "cat7",
                nume: "Foto & Video"
              }
            }
          },
          {
            id: "9",
            nume: "Smart Doorbell Camera",
            cod: "SDC-009",
            pret: 1299,
            pretRedus: 999,
            imagini: ["https://i.pinimg.com/736x/e0/9c/25/e09c25b3614c1ee3f0f23cae700d5179.jpg"],
            stoc: 22,
            subcategorie: {
              id: "sub9",
              nume: "Smart Home",
              categoriePrincipala: {
                id: "cat8",
                nume: "Securitate"
              }
            }
          },
          {
            id: "10",
            nume: "Electric Scooter Pro",
            cod: "ESP-010",
            pret: 4999,
            pretRedus: 3999,
            imagini: ["https://i.pinimg.com/736x/65/99/35/6599358c98575a8a99a9a7c8143ecd3b.jpg"],
            stoc: 5,
            subcategorie: {
              id: "sub10",
              nume: "Transport",
              categoriePrincipala: {
                id: "cat9",
                nume: "Mobilitate"
              }
            }
          },
          {
            id: "11",
            nume: "Fitness Smartwatch",
            cod: "FS-011",
            pret: 1999,
            pretRedus: 1499,
            imagini: ["https://i.pinimg.com/736x/ff/5a/80/ff5a80cff5de3f0b23802f52409d3af0.jpg"],
            stoc: 25,
            subcategorie: {
              id: "sub11",
              nume: "Smartwatch-uri",
              categoriePrincipala: {
                id: "cat2",
                nume: "Accesorii"
              }
            }
          },
          {
            id: "12",
            nume: "Gaming Keyboard RGB",
            cod: "GK-012",
            pret: 899,
            pretRedus: 699,
            imagini: ["https://i.pinimg.com/736x/86/4a/df/864adf990c0eb5ae1064d75f96e007bf.jpg"],
            stoc: 30,
            subcategorie: {
              id: "sub12",
              nume: "Periferice",
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
