"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu, Search, ShoppingCart, User, ChevronRight, LayoutGrid, LogIn, X, Phone, Clock, Package, Minus, Plus, Home, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, PanInfo, useAnimationFrame, useMotionValue, useTransform } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { useRouter, usePathname } from "next/navigation"
import { ProductCard } from "@/app/components/ui/product-card"
import { ProductCardCompact } from "@/app/components/ui/product-card"
import { useCart } from "@/app/contexts/cart-context"
import { signIn, signOut, useSession } from "next-auth/react"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "lucide-react"
import { PopoverContent } from "@/components/ui/popover"
import { useProtectedSession } from "@/lib/hooks/use-protected-session";

// Local interfaces to replace Prisma imports
interface CategoriePrincipala {
  id: string
  nume: string
  descriere?: string | null
  imagine?: string | null
  activ: boolean
}

interface Subcategorie {
  id: string
  nume: string
  descriere?: string | null
  imagine?: string | null
  categoriePrincipalaId: string
  activ: boolean
}

interface Produs {
  id: string
  cod: string
  nume: string
  descriere: string
  pret: number
  pretRedus?: number | null
  stoc: number
  imagini: string[]
  specificatii?: any
  subcategorieId: string
  activ: boolean
  stare: string
  culoare?: string | null
  dimensiuni?: any
  greutate?: number | null
  creditOption?: {
    months: number
    monthlyPayment: number
  } | null
}

interface CategoryWithSubcategories extends CategoriePrincipala {
  subcategorii: (Subcategorie & {
    produse: Produs[]
  })[]
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// Add Facebook icon component
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { totalItems, items, removeItem, updateQuantity, totalPrice } = useCart()
  const { data: session, status } = useProtectedSession();
  // Desktop states
  const [isDesktopCatalogOpen, setIsDesktopCatalogOpen] = useState(false)
  const [isDesktopUserMenuOpen, setIsDesktopUserMenuOpen] = useState(false)
  const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Produs[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const router = useRouter()
  const pathname = usePathname()

  // Announcement bar animation
  const baseVelocity = -0.5
  const baseX = useMotionValue(0)
  const announcements = [
    "0% Credit - Cumpără acum, plătește mai târziu",
    "Rate fără dobândă până la 36 de luni",
  ]

  const announcementWidth = 2000 // Increased width to prevent overlapping

  const wrap = (x: number) => {
    const rangeX = announcementWidth
    const x2 = x % rangeX
    return x2
  }

  useAnimationFrame((time, delta) => {
    let moveBy = baseVelocity * (delta / 16)
    baseX.set(wrap(baseX.get() + moveBy))
  })

  const x = useTransform(baseX, (value) => `${wrap(value)}px`)

  // Add refs for click outside detection
  const catalogRef = React.useRef<HTMLDivElement>(null)
  const userMenuRef = React.useRef<HTMLDivElement>(null)
  const cartMenuRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm) {
        setIsSearching(true)
        try {
          // Using mock data instead of API call
          // This is a placeholder that would be replaced with a custom API call
          setSearchResults([])
          setIsSearching(false)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Using mock data instead of API call
        // This would be replaced with a call to your custom API
        const mockCategories: CategoryWithSubcategories[] = [
          {
            id: "laptops",
            nume: "Laptopuri",
            descriere: "Computere portabile pentru orice necesitate",
            imagine: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
            activ: true,
            subcategorii: [
              {
                id: "notebooks",
                nume: "Notebook-uri",
                descriere: "Laptop-uri ușoare și portabile",
                imagine: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
                categoriePrincipalaId: "laptops",
                activ: true,
                produse: []
              },
              {
                id: "gaming",
                nume: "Gaming",
                descriere: "Laptop-uri pentru gaming de performanță",
                imagine: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6",
                categoriePrincipalaId: "laptops",
                activ: true,
                produse: []
              },
              {
                id: "ultrabooks",
                nume: "Ultrabook-uri",
                descriere: "Laptop-uri subțiri și puternice",
                imagine: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
                categoriePrincipalaId: "laptops",
                activ: true,
                produse: []
              },
              {
                id: "business",
                nume: "Business",
                descriere: "Laptop-uri pentru profesioniști",
                imagine: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
                categoriePrincipalaId: "laptops",
                activ: true,
                produse: []
              },
              {
                id: "apple",
                nume: "Apple MacBook",
                descriere: "Laptop-uri premium de la Apple",
                imagine: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9",
                categoriePrincipalaId: "laptops",
                activ: true,
                produse: []
              }
            ]
          },
          {
            id: "smartphones",
            nume: "Smartphone-uri",
            descriere: "Telefoane inteligente de ultimă generație",
            imagine: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
            activ: true,
            subcategorii: [
              {
                id: "iphone",
                nume: "iPhone",
                descriere: "Smartphone-uri Apple",
                imagine: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
                categoriePrincipalaId: "smartphones",
                activ: true,
                produse: []
              },
              {
                id: "samsung",
                nume: "Samsung",
                descriere: "Smartphone-uri Samsung Galaxy",
                imagine: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
                categoriePrincipalaId: "smartphones",
                activ: true,
                produse: []
              },
              {
                id: "xiaomi",
                nume: "Xiaomi",
                descriere: "Smartphone-uri Xiaomi",
                imagine: "https://images.unsplash.com/photo-1598327105854-2b820363a3a0",
                categoriePrincipalaId: "smartphones",
                activ: true,
                produse: []
              },
              {
                id: "huawei",
                nume: "Huawei",
                descriere: "Smartphone-uri Huawei",
                imagine: "https://images.unsplash.com/photo-1545659705-95518b325e1e",
                categoriePrincipalaId: "smartphones",
                activ: true,
                produse: []
              },
              {
                id: "budget",
                nume: "Buget",
                descriere: "Smartphone-uri accesibile",
                imagine: "https://images.unsplash.com/photo-1529653762956-b0a27278529c",
                categoriePrincipalaId: "smartphones",
                activ: true,
                produse: []
              },
            ]
          },
          {
            id: "tablets",
            nume: "Tablete",
            descriere: "Tablete pentru muncă și divertisment",
            imagine: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
            activ: true,
            subcategorii: [
              {
                id: "ipad",
                nume: "iPad",
                descriere: "Tablete Apple iPad",
                imagine: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
                categoriePrincipalaId: "tablets",
                activ: true,
                produse: []
              },
              {
                id: "android",
                nume: "Android",
                descriere: "Tablete cu Android",
                imagine: "https://images.unsplash.com/photo-1542751110-97427bbecf20",
                categoriePrincipalaId: "tablets",
                activ: true,
                produse: []
              },
              {
                id: "windows",
                nume: "Windows",
                descriere: "Tablete cu Windows",
                imagine: "https://images.unsplash.com/photo-1543069190-f687e00648b2",
                categoriePrincipalaId: "tablets",
                activ: true,
                produse: []
              }
            ]
          },
          {
            id: "tvs",
            nume: "Televizoare",
            descriere: "Televizoare Smart și Ultra HD",
            imagine: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
            activ: true,
            subcategorii: [
              {
                id: "smart",
                nume: "Smart TV",
                descriere: "Televizoare inteligente",
                imagine: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
                categoriePrincipalaId: "tvs",
                activ: true,
                produse: []
              },
              {
                id: "4k",
                nume: "4K Ultra HD",
                descriere: "Televizoare cu rezoluție 4K",
                imagine: "https://images.unsplash.com/photo-1509281373149-e957c6296406",
                categoriePrincipalaId: "tvs",
                activ: true,
                produse: []
              },
              {
                id: "oled",
                nume: "OLED",
                descriere: "Televizoare cu tehnologie OLED",
                imagine: "https://images.unsplash.com/photo-1572314493295-09c6d5ec3cdf",
                categoriePrincipalaId: "tvs",
                activ: true,
                produse: []
              },
              {
                id: "qled",
                nume: "QLED",
                descriere: "Televizoare cu tehnologie QLED",
                imagine: "https://images.unsplash.com/photo-1498810568083-2ed9a70f96ea",
                categoriePrincipalaId: "tvs",
                activ: true,
                produse: []
              }
            ]
          },
          {
            id: "headphones",
            nume: "Căști",
            descriere: "Căști wireless și cu fir",
            imagine: "https://images.unsplash.com/photo-1545127398-14699f92334b",
            activ: true,
            subcategorii: [
              {
                id: "wireless",
                nume: "Wireless",
                descriere: "Căști wireless",
                imagine: "https://images.unsplash.com/photo-1545127398-14699f92334b",
                categoriePrincipalaId: "headphones",
                activ: true,
                produse: []
              },
              {
                id: "earbuds",
                nume: "Earbuds",
                descriere: "Căști in-ear",
                imagine: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
                categoriePrincipalaId: "headphones",
                activ: true,
                produse: []
              },
              {
                id: "gaming-headsets",
                nume: "Gaming",
                descriere: "Căști pentru gaming",
                imagine: "https://images.unsplash.com/photo-1612444530582-fc66183b16f7",
                categoriePrincipalaId: "headphones",
                activ: true,
                produse: []
              },
              {
                id: "noise-cancelling",
                nume: "Anulare zgomot",
                descriere: "Căști cu anulare de zgomot",
                imagine: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                categoriePrincipalaId: "headphones",
                activ: true,
                produse: []
              }
            ]
          },
          {
            id: "smartwatches",
            nume: "Smartwatch-uri",
            descriere: "Ceasuri inteligente",
            imagine: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
            activ: true,
            subcategorii: [
              {
                id: "apple-watch",
                nume: "Apple Watch",
                descriere: "Smartwatch-uri de la Apple",
                imagine: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
                categoriePrincipalaId: "smartwatches",
                activ: true,
                produse: []
              },
              {
                id: "samsung-watch",
                nume: "Samsung Watch",
                descriere: "Smartwatch-uri de la Samsung",
                imagine: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
                categoriePrincipalaId: "smartwatches",
                activ: true,
                produse: []
              },
              {
                id: "fitness",
                nume: "Fitness",
                descriere: "Smartwatch-uri pentru fitness",
                imagine: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288",
                categoriePrincipalaId: "smartwatches",
                activ: true,
                produse: []
              }
            ]
          },
          {
            id: "consoles",
            nume: "Console",
            descriere: "Console de jocuri video",
            imagine: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42",
            activ: true,
            subcategorii: [
              {
                id: "playstation",
                nume: "PlayStation",
                descriere: "Console PlayStation",
                imagine: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42",
                categoriePrincipalaId: "consoles",
                activ: true,
                produse: []
              },
              {
                id: "xbox",
                nume: "Xbox",
                descriere: "Console Xbox",
                imagine: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d",
                categoriePrincipalaId: "consoles",
                activ: true,
                produse: []
              },
              {
                id: "nintendo",
                nume: "Nintendo",
                descriere: "Console Nintendo",
                imagine: "https://images.unsplash.com/photo-1587815073078-f636169821e3",
                categoriePrincipalaId: "consoles",
                activ: true,
                produse: []
              },
              {
                id: "accessories",
                nume: "Accesorii",
                descriere: "Accesorii pentru console",
                imagine: "https://images.unsplash.com/photo-1592840496694-26d035b52b48",
                categoriePrincipalaId: "consoles",
                activ: true,
                produse: []
              }
            ]
          },
          {
            id: "vacuums",
            nume: "Aspiratoare",
            descriere: "Aspiratoare și roboți de curățare",
            imagine: "https://images.unsplash.com/photo-1558317374-067fb5f30001",
            activ: true,
            subcategorii: [
              {
                id: "robot",
                nume: "Roboți",
                descriere: "Aspiratoare robot",
                imagine: "https://images.unsplash.com/photo-1558317374-067fb5f30001",
                categoriePrincipalaId: "vacuums",
                activ: true,
                produse: []
              },
              {
                id: "handheld",
                nume: "Portabile",
                descriere: "Aspiratoare portabile",
                imagine: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac",
                categoriePrincipalaId: "vacuums",
                activ: true,
                produse: []
              },
              {
                id: "upright",
                nume: "Verticale",
                descriere: "Aspiratoare verticale",
                imagine: "https://images.unsplash.com/photo-1563453392212-326f5e854473",
                categoriePrincipalaId: "vacuums",
                activ: true,
                produse: []
              }
            ]
          }
        ];

        setCategories(mockCategories);

        // Add some mock products for the "Popular products" section in the catalog menu
        const popularProducts: Produs[] = [
          {
            id: "prod1",
            cod: "LPT-001",
            nume: "MacBook Air M2",
            descriere: "Laptop ultraportabil Apple cu cip M2",
            pret: 19999,
            pretRedus: 18499,
            stoc: 15,
            imagini: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=452&hei=420&fmt=jpeg&qlt=95&.v=1653084303665"],
            specificatii: {},
            subcategorieId: "notebooks",
            activ: true,
            stare: "nou",
          },
          {
            id: "prod2",
            cod: "SPH-001",
            nume: "iPhone 15 Pro",
            descriere: "Smartphone Apple iPhone 15 Pro",
            pret: 23999,
            pretRedus: null,
            stoc: 10,
            imagini: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-blue-titanium-select?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1692979276096"],
            specificatii: {},
            subcategorieId: "iphone",
            activ: true,
            stare: "nou",
          },
          {
            id: "prod3",
            cod: "AUD-001",
            nume: "AirPods Pro 2",
            descriere: "Căști wireless Apple cu anulare activă a zgomotului",
            pret: 4999,
            pretRedus: 4499,
            stoc: 25,
            imagini: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361"],
            specificatii: {},
            subcategorieId: "wireless",
            activ: true,
            stare: "nou"
          },
          {
            id: "prod4",
            cod: "TV-001",
            nume: "Samsung QLED 65",
            descriere: "Televizor Samsung QLED 4K Ultra HD",
            pret: 15999,
            pretRedus: 13999,
            stoc: 8,
            imagini: ["https://images.samsung.com/is/image/samsung/p6pim/ro/qe65q70cauxru/gallery/ro-qled-q70c-qe65q70cauxru-536899301?$650_519_PNG$"],
            specificatii: {},
            subcategorieId: "qled",
            activ: true,
            stare: "nou",
          }
        ];

        // Update categories to include popular products in the first category's subcategories
        const updatedCategories = [...mockCategories];
        if (updatedCategories.length > 0 && updatedCategories[0].subcategorii.length > 0) {
          updatedCategories[0].subcategorii[0].produse = popularProducts;
        }

        setCategories(updatedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Add useEffect for click outside detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsDesktopUserMenuOpen(false)
      }

      // Close cart menu if click is outside
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target as Node)) {
        setIsDesktopCartOpen(false)
      }

      // Only close catalog if click is outside both the menu content AND the catalog button
      if (catalogRef.current) {
        const catalogButton = catalogRef.current.querySelector('button')
        const menuContent = document.querySelector('.desktop-catalog-menu')
        const isClickInsideMenu = menuContent?.contains(event.target as Node)
        const isClickOnButton = catalogButton?.contains(event.target as Node)

        if (!isClickInsideMenu && !isClickOnButton && !catalogRef.current.contains(event.target as Node)) {
          setIsDesktopCatalogOpen(false)
        }
      }
    }

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDragEnd = (info: PanInfo, menuType: "catalog" | "user" | "menu") => {
    const threshold = 50 // minimum distance to trigger close
    if (info.offset.y > threshold) {
      switch (menuType) {
        case "catalog":
          setIsDesktopCatalogOpen(false)
          break
        case "user":
          setIsDesktopUserMenuOpen(false)
          break
        case "menu":
          setActiveMobileCategory(null)
          break
      }
    }
  }

  // Cart menu state
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Handle sign in with Google
  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  // Handle sign in with Facebook
  const handleFacebookSignIn = async () => {
    await signIn("facebook", { callbackUrl: "/" })
  }

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto">
          {/* Top bar */}
          <div className="hidden md:block border-b">
            <div className="flex h-10 items-center justify-between text-sm">
              {/* Left section - Contact and Hours */}
              <div className="flex items-center gap-6">
                <a href="tel:+37360123456" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  <span>+373 601 75 111</span>
                </a>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{t("workingHours")}</span>
                </div>
              </div>

              {/* Right section - Links and Language */}
              <div className="flex items-center gap-6">
                <nav className="flex items-center gap-4">
                  <Link
                    href="/credit"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("credit")}
                  </Link>
                  <Link
                    href="/livrare"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("delivery")}
                  </Link>
                </nav>
                <div className="flex items-center gap-2 border-l pl-4">
                  <button
                    className={cn(
                      "text-sm transition-colors",
                      language === "ro" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setLanguage("ro")}
                  >
                    RO
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <button
                    className={cn(
                      "text-sm transition-colors",
                      language === "ru" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setLanguage("ru")}
                  >
                    RU
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main header */}
          <div className="relative hidden md:flex h-20 items-center justify-between gap-4 pt-4 pb-2">
            {/* Left section - Logo and Catalog */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden">
                  <Image
                    src="/logo.jpg"
                    alt="Intelect MD"
                    fill
                    className="object-contain p-1 rounded-full"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Intelect MD
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t("techStore")}
                  </p>
                </div>
              </Link>
              <div className="hidden md:flex items-center" ref={catalogRef}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 px-5 py-6 h-12 text-base transition-all duration-200 rounded-lg hover:bg-accent/80",
                    isDesktopCatalogOpen ? "bg-accent text-accent-foreground shadow-sm" : "hover:shadow-sm"
                  )}
                  onClick={(e) => {
                    e.stopPropagation() // Prevent event from bubbling
                    setIsDesktopCatalogOpen(!isDesktopCatalogOpen)
                    if (!isDesktopCatalogOpen) {
                      setHoveredCategory(categories[0]?.id || null)
                    }
                  }}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="font-medium">{t("catalog")}</span>
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isDesktopCatalogOpen && "rotate-180"
                  )} />
                </Button>
              </div>
            </div>

            {/* Center section - Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative w-full">
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                      // Redirect to catalog page with search query
                      const params = new URLSearchParams();
                      params.set('q', searchTerm);

                      // If already on catalog page, use replace to update URL without navigation
                      if (pathname === '/catalog') {
                        router.replace(`/catalog?${params.toString()}`, {
                          scroll: false // Prevent scrolling to top
                        });
                      } else {
                        // Otherwise navigate to catalog
                        router.push(`/catalog?${params.toString()}`);
                      }
                    }
                  }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    className="w-full h-12 pl-12 pr-4 text-base rounded-full border border-input bg-accent/50 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary h-7 w-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    aria-label="Search"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right section - Cart and User */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/contact" className="px-3">
                <Button variant="ghost" className="text-base">
                  {t("contact")}
                </Button>
              </Link>

              <div className="relative" ref={cartMenuRef}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="relative hover:bg-accent/80 h-12 px-4"
                  onClick={() => setIsDesktopCartOpen(!isDesktopCartOpen)}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </Button>

                {/* Desktop Cart Dropdown */}
                <AnimatePresence>
                  {isDesktopCartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-96 rounded-xl bg-white shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{t("myCart")}</h3>
                          {totalItems > 0 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {totalItems}
                            </span>
                          )}
                        </div>
                      </div>

                      {items.length === 0 ? (
                        <div className="p-6 text-center">
                          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-accent text-muted-foreground mb-4">
                            <ShoppingCart className="h-8 w-8" />
                          </div>
                          <h4 className="font-medium mb-2">{t("cartEmpty")}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t("addProductsFromCatalog")}
                          </p>
                          <Button
                            variant="outline"
                            className="text-sm h-9"
                            onClick={() => {
                              setIsDesktopCartOpen(false)
                              setIsDesktopCatalogOpen(true)
                            }}
                          >
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            {t("exploreCatalog")}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-96 overflow-y-auto p-4">
                            <div className="space-y-3">
                              {items.map((item) => (
                                <div
                                  key={item.product.id}
                                  className="flex gap-3 p-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                                >
                                  <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-accent/50">
                                    {item.product.imagini[0] && (
                                      <Image
                                        src={item.product.imagini[0]}
                                        alt={item.product.nume}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 768px"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">
                                      {item.product.nume}
                                    </h4>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {t("productCode")}{item.product.cod}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <div className="text-sm font-medium">
                                        {(item.product.pretRedus || item.product.pret).toLocaleString()} MDL
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6 rounded-md"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            updateQuantity(item.product.id, item.quantity - 1)
                                          }}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm w-6 text-center">
                                          {item.quantity}
                                        </span>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6 rounded-md"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            updateQuantity(item.product.id, item.quantity + 1)
                                          }}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        {((item.product.pretRedus || item.product.pret) * item.quantity).toLocaleString()} MDL
                                      </div>
                                      {item.product.pretRedus && (
                                        <div className="text-sm text-muted-foreground line-through">
                                          {(item.product.pret * item.quantity).toLocaleString()} MDL
                                        </div>
                                      )}
                                      {item.product.creditOption && (
                                        <div className="text-sm text-primary mt-1">
                                          {item.product.creditOption.months} rate x {item.product.creditOption.monthlyPayment.toLocaleString()} MDL/lună
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 flex-shrink-0 self-start text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeItem(item.product.id)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 border-t bg-white">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-medium text-muted-foreground">Total</span>
                              <span className="font-semibold">{totalPrice.toLocaleString()} MDL</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 text-sm"
                                onClick={() => {
                                  setIsDesktopCartOpen(false)
                                  window.location.href = "/cart"
                                }}
                              >
                                {t("completeOrder")}
                              </Button>
                              <Button
                                className="flex-1 text-sm"
                                onClick={() => {
                                  setIsDesktopCartOpen(false)
                                  window.location.href = "/checkout"
                                }}
                              >
                                {t("checkout")}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setIsDesktopUserMenuOpen(!isDesktopUserMenuOpen)}
                >
                  {status === "authenticated" && session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </Button>

                <AnimatePresence>
                  {isDesktopUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 desktop-catalog-menu"
                    >
                      <div className="p-4">
                        {status === "authenticated" ? (
                          <div>
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center">
                                {session.user?.image ? (
                                  <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm text-black font-medium">
                                  {session.user?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {session.user?.email}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <Link
                                href="/comenzi"
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors w-full"
                                onClick={() => setIsDesktopUserMenuOpen(false)}
                              >
                                <span>{t("myOrders")}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                              <Link
                                href="/favorite"
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors w-full"
                                onClick={() => setIsDesktopUserMenuOpen(false)}
                              >
                                <span>{t("favorites")}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                              <Link
                                href="/credit"
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors w-full"
                                onClick={() => setIsDesktopUserMenuOpen(false)}
                              >
                                <span>{t("buyInInstallments")}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                            </div>

                            <div className="mt-4">
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleSignOut}
                              >
                                {t("signOut")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm text-black font-medium">
                                  {t("welcome")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("loginToContinue")}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleGoogleSignIn}
                              >
                                <div className="bg-white rounded-full p-1 mr-2">
                                  <GoogleIcon className="h-5 w-5" />
                                </div>
                                <span>{t("signInWithGoogle")}</span>
                              </Button>
                              <Button
                                className="w-full mt-2"
                                variant="outline"
                                onClick={handleFacebookSignIn}
                              >
                                <div className="bg-white rounded-full p-1 mr-2">
                                  <FacebookIcon className="h-5 w-5" />
                                </div>
                                {t("signInWithFacebook")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Desktop mega menu */}
          <AnimatePresence>
            {isDesktopCatalogOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full bg-white border-b shadow-lg backdrop-blur-sm bg-white/95 z-50 desktop-catalog-menu"
              >
                <div className="container mx-auto py-8">
                  <div className="grid grid-cols-[280px,1fr,400px] divide-x divide-gray-100">
                    {/* Categories list */}
                    <div className="pr-8">
                      <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4 px-4">
                        {t("catalog")}
                      </h3>
                      <ul className="space-y-1.5">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <button
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                hoveredCategory === category.id
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                              )}
                              onMouseEnter={() => setHoveredCategory(category.id)}
                            >
                              <span>{category.nume}</span>
                              <ChevronRight className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                hoveredCategory === category.id && "translate-x-0.5"
                              )} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Subcategories */}
                    <div className="px-8">
                      {hoveredCategory && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                              {t("subcategories")}
                            </h3>
                            <Link
                              href={`/catalog/${hoveredCategory}`}
                              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                              onClick={() => setIsDesktopCatalogOpen(false)}
                            >
                              Vezi toate
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 pr-4">
                            {categories
                              .find((cat) => cat.id === hoveredCategory)
                              ?.subcategorii.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  href={`/catalog/${hoveredCategory}/${subcategory.id}`}
                                  className="group flex items-center gap-3 rounded-xl py-3 transition-all duration-200 hover:translate-x-1"
                                  onClick={() => setIsDesktopCatalogOpen(false)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-base truncate group-hover:text-primary transition-colors">
                                      {subcategory.nume}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Popular products */}
                    <div className="pl-8">
                      {hoveredCategory && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4">
                            {t("popularProducts")}
                          </h3>
                          <div className="space-y-2">
                            {categories
                              .find((cat) => cat.id === hoveredCategory)
                              ?.subcategorii.flatMap((sub) =>
                                sub.produse.map(product => ({
                                  ...product,
                                  subcategorie: {
                                    ...sub,
                                    categoriePrincipala: categories.find(c => c.id === hoveredCategory)!
                                  }
                                }))
                              )
                              .slice(0, 2)
                              .map((product) => (
                                <ProductCardCompact
                                  key={product.id}
                                  product={product}
                                  onAddToFavorites={(product) => {
                                    // TODO: Implement favorites functionality
                                    console.log("Add to favorites:", product)
                                  }}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile bottom navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-t border-gray-100 md:hidden">
            <div className="container mx-auto px-2 pb-safe">
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => router.push("/")}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                    pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}>
                    <Home className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {t("home")}
                  </span>
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                    isMobileMenuOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}>
                    <Menu className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    isMobileMenuOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {t("catalog")}
                  </span>
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                    isCartOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}>
                    <ShoppingCart className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    isCartOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {t("cart")}
                  </span>
                </button>

                <button
                  onClick={() => setIsMobileUserMenuOpen(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                    isMobileUserMenuOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}>
                    <User className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    isMobileUserMenuOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {t("account")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <motion.div
                  ref={menuRef}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => handleDragEnd(info, "menu")}
                  className="fixed inset-x-0 bottom-0 h-[85vh] bg-white shadow-xl z-50 md:hidden flex flex-col overflow-hidden rounded-t-2xl"
                >
                  {/* Menu header */}
                  <div className="flex items-center justify-between px-4 h-16 border-b">
                    <h2 className="font-semibold text-2xl">{t("catalog")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Menu content */}
                  <div className="flex-1 overflow-y-auto">
                    {activeMobileCategory ? (
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="h-full"
                      >
                        {/* Back button */}
                        <button
                          className="flex items-center gap-2 p-4 w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setActiveMobileCategory(null)}
                        >
                          <ChevronDown className="h-4 w-4 rotate-90" />
                          {t("back")}
                        </button>

                        {/* Category header */}
                        <div className="px-4 pb-4">
                          <h3 className="font-semibold text-lg">
                            {categories.find(cat => cat.id === activeMobileCategory)?.nume}
                          </h3>
                        </div>

                        {/* Subcategories grid */}
                        <div className="grid grid-cols-2 gap-4 px-4 pb-20">
                          {categories
                            .find(cat => cat.id === activeMobileCategory)
                            ?.subcategorii.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/catalog/${activeMobileCategory}/${subcategory.id}`}
                                className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white border shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                                  {subcategory.imagine ? (
                                    <Image
                                      src={subcategory.imagine}
                                      alt={subcategory.nume}
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                                      priority
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>
                                <div className="flex items-center justify-between p-4">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                      {subcategory.nume}
                                    </h4>
                                    <p className="mt-1 text-xs text-muted-foreground truncate">
                                      {subcategory.produse?.length || 0} produse
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                                      <ChevronRight className="h-4 w-4" />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full"
                      >
                        {/* Main categories list */}
                        <div className="divide-y">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              className="flex w-full items-center justify-between px-4 py-4 text-base hover:bg-accent/50 transition-colors"
                              onClick={() => setActiveMobileCategory(category.id)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{category.nume}</span>
                                <span className="text-xs text-muted-foreground">
                                  {category.subcategorii.length} subcategorii
                                </span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </button>
                          ))}
                        </div>

                        {/* Quick links */}
                        <div className="border-t px-4 py-6 space-y-2">
                          <Link
                            href="/credit"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>{t("credit")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/livrare"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>{t("delivery")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>{t("contact")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </div>

                        {/* Language switcher */}
                        <div className="border-t px-4 py-6">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              className={cn(
                                "text-sm transition-colors px-3 py-1 rounded-md",
                                language === "ro"
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() => setLanguage("ro")}
                            >
                              Română
                            </button>
                            <button
                              className={cn(
                                "text-sm transition-colors px-3 py-1 rounded-md",
                                language === "ru"
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() => setLanguage("ru")}
                            >
                              Русский
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile search overlay */}
          <AnimatePresence>
            {showMobileSearch && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setShowMobileSearch(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 50) {
                      setShowMobileSearch(false)
                    }
                  }}
                  className="fixed inset-x-0 bottom-0 h-[85vh] bg-white shadow-xl z-50 md:hidden flex flex-col overflow-hidden rounded-t-2xl"
                >
                  {/* Search header */}
                  <div className="flex items-center justify-between px-4 h-16 border-b">
                    <h2 className="font-semibold text-lg">{t("search")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobileSearch(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Search input */}
                  <div className="p-4 border-b">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchTerm.trim()) {
                          // Redirect to catalog page with search query
                          const params = new URLSearchParams();
                          params.set('q', searchTerm);

                          // Hide the mobile search panel first
                          setShowMobileSearch(false);

                          // If already on catalog page, use replace to update URL without navigation
                          if (pathname === '/catalog') {
                            router.replace(`/catalog?${params.toString()}`, {
                              scroll: false // Prevent scrolling to top
                            });
                          } else {
                            // Otherwise navigate to catalog
                            router.push(`/catalog?${params.toString()}`);
                          }
                        }
                      }}
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={t("searchPlaceholder")}
                          className="w-full h-11 pl-10 pr-12 text-base rounded-lg border border-input bg-accent/50 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
                        />
                        <button
                          type="submit"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary h-7 w-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                          aria-label="Search"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Search results */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/produs/${product.id}`}
                            className="group relative flex gap-4 rounded-xl border bg-white p-3 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20"
                            onClick={() => setShowMobileSearch(false)}
                          >
                            {/* Product Image */}
                            <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {product.imagini && product.imagini.length > 0 ? (
                                <Image
                                  src={product.imagini[0]}
                                  alt={product.nume || ''}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  priority
                                  unoptimized
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              {product.pretRedus && product.pret && (
                                <div className="absolute left-0 top-0">
                                  <span className="inline-flex items-center rounded-br-lg bg-primary px-1.5 py-0.5 text-xs font-medium text-white">
                                    -{Math.round(((product.pret - product.pretRedus) / product.pret) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Product Info */}
                            <div className="flex flex-1 flex-col justify-between min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
                                {product.nume}
                              </h4>
                              <div className="mt-1">
                                {product.pret && (
                                  <>
                                    {product.pretRedus ? (
                                      <>
                                        <span className="block text-xs text-gray-500 line-through">
                                          {product.pret.toLocaleString()} MDL
                                        </span>
                                        <span className="block font-medium text-sm text-primary">
                                          {product.pretRedus.toLocaleString()} MDL
                                        </span>
                                      </>
                                    ) : (
                                      <span className="block font-medium text-sm text-primary">
                                        {product.pret.toLocaleString()} MDL
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : searchTerm ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("noProductsFound")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* User menu panel */}
          <AnimatePresence>
            {isMobileUserMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsMobileUserMenuOpen(false)}
                />
                <motion.div
                  ref={userMenuRef}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 50) {
                      setIsMobileUserMenuOpen(false)
                    }
                  }}
                  className="fixed inset-x-0 bottom-0 z-50 h-[50vh] rounded-t-xl bg-background pb-safe"
                >
                  {/* User menu header */}
                  <div className="flex items-center justify-between px-4 h-16 border-b ">
                    <h2 className="font-semibold text-lg">{t("account")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileUserMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-6">
                    {status === "authenticated" ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center overflow-hidden">
                            {session.user?.image ? (
                              <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">{session.user?.name}</h3>
                            <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Link
                            href="/comenzi"
                            className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                          >
                            <span>{t("myOrders")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/favorite"
                            className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                          >
                            <span>{t("favorites")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/credit"
                            className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                          >
                            <span>{t("buyInInstallments")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </div>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleSignOut}
                        >
                          {t("signOut")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">{t("welcome")}</h3>
                            <p className="text-sm text-muted-foreground">{t("loginToContinue")}</p>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleGoogleSignIn}
                        >
                          <div className="bg-white rounded-full p-1 mr-2">
                            <GoogleIcon className="h-5 w-5" />
                          </div>
                          {t("signInWithGoogle")}
                        </Button>
                        <Button
                          className="w-full mt-2"
                          variant="outline"
                          onClick={handleFacebookSignIn}
                        >
                          <div className="bg-white rounded-full p-1 mr-2">
                            <FacebookIcon className="h-5 w-5" />
                          </div>
                          {t("signInWithFacebook")}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Cart menu panel */}
          <AnimatePresence>
            {isCartOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsCartOpen(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 50) {
                      setIsCartOpen(false)
                    }
                  }}
                  className="fixed inset-x-0 bottom-0 h-[85vh] bg-white shadow-xl z-50 md:hidden flex flex-col overflow-hidden rounded-t-2xl"
                >
                  {/* Drag handle */}
                  <div className="w-full pt-3 pb-2 px-4">
                    <div className="h-1 w-12 mx-auto rounded-full bg-gray-300/80" />
                  </div>

                  {/* Cart header */}
                  <div className="flex items-center justify-between h-14 px-4 border-b">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-accent"
                      onClick={() => setIsCartOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{t("myCart")}</h2>
                      {totalItems > 0 && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {totalItems}
                        </span>
                      )}
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                  </div>

                  {items.length === 0 ? (
                    // Empty cart state
                    <div className="flex-1 flex flex-col items-center justify-center px-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-accent text-muted-foreground mb-6">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center space-y-2 mb-8"
                      >
                        <h3 className="text-xl font-semibold">
                          {t("cartEmpty")}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                          {t("addProductsFromCatalog")}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-sm"
                      >
                        <Button
                          onClick={() => {
                            setIsCartOpen(false)
                            setIsMobileMenuOpen(true)
                          }}
                          className="w-full h-12 rounded-xl"
                        >
                          <LayoutGrid className="h-5 w-5 mr-2" />
                          {t("exploreCatalog")}
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    // Cart with items
                    <div className="flex-1 overflow-auto p-4">
                      <div className="space-y-4">
                        {items.map((item) => (
                          <motion.div
                            key={item.product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                          >
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-accent/50">
                              {item.product.imagini[0] && (
                                <Image
                                  src={item.product.imagini[0]}
                                  alt={item.product.nume}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 768px"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {item.product.nume}
                              </h4>
                              <div className="text-xs text-muted-foreground mt-1">
                                {t("productCode")}{item.product.cod}
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-sm font-medium">
                                  {(item.product.pretRedus || item.product.pret).toLocaleString()} MDL
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateQuantity(item.product.id, item.quantity - 1)
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm w-6 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateQuantity(item.product.id, item.quantity + 1)
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {((item.product.pretRedus || item.product.pret) * item.quantity).toLocaleString()} MDL
                                </div>
                                {item.product.pretRedus && (
                                  <div className="text-sm text-muted-foreground line-through">
                                    {(item.product.pret * item.quantity).toLocaleString()} MDL
                                  </div>
                                )}
                                {item.product.creditOption && (
                                  <div className="text-sm text-primary mt-1">
                                    {item.product.creditOption.months} rate x {item.product.creditOption.monthlyPayment.toLocaleString()} MDL/lună
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 flex-shrink-0 self-start text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeItem(item.product.id)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cart footer */}
                  <div className="border-t p-4 bg-white">
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div className="flex items-center justify-between text-base">
                        <span className="font-medium text-muted-foreground">Total</span>
                        <span className="font-semibold text-lg">{totalPrice.toLocaleString()} MDL</span>
                      </div>
                      <Button
                        className="w-full h-12 rounded-xl"
                        disabled={items.length === 0}
                        onClick={() => window.location.href = "/cart"}
                      >
                        {t("completeOrder")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Credit announcement bar - Full width background with contained text */}
      <div className=" lg:block bg-black text-white overflow-hidden whitespace-nowrap border-t border-white/10">
        <div className="container mx-auto relative">
          <div className="relative h-12 overflow-hidden">
            <div className="absolute inset-0">
              <motion.div
                className="flex items-center gap-12 py-3 absolute left-0 right-0"
                style={{ x }}
              >
                {[...announcements, ...announcements, ...announcements].map((text, index) => (
                  <span key={index} className="inline-flex items-center gap-24 shrink-0">
                    <span className="text-sm font-medium whitespace-nowrap">{t(text === "0% Credit - Cumpără acum, plătește mai târziu" ? "zeroCreditBuyNow" : "installmentsUpTo")}</span>
                  </span>
                ))}
              </motion.div>
              <motion.div
                className="flex items-center gap-12 py-3 absolute left-0 right-0"
                style={{ x: useTransform(baseX, (value) => `${value + announcementWidth}px`) }}
              >
                {[...announcements, ...announcements, ...announcements].map((text, index) => (
                  <span key={`second-${index}`} className="inline-flex items-center gap-32 shrink-0">
                    <span className="text-sm font-medium whitespace-nowrap">{t(text === "0% Credit - Cumpără acum, plătește mai târziu" ? "zeroCreditBuyNow" : "installmentsUpTo")}</span>
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
