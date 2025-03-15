"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { ChevronDown, Filter, Search, X, PackageOpen, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/app/components/ui/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Grid, Package, List, Sliders, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/app/contexts/favorites-context"
import { useToast } from "@/app/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
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
  stare?: string
}

interface Category {
  id: string
  nume: string
  descriere?: string | null
  imagine?: string | null
  subcategorii: Subcategory[]
}

interface Subcategory {
  id: string
  nume: string
  descriere?: string | null
  imagine?: string | null
  categoriePrincipalaId: string
  produse?: Product[]
}

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { favorites, toggleFavorite } = useFavorites()
  const { toast } = useToast()
  const { t } = useLanguage()
  const categoryParam = searchParams.get('category')
  const subcategoryParam = searchParams.get('subcategory')
  const searchQuery = searchParams.get('q') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sortOption, setSortOption] = useState<string>("featured")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [activePriceRange, setActivePriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 50000 })
  const [inputPriceRange, setInputPriceRange] = useState<{ min: string; max: string }>({ min: '0', max: '10000' })
  const [searchTerm, setSearchTerm] = useState(searchQuery)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage, setProductsPerPage] = useState(20)
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const productsPerPageMax = 30 // Maximum products per page
  const initialProductsToShow = 20 // Initial products to show

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [availableFilters, setAvailableFilters] = useState({
    inStock: false,
    onSale: false,
    freeShipping: false
  })

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true)
      try {
        // Mock data instead of API call
        // This would be replaced with a call to your custom API
        const mockCategories: Category[] = [
          {
            id: "cat1",
            nume: "Computere",
            descriere: "Laptopuri, desktop-uri și componente",
            imagine: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            subcategorii: [
              {
                id: "sub1",
                nume: "Laptopuri",
                descriere: "Laptopuri performante pentru orice buget",
                imagine: "https://images.unsplash.com/photo-1651614422777-d92444842a65?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                categoriePrincipalaId: "cat1"
              },
              {
                id: "sub2",
                nume: "Desktop",
                categoriePrincipalaId: "cat1"
              },
              {
                id: "sub3",
                nume: "Monitoare",
                categoriePrincipalaId: "cat1"
              }
            ]
          },
          {
            id: "cat2",
            nume: "Telefoane",
            descriere: "Smartphones, tablete și accesorii",
            imagine: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            subcategorii: [
              {
                id: "sub4",
                nume: "Smartphones",
                descriere: "Telefoane inteligente de la branduri de top",
                imagine: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                categoriePrincipalaId: "cat2"
              },
              {
                id: "sub5",
                nume: "Accesorii telefoane",
                categoriePrincipalaId: "cat2"
              },
              {
                id: "sub6",
                nume: "Tablete",
                descriere: "Tablete pentru muncă și divertisment",
                imagine: "https://images.unsplash.com/photo-1546868871-0f936769675e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                categoriePrincipalaId: "cat2"
              }
            ]
          },
          {
            id: "cat3",
            nume: "Electronice",
            descriere: "Televizoare, audio și video",
            imagine: "https://i.insider.com/6744c031fa0140cdd5654236?width=900&format=jpeg&auto=webp",
            subcategorii: [
              {
                id: "sub7",
                nume: "Televizoare",
                descriere: "Televizoare Smart de ultimă generație",
                imagine: "https://i.insider.com/6744c031fa0140cdd5654236?width=900&format=jpeg&auto=webp",
                categoriePrincipalaId: "cat3"
              },
              {
                id: "sub9",
                nume: "Foto & Video",
                categoriePrincipalaId: "cat3"
              }
            ]
          },
          {
            id: "cat4",
            nume: "Accesorii",
            descriere: "Căști, smartwatch-uri și periferice",
            imagine: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=3865&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            subcategorii: [
              {
                id: "sub8",
                nume: "Căști",
                descriere: "Căști wireless cu sunet de calitate",
                imagine: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=3865&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                categoriePrincipalaId: "cat4"
              },
              {
                id: "sub10",
                nume: "Smartwatch-uri",
                categoriePrincipalaId: "cat4"
              }
            ]
          },
          {
            id: "cat5",
            nume: "Gaming",
            descriere: "Console și accesorii pentru gaming",
            imagine: "",
            subcategorii: [
              {
                id: "sub11",
                nume: "Console",
                categoriePrincipalaId: "cat5"
              }
            ]
          },
          {
            id: "cat6",
            nume: "Electrocasnice",
            descriere: "Aparate pentru casă modernă",
            imagine: "",
            subcategorii: [
              {
                id: "sub12",
                nume: "Aspiratoare",
                categoriePrincipalaId: "cat6"
              }
            ]
          }
        ];

        setCategories(mockCategories);

        // Extract all products from all categories and subcategories
        const allProducts = mockCategories.flatMap(category =>
          category.subcategorii.flatMap(subcategory => {
            // Set the subcategorie property for each product if it's not already set
            return (subcategory.produse || []).map((product: any) => ({
              ...product,
              // Ensure subcategorie is properly set
              subcategorie: product.subcategorie || {
                id: subcategory.id,
                nume: subcategory.nume,
                categoriePrincipala: {
                  id: category.id,
                  nume: category.nume
                }
              }
            }));
          })
        );

        setProducts(allProducts);

        // Apply only subcategory filter from URL if present
        // Default to showing all products
        let filtered = [...allProducts];

        if (subcategoryParam) {
          filtered = filtered.filter(p => p.subcategorie?.id === subcategoryParam);
        }

        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error with mock catalog data:", error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca produsele",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate loading delay
    setTimeout(fetchCatalog, 500);
  }, [subcategoryParam, toast]);

  // Initialize the input price range when actual price range or product prices change
  useEffect(() => {
    setInputPriceRange({
      min: priceRange[0].toString(),
      max: priceRange[1].toString()
    });
    // Also initialize the active price range when products are loaded
    setActivePriceRange({
      min: priceRange[0],
      max: priceRange[1]
    });
  }, [products.length]); // Only update when products are loaded

  // Add effect to update searchTerm when URL parameter changes
  useEffect(() => {
    const currentSearchQuery = searchParams.get('q') || '';
    if (currentSearchQuery !== searchTerm) {
      setSearchTerm(currentSearchQuery);
    }
  }, [searchParams]); // This effect runs when searchParams change

  useEffect(() => {
    if (products.length > 0) {
      applyFilters()
    }
  }, [selectedSubcategory, sortOption, activePriceRange, searchTerm, products, currentPage])

  // Update displayed products when filtered products or pagination changes
  useEffect(() => {
    // Calculate the start and end index for the current page
    const startIndex = (currentPage - 1) * productsPerPageMax;
    const endIndex = startIndex + Math.min(productsPerPage, productsPerPageMax);

    // Get the products for the current page
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts(productsToDisplay);
  }, [filteredProducts, currentPage, productsPerPage]);

  const applyFilters = () => {
    // Start with all products
    let filtered = [...products]
    console.log('Filtering products:', {
      total: products.length,
      selectedSubcategory,
      searchTerm
    })

    // Apply subcategory filter only
    if (selectedSubcategory) {
      filtered = filtered.filter(product => {
        if (!product.subcategorie) {
          return false; // Skip products without subcategory information
        }
        return product.subcategorie.id === selectedSubcategory;
      });
      console.log('After subcategory filter:', filtered.length);
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = product.pretRedus || product.pret
      return price >= activePriceRange.min && price <= activePriceRange.max
    })

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.cod.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "featured":
        // Assuming products are already sorted by date in the API
        break
      case "price-asc":
        filtered.sort((a, b) => {
          const priceA = a.pretRedus || a.pret
          const priceB = b.pretRedus || b.pret
          return priceA - priceB
        })
        break
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA = a.pretRedus || a.pret
          const priceB = b.pretRedus || b.pret
          return priceB - priceA
        })
        break
      case "name-asc":
        filtered.sort((a, b) => a.nume.localeCompare(b.nume))
        break
      case "name-desc":
        filtered.sort((a, b) => b.nume.localeCompare(a.nume))
        break
    }

    console.log('Final filtered products:', filtered.length)
    setFilteredProducts(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams()
  }

  const updateUrlParams = () => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.set('category', selectedCategory)
    }

    if (selectedSubcategory) {
      params.set('subcategory', selectedSubcategory)
    }

    if (searchTerm) {
      params.set('q', searchTerm)
    }

    router.push(`/catalog?${params.toString()}`)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // We want to show all products when category changes, but filter by subcategory when selected
    setSelectedSubcategory(null)

    // Update the URL
    const params = new URLSearchParams()
    params.set('category', categoryId)
    router.push(`/catalog?${params.toString()}`)
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId)

    // Update the URL
    const params = new URLSearchParams()
    if (selectedCategory) {
      params.set('category', selectedCategory)
    }
    params.set('subcategory', subcategoryId)
    router.push(`/catalog?${params.toString()}`)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max])
    // Don't automatically update activePriceRange here anymore
  }

  const validateAndApplyPriceFilter = () => {
    // Parse the input values to numbers
    const minValue = parseInt(inputPriceRange.min);
    const maxValue = parseInt(inputPriceRange.max);

    // Validate min and max - default to 0 for min
    const validMin = !isNaN(minValue) && minValue >= 0 ? minValue : 0;
    const validMax = !isNaN(maxValue) && maxValue <= priceRange[1] ? maxValue : priceRange[1];

    // Make sure min is not greater than max
    const finalMin = Math.min(validMin, validMax);
    const finalMax = Math.max(validMin, validMax);

    // Update the price range state
    setPriceRange([finalMin, finalMax]);

    // Update the active price range state to apply the filter
    setActivePriceRange({ min: finalMin, max: finalMax });

    // Update the input state to match validated values
    setInputPriceRange({
      min: finalMin.toString(),
      max: finalMax.toString()
    });
  }

  const handleAddToFavorites = (product: Product) => {
    toggleFavorite(product.id);
  }

  const handleClearFilters = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSortOption("featured")
    setSearchTerm('')
    setPriceRange([0, 50000])
    setAvailableFilters({
      inStock: false,
      onSale: false,
      freeShipping: false
    })
    router.push('/catalog')
  }

  const getAvailableSubcategories = () => {
    if (!selectedCategory) return []

    const category = categories.find(c => c.id === selectedCategory)
    return category ? category.subcategorii : []
  }

  const getMinMaxPrices = () => {
    if (products.length === 0) return { min: 0, max: 10000 }

    const prices = products.map(p => p.pretRedus || p.pret)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }

  const { min: minPrice, max: maxPrice } = getMinMaxPrices()

  const handleLoadMore = () => {
    // Increase products per page by 10, up to max
    setProductsPerPage(prev => Math.min(prev + 10, productsPerPageMax));
  };

  const handlePageChange = (page: number) => {
    // Reset products per page when changing pages
    setProductsPerPage(initialProductsToShow);
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sidebar filters (desktop)
  const FiltersSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('catalog_categories')}</h3>
        <div className="mt-4 space-y-3">
          {categories.map(category => (
            <div key={category.id} className="space-y-2">
              <Link
                href={`/catalog?category=${category.id}`}
                className={cn(
                  "block font-medium hover:text-primary transition-colors",
                  selectedCategory === category.id ? "text-primary" : ""
                )}
              >
                {category.nume}
              </Link>

              {selectedCategory === category.id && (
                <div className="ml-4 space-y-1.5">
                  {category.subcategorii.map(subcategory => (
                    <Link
                      key={subcategory.id}
                      href={`/catalog?category=${category.id}&subcategory=${subcategory.id}`}
                      className={cn(
                        "block text-sm hover:text-primary transition-colors",
                        selectedSubcategory === subcategory.id ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {subcategory.nume}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">{t('catalog_price')}</h3>
        <div className="mt-4">
          <Slider
            value={priceRange}
            min={0}
            max={50000}
            step={100}
            onValueChange={(value: number[]) => setPriceRange(value as [number, number])}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{priceRange[0]} MDL</span>
            <span>{priceRange[1]} MDL</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">{t('catalog_filters')}</h3>
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={availableFilters.inStock}
              onCheckedChange={(checked) =>
                setAvailableFilters({...availableFilters, inStock: !!checked})
              }
            />
            <Label htmlFor="in-stock">{t('catalog_in_stock_only')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={availableFilters.onSale}
              onCheckedChange={(checked) =>
                setAvailableFilters({...availableFilters, onSale: !!checked})
              }
            />
            <Label htmlFor="on-sale">{t('catalog_on_sale')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="free-shipping"
              checked={availableFilters.freeShipping}
              onCheckedChange={(checked) =>
                setAvailableFilters({...availableFilters, freeShipping: !!checked})
              }
            />
            <Label htmlFor="free-shipping">{t('catalog_free_shipping')}</Label>
          </div>
        </div>
      </div>

      <Separator />

      <Button
        variant="outline"
        className="w-full"
        onClick={handleClearFilters}
      >
        <X className="mr-2 h-4 w-4" />
        {t('catalog_reset_filters')}
      </Button>
    </div>
  );

  // Calculate the proper page title
  const getPageTitle = () => {
    if (selectedSubcategory) {
      const subcategory = categories
        .flatMap(c => c.subcategorii)
        .find(s => s.id === selectedSubcategory);
      return subcategory ? subcategory.nume : "Catalog";
    }

    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      return category ? category.nume : "Catalog";
    }

    return t('catalog_all_products');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">{t('catalog_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header and search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder={t('catalog_search_placeholder')}
                className="pl-8 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default" className="ml-2">
              {t('catalog_search_button')}
            </Button>
          </form>
        </motion.div>

        {/* Active filters - show on both mobile and desktop */}
        <AnimatePresence>
          {(selectedCategory || selectedSubcategory || searchTerm ||
            activePriceRange.min > minPrice || activePriceRange.max < maxPrice) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center gap-2 py-2 overflow-hidden"
            >
              <span className="text-sm text-gray-500">{t('catalog_active_filters')}</span>
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="outline" className="flex items-center gap-1">
                    {categories.find(c => c.id === selectedCategory)?.nume}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(null)
                        router.push(selectedSubcategory ? `/catalog?subcategory=${selectedSubcategory}` : '/catalog')
                      }}
                    />
                  </Badge>
                </motion.div>
              )}
              {selectedSubcategory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getAvailableSubcategories().find(s => s.id === selectedSubcategory)?.nume}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setSelectedSubcategory(null)
                        router.push(selectedCategory ? `/catalog?category=${selectedCategory}` : '/catalog')
                      }}
                    />
                  </Badge>
                </motion.div>
              )}
              {searchTerm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Badge variant="outline" className="flex items-center gap-1">
                    Căutare: {searchTerm}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setSearchTerm('')
                        const params = new URLSearchParams()
                        if (selectedCategory) params.set('category', selectedCategory)
                        if (selectedSubcategory) params.set('subcategory', selectedSubcategory)
                        router.push(`/catalog${params.toString() ? `?${params.toString()}` : ''}`)
                      }}
                    />
                  </Badge>
                </motion.div>
              )}
              {(activePriceRange.min > minPrice || activePriceRange.max < maxPrice) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <Badge variant="outline" className="flex items-center gap-1">
                    Preț: {activePriceRange.min} - {activePriceRange.max} MDL
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setPriceRange([minPrice, maxPrice])
                        setActivePriceRange({ min: minPrice, max: maxPrice })
                      }}
                    />
                  </Badge>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="ml-auto"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1"
                  onClick={handleClearFilters}
                >
                  <X className="h-3 w-3" />
                  {t('catalog_reset_all')}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area - grid layout with sidebar and products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar with filters - desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[200px] max-h-[calc(100vh-120px)] overflow-y-auto pr-4 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  {t('catalog_categories')}
                </h3>

                <div className="space-y-2">
                  <Button
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null)
                      setSelectedSubcategory(null)
                      router.push('/catalog')
                    }}
                    className="w-full justify-start"
                  >
                    {t('catalog_all_products')}
                  </Button>

                  {categories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <Button
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryChange(category.id)}
                        className="w-full justify-start"
                      >
                        {category.nume}
                      </Button>

                      <AnimatePresence>
                        {selectedCategory === category.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pl-4 space-y-1 mt-2 overflow-hidden"
                          >
                            {category.subcategorii.map((subcategory) => (
                              <motion.div
                                key={subcategory.id}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Button
                                  variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                                  size="sm"
                                  className="w-full justify-start text-sm"
                                  onClick={() => handleSubcategoryChange(subcategory.id)}
                                >
                                  {subcategory.nume}
                                </Button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Price filter */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  {t('catalog_filter_by_price')}
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('catalog_min')} {priceRange[0]} MDL</span>
                      <span className="text-sm text-gray-600">{t('catalog_max')} {priceRange[1]} MDL</span>
                    </div>

                    <div className="py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder={t('catalog_min_price')}
                            value={inputPriceRange.min}
                            onChange={(e) => {
                              // Allow typing any numeric value, validation happens on apply
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setInputPriceRange({ ...inputPriceRange, min: value });
                              // Update priceRange but don't apply filter yet
                              const numValue = value === '' ? 0 : parseInt(value);
                              if (!isNaN(numValue)) {
                                setPriceRange(prev => [numValue, prev[1]]);
                              }
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder={t('catalog_max_price')}
                            value={inputPriceRange.max}
                            onChange={(e) => {
                              // Allow typing any numeric value, validation happens on apply
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setInputPriceRange({ ...inputPriceRange, max: value });
                              // Update priceRange but don't apply filter yet
                              const numValue = value === '' ? priceRange[1] : parseInt(value);
                              if (!isNaN(numValue)) {
                                setPriceRange(prev => [prev[0], numValue]);
                              }
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={validateAndApplyPriceFilter}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      {t('catalog_apply_filter')}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Sort options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  {t('catalog_sorting')}
                </h3>

                <div className="space-y-2">
                  <Select
                    value={sortOption}
                    onValueChange={(value) => setSortOption(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('catalog_sort_by')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">{t('catalog_sort_recommended')}</SelectItem>
                      <SelectItem value="price-asc">{t('catalog_sort_price_asc')}</SelectItem>
                      <SelectItem value="price-desc">{t('catalog_sort_price_desc')}</SelectItem>
                      <SelectItem value="name-asc">{t('catalog_sort_name_asc')}</SelectItem>
                      <SelectItem value="name-desc">{t('catalog_sort_name_desc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full"
                >
                  {t('catalog_reset_all')}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile filter button - show on mobile only */}
          <div className="lg:hidden w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between">
                    <span>{t('catalog_filter_products')}</span>
                    <Filter className="h-4 w-4 ml-2" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader className="pb-2">
                    <SheetTitle>{t('catalog_filters')}</SheetTitle>
                    <div className="flex justify-end -mt-8">
                      <Button
                        onClick={handleClearFilters}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        {t('catalog_reset_all')}
                      </Button>
                    </div>
                  </SheetHeader>

                  <div className="py-2 space-y-4">
                    {/* Products */}
                    <div className="pb-2 border-b">
                      <Button
                        variant={!selectedCategory ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(null)
                          setSelectedSubcategory(null)
                          router.push('/catalog')
                        }}
                        className="w-full mb-2"
                      >
                        {t('catalog_all_products')}
                      </Button>
                    </div>

                    {/* Categories */}
                    <div className="pb-2">
                      <h3 className="text-sm font-medium mb-1 flex items-center">
                        <Filter className="h-3.5 w-3.5 mr-1 text-primary" />
                        {t('catalog_categories')}
                      </h3>
                      <Accordion
                        type="multiple"
                        className="w-full"
                        defaultValue={selectedCategory ? [selectedCategory] : []}
                      >
                        {categories.map((category) => (
                          <AccordionItem
                            key={category.id}
                            value={category.id}
                            className="border-b-0 py-0"
                          >
                            <AccordionTrigger
                              onClick={() => handleCategoryChange(category.id)}
                              className={`py-1.5 ${selectedCategory === category.id ? "font-bold text-primary" : ""}`}
                            >
                              <span className="text-sm">{category.nume}</span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pt-0">
                              <div className="flex flex-col space-y-1 pl-2 mt-1">
                                {category.subcategorii.map((subcategory) => (
                                  <Button
                                    key={subcategory.id}
                                    variant={selectedSubcategory === subcategory.id ? "default" : "ghost"}
                                    size="sm"
                                    className="justify-start h-7 text-xs"
                                    onClick={() => {
                                      handleSubcategoryChange(subcategory.id)
                                    }}
                                  >
                                    {subcategory.nume}
                                  </Button>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>

                    {/* Price filter */}
                    <div className="pb-2 border-t pt-3">
                      <h3 className="text-sm font-medium mb-1 flex items-center">
                        <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-primary" />
                        {t('catalog_filter_by_price')}
                      </h3>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{t('catalog_min')} {priceRange[0]} MDL</span>
                          <span className="text-xs text-gray-600">{t('catalog_max')} {priceRange[1]} MDL</span>
                        </div>

                        <div className="py-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={t('catalog_min_price')}
                                value={inputPriceRange.min}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setInputPriceRange({ ...inputPriceRange, min: value });
                                  // Update priceRange but don't apply filter yet
                                  const numValue = value === '' ? 0 : parseInt(value);
                                  if (!isNaN(numValue)) {
                                    setPriceRange(prev => [numValue, prev[1]]);
                                  }
                                }}
                                className="w-full h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={t('catalog_max_price')}
                                value={inputPriceRange.max}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setInputPriceRange({ ...inputPriceRange, max: value });
                                  // Update priceRange but don't apply filter yet
                                  const numValue = value === '' ? priceRange[1] : parseInt(value);
                                  if (!isNaN(numValue)) {
                                    setPriceRange(prev => [prev[0], numValue]);
                                  }
                                }}
                                className="w-full h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={validateAndApplyPriceFilter}
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs h-8"
                        >
                          {t('catalog_apply_filter')}
                        </Button>
                      </div>
                    </div>

                    {/* Sort options */}
                    <div className="pb-2 border-t pt-3">
                      <h3 className="text-sm font-medium mb-1 flex items-center">
                        <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-primary" />
                        {t('catalog_sorting')}
                      </h3>
                      <Select
                        value={sortOption}
                        onValueChange={(value) => setSortOption(value)}
                      >
                        <SelectTrigger className="w-full h-8 mt-2 text-sm">
                          <SelectValue placeholder={t('catalog_sort_by')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">{t('catalog_sort_recommended')}</SelectItem>
                          <SelectItem value="price-asc">{t('catalog_sort_price_asc')}</SelectItem>
                          <SelectItem value="price-desc">{t('catalog_sort_price_desc')}</SelectItem>
                          <SelectItem value="name-asc">{t('catalog_sort_name_asc')}</SelectItem>
                          <SelectItem value="name-desc">{t('catalog_sort_name_desc')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SheetFooter className="pt-3 border-t mt-2">
                    <SheetClose asChild>
                      <Button className="w-full">{t('catalog_apply_filters')}</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>

          {/* Products grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {displayedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        <ProductCard
                          product={product}
                          onAddToFavorites={handleAddToFavorites}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load more button */}
                {displayedProducts.length < (currentPage * productsPerPageMax) &&
                 displayedProducts.length < filteredProducts.length &&
                 productsPerPage < productsPerPageMax && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {t('catalog_load_more')}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {filteredProducts.length > productsPerPageMax && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {t('catalog_previous')}
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, Math.ceil(filteredProducts.length / productsPerPageMax)) }).map((_, i) => {
                          // Logic to show pages around current page
                          let pageToShow: number;
                          const totalPages = Math.ceil(filteredProducts.length / productsPerPageMax);

                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            // Near start
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Near end
                            pageToShow = totalPages - 4 + i;
                          } else {
                            // In middle
                            pageToShow = currentPage - 2 + i;
                          }

                          // Only render if page is valid
                          if (pageToShow > 0 && pageToShow <= totalPages) {
                            return (
                              <Button
                                key={pageToShow}
                                variant={currentPage === pageToShow ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => handlePageChange(pageToShow)}
                              >
                                {pageToShow}
                              </Button>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(filteredProducts.length / productsPerPageMax)}
                      >
                        {t('catalog_next')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900">{t('catalog_no_products_found')}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('catalog_try_different_filters')} <Button onClick={handleClearFilters} variant="link" className="px-1 h-auto text-primary">{t('catalog_clear_all_filters')}</Button>
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
