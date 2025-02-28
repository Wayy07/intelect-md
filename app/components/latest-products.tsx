"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimationFrame, useMotionValue, useTransform, animate } from "framer-motion"
import { ProductCard, ProductCardCompact } from "@/app/components/ui/product-card"
import { useToast } from "@/app/components/ui/use-toast"
import { Toaster } from "@/app/components/ui/toaster"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

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

export default function LatestProducts() {
  // Add style tag for CSS
  useEffect(() => {
    // Add CSS for hiding scrollbars
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .hide-scrollbar {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
      }

      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [activeSlide, setActiveSlide] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const carouselRef = useRef<HTMLDivElement>(null)

  // For the smooth infinite animation
  const baseVelocity = -0.5
  const baseX = useMotionValue(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isManualNavigating, setIsManualNavigating] = useState(false)
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch("/api/products/latest")
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching latest products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestProducts()

    // Clean up the timer when component unmounts
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current)
      }
    }
  }, [])

  // Calculate total width of carousel items for infinite scroll
  const itemWidth = 300; // approx width of each product card with gap
  const totalWidth = products.length * itemWidth;

  const wrap = (x: number) => {
    const rangeX = totalWidth
    return x % rangeX
  }

  // Auto-scroll animation
  useAnimationFrame((time, delta) => {
    if (!isAutoScrolling || isHovered || products.length === 0 || isManualNavigating) return;

    let moveBy = baseVelocity * (delta / 16)
    baseX.set(wrap(baseX.get() + moveBy))
  })

  const x = useTransform(baseX, (value) => `${wrap(value)}px`)

  // Helper to resume auto-scroll after a delay
  const resumeAutoScrollAfterDelay = () => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current)
    }

    autoScrollTimerRef.current = setTimeout(() => {
      setIsAutoScrolling(true)
      setIsManualNavigating(false)
    }, 5000) // Resume auto-scroll after 5 seconds of inactivity
  }

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", product)
    toast({
      title: "Adăugat în coș",
      description: "Produsul a fost adăugat în coșul tău",
    })
  }

  const handleAddToFavorites = (product: Product) => {
    // TODO: Implement favorites functionality
    console.log("Add to favorites:", product)
    toast({
      title: "Adăugat la favorite",
      description: "Produsul a fost adăugat în lista ta de favorite",
    })
  }

  // Manual navigation
  const handleNextSlide = () => {
    setIsAutoScrolling(false)
    setIsManualNavigating(true)

    // Calculate the target position for smooth animation
    const newPosition = baseX.get() - itemWidth * 4

    // Animate to the new position
    baseX.set(baseX.get()) // Set current position explicitly

    // Use animate function for smooth transition
    const controls = animate(baseX, newPosition, {
      type: "spring",
      stiffness: 150,
      damping: 25,
      onComplete: () => {
        setActiveSlide((prev) => (prev + 4) % products.length)
        resumeAutoScrollAfterDelay()
      }
    })

    return () => controls.stop()
  }

  const handlePrevSlide = () => {
    setIsAutoScrolling(false)
    setIsManualNavigating(true)

    // Calculate the target position for smooth animation
    const newPosition = baseX.get() + itemWidth * 4

    // Animate to the new position
    baseX.set(baseX.get()) // Set current position explicitly

    // Use animate function for smooth transition
    const controls = animate(baseX, newPosition, {
      type: "spring",
      stiffness: 150,
      damping: 25,
      onComplete: () => {
        setActiveSlide((prev) => (prev - 4 + products.length) % products.length)
        resumeAutoScrollAfterDelay()
      }
    })

    return () => controls.stop()
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  // Duplicate products for infinite scroll effect
  const extendedProducts = [...products, ...products, ...products]

  return (
    <>
      <section className="container mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8 hidden md:flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Produse Noi
            </h2>
            <p className="mt-2 text-muted-foreground">
              Descoperă cele mai recente produse adăugate în magazin
            </p>
          </div>

          {/* Desktop navigation controls */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handlePrevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleNextSlide}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop carousel */}
        <div
          className="hidden md:block relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={carouselRef}
            className="relative"
          >
            <motion.div
              className="flex"
              style={{ x }}
            >
              {extendedProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="min-w-[300px] px-3">
                  <ProductCard
                    product={product}
                    onAddToFavorites={handleAddToFavorites}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile carousel - New Design */}
        <div className="md:hidden relative -mx-4 mt-8">
          <div className="relative overflow-hidden py-12">
            {/* Rich background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

            {/* Subtle noise texture */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                backgroundSize: "200px",
                mixBlendMode: "overlay"
              }}
            ></div>

            {/* Glowing accent elements */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/10 blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-primary/10 blur-3xl opacity-10 translate-y-1/3 -translate-x-1/4"></div>

            {/* Star pattern */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <Star
                  key={i}
                  className="absolute text-primary opacity-10"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                  strokeWidth={1}
                />
              ))}
            </div>

            {/* Decorative lines */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0 opacity-30"></div>
              <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0 opacity-30"></div>
              <div className="absolute bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-30"></div>
            </div>

            {/* Section title */}
            <div className="px-6 mb-6 relative">
              <h3 className="text-white text-lg font-semibold">Noutăți</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/70 mt-2 rounded-full"></div>
            </div>

            {/* Mobile scroll carousel */}
            <div className="overflow-x-auto hide-scrollbar pb-6 px-4 -mx-4">
              <div
                className="flex pl-[20%] pr-[20%]"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className={cn(
                      "flex-shrink-0",
                      index === 0 ? "pl-0" : "pl-3",
                      index === products.length - 1 ? "pr-4" : ""
                    )}
                    style={{ width: "95%" }}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-xl border border-gray-800 h-full">
                      {/* Use a wrapper div with fixed height for consistent card sizes */}
                      <div className="h-[380px]">
                        <ProductCard
                          product={product}
                          onAddToFavorites={handleAddToFavorites}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Scroll indicator */}

          </div>
        </div>
      </section>
      <Toaster />
    </>
  )
}
