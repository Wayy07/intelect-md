"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu, Search, ShoppingCart, User, ChevronRight, LayoutGrid, LogIn, X, Phone, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CategoriePrincipala, Subcategorie, Produs } from "@prisma/client"
import { motion, AnimatePresence, PanInfo, useAnimationFrame, useMotionValue, useTransform } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { useRouter, usePathname } from "next/navigation"

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

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  // Desktop states
  const [isDesktopCatalogOpen, setIsDesktopCatalogOpen] = useState(false)
  const [isDesktopUserMenuOpen, setIsDesktopUserMenuOpen] = useState(false)
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
  const menuRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm) {
        setIsSearching(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
          if (!response.ok) throw new Error('Search failed')
          const data = await response.json()
          setSearchResults(data)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
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
        const response = await fetch("/api/catalog")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
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
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setIsDesktopCatalogOpen(false)
      }
    }

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []) // Empty dependency array since we don't need to re-add listeners

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
                  <span>+373 60 123 456</span>
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
                  onClick={() => {
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
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    className="w-full h-12 pl-12 pr-4 text-base rounded-full border border-input bg-accent/50 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            </div>

            {/* Right section - Cart and User */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="relative hover:bg-accent/80 h-12 px-4"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  0
                </span>
              </Button>
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setIsDesktopUserMenuOpen(!isDesktopUserMenuOpen)}
                >
                  <User className="h-6 w-6" />
                </Button>

                <AnimatePresence>
                  {isDesktopUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    >
                      <div className="p-4">
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
                          <Button className="w-full" variant="outline">
                            <div className="bg-white rounded-full p-1 mr-2">
                              <GoogleIcon className="h-5 w-5" />
                            </div>
                            <span>{t("signInWithGoogle")}</span>
                          </Button>
                        </div>
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
                className="absolute inset-x-0 top-full bg-white border-b shadow-lg backdrop-blur-sm bg-white/95 z-50"
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
                          <div className="space-y-4">
                            {categories
                              .find((cat) => cat.id === hoveredCategory)
                              ?.subcategorii.flatMap((sub) => sub.produse)
                              .slice(0, 2)
                              .map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/produs/${product.id}`}
                                  className="group relative flex gap-4 rounded-xl border bg-white p-3 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 hover:border-indigo-500/20"
                                >
                                  {/* Product Image */}
                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                                    {product.imagini && product.imagini.length > 0 ? (
                                      <Image
                                        src={product.imagini[0]}
                                        alt={product.nume}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                    {product.pretRedus && (
                                      <div className="absolute left-0 top-0">
                                        <span className="inline-flex items-center rounded-br-lg bg-indigo-500 px-1.5 py-0.5 text-xs font-medium text-white">
                                          -{Math.round(((product.pret - product.pretRedus) / product.pret) * 100)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                      {product.nume}
                                    </h4>
                                    <div className="flex flex-col">
                                      {product.pretRedus ? (
                                        <>
                                          <span className="text-xs text-muted-foreground line-through">
                                            {product.pret} MDL
                                          </span>
                                          <span className="font-medium text-sm text-indigo-500">
                                            {product.pretRedus} MDL
                                          </span>
                                        </>
                                      ) : (
                                        <span className="font-medium text-sm text-indigo-500">
                                          {product.pret} MDL
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
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
              <div className="grid grid-cols-5 gap-1">
                <button
                  onClick={() => router.push("/")}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                    pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}>
                    <LayoutGrid className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    Acasă
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
                  onClick={() => setShowMobileSearch(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                    showMobileSearch ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}>
                    <Search className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    showMobileSearch ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    Caută
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
                  </div>
                  <span className={cn(
                    "text-xs font-medium mt-1 transition-colors",
                    isCartOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    Coș
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
                    Cont
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
                    <h2 className="font-semibold text-lg">{t("catalog")}</h2>
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
                    <h2 className="font-semibold text-lg">Căutare</h2>
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="w-full h-11 pl-10 pr-4 text-base rounded-lg border border-input bg-accent/50 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
                      />
                    </div>
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
                            className="group relative flex gap-4 rounded-xl border bg-white p-3 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 hover:border-indigo-500/20"
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
                                  <span className="inline-flex items-center rounded-br-lg bg-indigo-500 px-1.5 py-0.5 text-xs font-medium text-white">
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
                                        <span className="block font-medium text-sm text-indigo-600">
                                          {product.pretRedus.toLocaleString()} MDL
                                        </span>
                                      </>
                                    ) : (
                                      <span className="block font-medium text-sm text-indigo-600">
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
                          Nu au fost găsite produse
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
                    <h2 className="font-semibold text-lg">Cont</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileUserMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{t("welcome")}</h3>
                        <p className="text-sm text-muted-foreground">{t("loginToContinue")}</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <div className="bg-white rounded-full p-1 mr-2">
                        <GoogleIcon className="h-5 w-5" />
                      </div>
                      {t("signInWithGoogle")}
                    </Button>
                    <div className="space-y-2">
                      <Link
                        href="/comenzi"
                        className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setIsMobileUserMenuOpen(false)}
                      >
                        <span>Comenzile mele</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <Link
                        href="/favorite"
                        className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setIsMobileUserMenuOpen(false)}
                      >
                        <span>Favorite</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </div>
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
                      <h2 className="text-lg font-semibold">Coșul meu</h2>
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                  </div>

                  {/* Empty cart state */}
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
                        Coșul tău este gol
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                        Se pare că nu ai adăugat încă niciun produs în coș. Începe să explorezi catalogul nostru!
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
                        Explorează catalogul
                      </Button>
                    </motion.div>
                  </div>

                  {/* Cart footer */}
                  <div className="border-t p-4 bg-white">
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div className="flex items-center justify-between text-base">
                        <span className="font-medium text-muted-foreground">Total</span>
                        <span className="font-semibold text-lg">0 MDL</span>
                      </div>
                      <Button
                        className="w-full h-12 rounded-xl"
                        disabled
                      >
                        Finalizează comanda
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
                    <span className="text-sm font-medium whitespace-nowrap">{text}</span>

                  </span>
                ))}
              </motion.div>
              <motion.div
                className="flex items-center gap-12 py-3 absolute left-0 right-0"
                style={{ x: useTransform(baseX, (value) => `${value + announcementWidth}px`) }}
              >
                {[...announcements, ...announcements, ...announcements].map((text, index) => (
                  <span key={`second-${index}`} className="inline-flex items-center gap-32 shrink-0">
                    <span className="text-sm font-medium whitespace-nowrap">{text}</span>

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
