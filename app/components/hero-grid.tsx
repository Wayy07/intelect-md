"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useAnimationFrame, useTransform } from "framer-motion"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

// Local interface to replace Prisma import
interface Subcategorie {
  id: string
  nume: string  // Displayed name (translated)
  numeKey: string  // Translation key
  descriere?: string | null
  imagine?: string | null
  categoriePrincipalaId: string
  activ: boolean
}

interface SubcategoryWithCategory extends Subcategorie {
  categoriePrincipala: {
    id: string
    nume: string
    numeKey: string  // Translation key
  }
}

// Brand interface for the new component
interface Brand {
  id: string
  name: string
  logo: string
  color: string
  hoverColor: string
  background: string
  category: string
}

const gridPositions = [
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-3",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
]

// Replace SubcategoryTags with BrandLogos
const BrandLogos = () => {
  const { t } = useLanguage()

  // Animation settings - slower speed for more visible scrolling
  const baseVelocity = 0.05 // Reduced for much slower motion
  const baseX = useMotionValue(0)
  const [hoveredBrandId, setHoveredBrandId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if we're on mobile on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const brands: Brand[] = [
    {
      id: "apple",
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
      color: "#000000",
      hoverColor: "#111111",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "samsung",
      name: "Samsung",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
      color: "#1428a0",
      hoverColor: "#1c3bd4",
      background: "#ffffff",
      category: "cat2"
    },
    {
      id: "lg",
      name: "LG",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/2048px-LG_symbol.svg.png",
      color: "#a50034",
      hoverColor: "#c50040",
      background: "#ffffff",
      category: "cat3"
    },
    {
      id: "xiaomi",
      name: "Xiaomi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg",
      color: "#ff6700",
      hoverColor: "#ff8a3d",
      background: "#ffffff",
      category: "cat2"
    },
    {
      id: "sony",
      name: "Sony",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
      color: "#ffffff",
      hoverColor: "#ffffff",
      background: "#ffffff",
      category: "cat3"
    },
    {
      id: "dell",
      name: "Dell",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg",
      color: "#007db8",
      hoverColor: "#0094d9",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "hp",
      name: "HP",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
      color: "#0096d6",
      hoverColor: "#00adfa",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "lenovo",
      name: "Lenovo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/03/Lenovo_Global_Corporate_Logo.png",
      color: "#e2231a",
      hoverColor: "#ff3c33",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "acer",
      name: "Acer",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg",
      color: "#83b81a",
      hoverColor: "#9cdb1f",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "asus",
      name: "Asus",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg",
      color: "#00539b",
      hoverColor: "#0068c4",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "msi",
      name: "MSI",
      logo: "https://1000logos.net/wp-content/uploads/2018/10/MSI-Logo.png",
      color: "#ff0000",
      hoverColor: "#ff3333",
      background: "#ffffff",
      category: "cat1"
    },
    {
      id: "huawei",
      name: "Huawei",
      logo: "https://1000logos.net/wp-content/uploads/2018/08/Huawei-Logo.png",
      color: "#ff0000",
      hoverColor: "#ff3333",
      background: "#ffffff",
      category: "cat2"
    }
  ];

  // Create a very long list of brands to ensure continuous scrolling
  // Using 4 sets of brands should be enough for a seamless appearance
  const extendedBrands = [...brands, ...brands, ...brands, ...brands];

  // Base dimensions - smaller card width on mobile
  const itemWidth = isMobile ? 130 : 170;

  // Animation using continuous scrolling with time-based movement
  // This animation will continue even when hovering over individual cards
  // but will pause when dragging
  useAnimationFrame((time) => {
    if (isDragging) return;

    // Get the width of one complete set of brands
    const brandSetWidth = brands.length * itemWidth;

    // Create a continuous motion with natural looping using modulo
    const xPos = (-time * baseVelocity) % brandSetWidth;
    baseX.set(xPos);
  });

  // Transform the x position for left-to-right scrolling
  const x = useTransform(baseX, (value) => `${value}px`);

  // Drag constraints
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const brandSetWidth = brands.length * itemWidth;

  // Set up drag handlers
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);

    // Update the baseX position based on the drag
    const newX = baseX.get() + info.offset.x;
    baseX.set(newX);
  };

  return (
    <div className="w-full py-10 px-4 bg-gray-50 border-t border-gray-100">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-xl sm:text-2xl font-semibold text-center mb-8 text-gray-800"
      >
        {t("popular_brands") || "Branduri populare"}
      </motion.h3>

      <div
        className="relative max-w-7xl mx-auto overflow-hidden"
        ref={containerRef}
      >
        {/* Fade overlay on the edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        {/* Mobile drag hint overlay */}
        {isMobile && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-0 animate-fadeOut">
            <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Trage pentru a naviga
            </div>
          </div>
        )}

        <div className="overflow-hidden">
          <motion.div
            className="flex py-2"
            style={{ x }}
            drag={isMobile ? "x" : false}
            dragConstraints={{
              left: -brandSetWidth,
              right: containerWidth
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragElastic={0.2}
          >
            {extendedBrands.map((brand, index) => (
              <motion.div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0"
                style={{ width: itemWidth }}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onHoverStart={() => setHoveredBrandId(brand.id)}
                onHoverEnd={() => setHoveredBrandId(null)}
              >
                <Link
                  href={`/catalog?brand=${brand.id}&category=${brand.category}`}
                  className={`flex flex-col items-center justify-center group mx-2 rounded-xl p-3
                           hover:shadow-lg transition-all duration-300 relative overflow-hidden
                           ${isMobile ? 'h-[70px]' : 'h-[90px]'}`}
                  onClick={(e) => {
                    // Prevent navigation when dragging on mobile
                    if (isDragging) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    borderColor: `${brand.color}30`,
                    background: brand.background,
                    boxShadow: hoveredBrandId === brand.id ? `0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px ${brand.color}30` : 'none',
                  }}
                >
                  <motion.div
                    className={`relative ${isMobile ? 'h-10 w-24' : 'h-12 w-32'}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    style={{
                      filter: hoveredBrandId === brand.id ? "none" : "grayscale(0.2) opacity(0.9)"
                    }}
                  >
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes={isMobile ? "96px" : "128px"}
                      className="object-contain transition-all duration-300"
                      loading="eager"
                      unoptimized
                    />
                  </motion.div>

                  {/* Hover effect underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: brand.color,
                      transformOrigin: "left"
                    }}
                  />

                  {/* Radial hover effect */}
                  <div
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${brand.color} 0%, transparent 70%)`,
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const SubcategoryTags = ({ heroSubcategories, subcategories }: {
  heroSubcategories: SubcategoryWithCategory[]
  subcategories: SubcategoryWithCategory[]
}) => {
  const { t } = useLanguage()
  // Combine hero subcategories and remaining subcategories
  const allTags = [...heroSubcategories, ...subcategories]

  return (
    <div className="w-full py-12 px-4 md:px-8">
      <div className="flex flex-wrap justify-center gap-3 max-w-6xl  mx-auto">
        {allTags.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/catalog?category=${subcategory.categoriePrincipala.id}&subcategory=${subcategory.id}`}
            className="inline-flex items-center px-4 py-2 rounded-full
                     bg-white shadow-sm border border-gray-200
                     hover:bg-primary hover:border-primary hover:text-primary-foreground
                     transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <span className="text-sm font-medium">{t(subcategory.numeKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function HeroSection() {
  const { t } = useLanguage()
  const [subcategories, setSubcategories] = useState<SubcategoryWithCategory[]>([])
  const [heroSubcategories, setHeroSubcategories] = useState<SubcategoryWithCategory[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        // Mock data instead of API call
        // This would be replaced with a call to your custom API
        const mockSubcategories: SubcategoryWithCategory[] = [
          {
            id: "sub1",
            nume: "Laptopuri",
            numeKey: "subcategory_laptops",
            descriere: "Laptopuri performante pentru orice buget",
            imagine: "https://images.unsplash.com/photo-1651614422777-d92444842a65?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            categoriePrincipalaId: "cat1",
            activ: true,
            categoriePrincipala: {
              id: "cat1",
              nume: "Computere",
              numeKey: "category_computers"
            }
          },
          {
            id: "sub2",
            nume: "Smartphone-uri",
            numeKey: "subcategory_smartphones",
            descriere: "Telefoane inteligente de la branduri de top",
            imagine: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            categoriePrincipalaId: "cat2",
            activ: true,
            categoriePrincipala: {
              id: "cat2",
              nume: "Telefoane",
              numeKey: "category_phones"
            }
          },
          {
            id: "sub3",
            nume: "Tablete",
            numeKey: "subcategory_tablets",
            descriere: "Tablete pentru muncă și divertisment",
            imagine: "https://images.unsplash.com/photo-1546868871-0f936769675e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            categoriePrincipalaId: "cat2",
            activ: true,
            categoriePrincipala: {
              id: "cat2",
              nume: "Telefoane",
              numeKey: "category_phones"
            }
          },
          {
            id: "sub4",
            nume: "Televizoare",
            numeKey: "subcategory_tvs",
            descriere: "Televizoare Smart de ultimă generație",
            imagine: "https://i.insider.com/6744c031fa0140cdd5654236?width=900&format=jpeg&auto=webp",
            categoriePrincipalaId: "cat3",
            activ: true,
            categoriePrincipala: {
              id: "cat3",
              nume: "Electronice",
              numeKey: "category_electronics"
            }
          },
          {
            id: "sub5",
            nume: "Căști",
            numeKey: "subcategory_headphones",
            descriere: "Căști wireless cu sunet de calitate",
            imagine: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=3865&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            categoriePrincipalaId: "cat4",
            activ: true,
            categoriePrincipala: {
              id: "cat4",
              nume: "Accesorii",
              numeKey: "category_accessories"
            }
          },
          {
            id: "sub6",
            nume: "Smartwatch-uri",
            numeKey: "subcategory_smartwatches",
            descriere: "Ceasuri inteligente pentru monitorizarea activității",
            imagine: "",
            categoriePrincipalaId: "cat4",
            activ: true,
            categoriePrincipala: {
              id: "cat4",
              nume: "Accesorii",
              numeKey: "category_accessories"
            }
          },
          {
            id: "sub7",
            nume: "Console",
            numeKey: "subcategory_consoles",
            descriere: "Console de gaming pentru pasionați",
            imagine: "",
            categoriePrincipalaId: "cat5",
            activ: true,
            categoriePrincipala: {
              id: "cat5",
              nume: "Gaming",
              numeKey: "category_gaming"
            }
          },
          {
            id: "sub8",
            nume: "Aspiratoare",
            numeKey: "subcategory_vacuums",
            descriere: "Aspiratoare inteligente pentru casa ta",
            imagine: "",
            categoriePrincipalaId: "cat6",
            activ: true,
            categoriePrincipala: {
              id: "cat6",
              nume: "Electrocasnice",
              numeKey: "category_appliances"
            }
          }
        ];

        // Before setting the state, apply translations to the names
        const translatedSubcategories = mockSubcategories.map(subcat => ({
          ...subcat,
          nume: t(subcat.numeKey),
          categoriePrincipala: {
            ...subcat.categoriePrincipala,
            nume: t(subcat.categoriePrincipala.numeKey)
          }
        }));

        // Use first 8 for hero grid
        const heroSubcats = translatedSubcategories.slice(0, 8);
        setHeroSubcategories(heroSubcats);

        // Use rest for tags
        const remainingSubcats = translatedSubcategories.slice(8);
        setSubcategories(remainingSubcats);

      } catch (error) {
        console.error("Error setting mock subcategories:", error);
      }
    };

    // Simulate loading delay
    setTimeout(fetchSubcategories, 500);
  }, [t]); // Add t as a dependency to update when language changes

  // Mobile grid positions (4 items)
  const mobileGridPositions = [
    "col-span-2 row-span-2", // First item - large
    "col-span-2 row-span-1", // Second item - wide
    "col-span-1 row-span-1", // Third item - small
    "col-span-1 row-span-1", // Fourth item - small
  ]

  return (
    <>
      <section className="container mx-auto py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3 px-4 sm:px-0">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {t("techForEveryone")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("discoverProducts")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 auto-rows-[120px] sm:auto-rows-[200px] max-w-7xl mx-auto px-3 sm:px-6">
          {heroSubcategories.slice(0, isMobile ? 4 : 5).map((subcategory, index) => (
            <Link
              key={subcategory.id}
              href={`/catalog?category=${subcategory.categoriePrincipala.id}&subcategory=${subcategory.id}`}
              className={cn(
                "relative group",
                isMobile ? mobileGridPositions[index] : gridPositions[index]
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className={cn(
                  "relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300",
                  hoveredIndex === index
                    ? "shadow-2xl shadow-primary/30 scale-[1.02] ring-2 ring-primary z-10"
                    : "shadow-lg hover:shadow-xl bg-gradient-to-br from-gray-900 to-gray-800"
                )}
                layout
              >
                {subcategory.imagine ? (
                  <Image
                    src={subcategory.imagine}
                    alt={subcategory.nume}
                    fill
                    className={cn(
                      "object-cover transition-all duration-500",
                      hoveredIndex === index
                        ? "scale-110 brightness-90"
                        : "group-hover:scale-105 brightness-75"
                    )}
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                )}

                {/* Multiple layered gradients for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-50" />

                {/* Glowing effect on hover */}
                <div className={cn(
                  "absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300",
                  hoveredIndex === index
                    ? "opacity-100 bg-gradient-to-t from-primary/30 via-primary/5 to-transparent"
                    : "group-hover:opacity-40"
                )} />

                {/* Content */}
                <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-end">
                  <div className="space-y-1 sm:space-y-2">
                    <motion.p
                      className={cn(
                        "text-xs sm:text-sm font-medium transition-colors",
                        hoveredIndex === index
                          ? "text-primary-foreground"
                          : "text-primary/0 group-hover:opacity-40"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: hoveredIndex === index ? 1 : 0.9,
                        y: hoveredIndex === index ? 0 : 5
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {subcategory.categoriePrincipala.nume}
                    </motion.p>
                    <motion.h3
                      className={cn(
                        "font-semibold transition-colors line-clamp-2",
                        index === 0 ? "text-sm sm:text-lg" : "text-sm sm:text-lg",
                        hoveredIndex === index
                          ? "text-white"
                          : "text-gray-100"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: hoveredIndex === index ? 1 : 0.9,
                        y: hoveredIndex === index ? 0 : 5
                      }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {subcategory.nume}
                    </motion.h3>
                  </div>

                  {/* Hover indicator */}
                  <motion.div
                    className={cn(
                      "absolute bottom-0 left-0 h-0.5 sm:h-1 bg-primary transition-all duration-300",
                      hoveredIndex === index ? "w-full" : "w-0"
                    )}
                    initial={{ width: "0%" }}
                    animate={{ width: hoveredIndex === index ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <BrandLogos />
    </>
  )
}
