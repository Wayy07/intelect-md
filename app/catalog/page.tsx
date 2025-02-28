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

interface Category {
  id: string
  nume: string
  activ: boolean
  subcategorii: Subcategory[]
}

interface Subcategory {
  id: string
  nume: string
  activ: boolean
  produse: Product[]
  categoriePrincipalaId: string
}

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category')
  const subcategoryParam = searchParams.get('subcategory')
  const searchQuery = searchParams.get('q') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sortOption, setSortOption] = useState<string>("newest")
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 })
  const [inputPriceRange, setInputPriceRange] = useState<{ min: string; max: string }>({ min: '0', max: '10000' })
  const [searchTerm, setSearchTerm] = useState(searchQuery)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage, setProductsPerPage] = useState(20)
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const productsPerPageMax = 30 // Maximum products per page
  const initialProductsToShow = 20 // Initial products to show

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/catalog')
        const data: Category[] = await response.json()

        console.log('Categories fetched:', data.length);

        setCategories(data)

        // Extract all products from all categories and subcategories
        const allProducts = data.flatMap(category =>
          category.subcategorii.flatMap(subcategory => {
            // Set the subcategorie property for each product if it's not already set
            return subcategory.produse.map(product => ({
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
        )

        console.log('Total products found:', allProducts.length);

        // Log products without category information
        const productsWithoutCategory = allProducts.filter(p => !p.subcategorie?.categoriePrincipala);
        console.log('Products without category info:', productsWithoutCategory.length);

        setProducts(allProducts)

        // Apply only subcategory filter from URL if present
        // Default to showing all products
        let filtered = [...allProducts];

        if (subcategoryParam) {
          filtered = filtered.filter(p => p.subcategorie?.id === subcategoryParam);
          console.log(`Filtered by subcategory ${subcategoryParam}:`, filtered.length);
        }

        setFilteredProducts(filtered)
      } catch (error) {
        console.error("Error fetching catalog:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCatalog()
  }, [subcategoryParam])

  // Initialize the input price range when actual price range or product prices change
  useEffect(() => {
    setInputPriceRange({
      min: priceRange.min.toString(),
      max: priceRange.max.toString()
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
  }, [selectedSubcategory, sortOption, priceRange, searchTerm, products, currentPage])

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
      return price >= priceRange.min && price <= priceRange.max
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
      case "newest":
        // Assuming products are already sorted by date in the API
        break
      case "priceAsc":
        filtered.sort((a, b) => {
          const priceA = a.pretRedus || a.pret
          const priceB = b.pretRedus || b.pret
          return priceA - priceB
        })
        break
      case "priceDesc":
        filtered.sort((a, b) => {
          const priceA = a.pretRedus || a.pret
          const priceB = b.pretRedus || b.pret
          return priceB - priceA
        })
        break
      case "nameAsc":
        filtered.sort((a, b) => a.nume.localeCompare(b.nume))
        break
      case "nameDesc":
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
    setPriceRange({ min, max })
  }

  const validateAndApplyPriceFilter = () => {
    // Parse the input values to numbers
    const minValue = parseInt(inputPriceRange.min);
    const maxValue = parseInt(inputPriceRange.max);

    // Validate min and max - default to 0 for min
    const validMin = !isNaN(minValue) && minValue >= 0 ? minValue : 0;
    const validMax = !isNaN(maxValue) && maxValue <= maxPrice ? maxValue : maxPrice;

    // Make sure min is not greater than max
    const finalMin = Math.min(validMin, validMax);
    const finalMax = Math.max(validMin, validMax);

    // Update the actual price range state
    setPriceRange({ min: finalMin, max: finalMax });

    // Update the input state to match validated values
    setInputPriceRange({
      min: finalMin.toString(),
      max: finalMax.toString()
    });
  }

  const handleAddToFavorites = (product: Product) => {
    // Implement favorites functionality
    console.log("Add to favorites:", product)
  }

  const handleClearFilters = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSortOption("newest")
    setPriceRange({ min: 0, max: 10000 })
    setSearchTerm('')
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
          <h1 className="text-3xl font-bold">Catalog produse</h1>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Caută produse..."
                className="pl-8 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default" className="ml-2">
              Caută
            </Button>
          </form>
        </motion.div>

        {/* Active filters - show on both mobile and desktop */}
        <AnimatePresence>
          {(selectedCategory || selectedSubcategory || searchTerm ||
            priceRange.min > minPrice || priceRange.max < maxPrice) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center gap-2 py-2 overflow-hidden"
            >
              <span className="text-sm text-gray-500">Filtre active:</span>
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
              {(priceRange.min > minPrice || priceRange.max < maxPrice) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <Badge variant="outline" className="flex items-center gap-1">
                    Preț: {priceRange.min} - {priceRange.max} MDL
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setPriceRange({ min: minPrice, max: maxPrice })
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
                  Resetează toate
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
                  Categorii
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
                    Toate produsele
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
                  Filtru preț
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Min: {priceRange.min} MDL</span>
                      <span className="text-sm text-gray-600">Max: {priceRange.max} MDL</span>
                    </div>

                    <div className="py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Preț minim"
                            value={inputPriceRange.min}
                            onChange={(e) => {
                              // Allow typing any numeric value, validation happens on apply
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setInputPriceRange({ ...inputPriceRange, min: value });
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Preț maxim"
                            value={inputPriceRange.max}
                            onChange={(e) => {
                              // Allow typing any numeric value, validation happens on apply
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setInputPriceRange({ ...inputPriceRange, max: value });
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
                      Aplică filtru
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
                  Sortare
                </h3>

                <div className="space-y-2">
                  <Select
                    value={sortOption}
                    onValueChange={(value) => setSortOption(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sortează după" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Cele mai noi</SelectItem>
                      <SelectItem value="priceAsc">Preț: crescător</SelectItem>
                      <SelectItem value="priceDesc">Preț: descrescător</SelectItem>
                      <SelectItem value="nameAsc">Nume: A-Z</SelectItem>
                      <SelectItem value="nameDesc">Nume: Z-A</SelectItem>
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
                  Resetează toate filtrele
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
                    <span>Filtrează produsele</span>
                    <Filter className="h-4 w-4 ml-2" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader className="pb-2">
                    <SheetTitle>Filtre</SheetTitle>
                    <div className="flex justify-end -mt-8">
                      <Button
                        onClick={handleClearFilters}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        Resetează toate
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
                        Toate produsele
                      </Button>
                    </div>

                    {/* Categories */}
                    <div className="pb-2">
                      <h3 className="text-sm font-medium mb-1 flex items-center">
                        <Filter className="h-3.5 w-3.5 mr-1 text-primary" />
                        Categorii
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
                        Filtru preț
                      </h3>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Min: {priceRange.min} MDL</span>
                          <span className="text-xs text-gray-600">Max: {priceRange.max} MDL</span>
                        </div>

                        <div className="py-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Preț minim"
                                value={inputPriceRange.min}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setInputPriceRange({ ...inputPriceRange, min: value });
                                }}
                                className="w-full h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Preț maxim"
                                value={inputPriceRange.max}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  setInputPriceRange({ ...inputPriceRange, max: value });
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
                          Aplică filtru
                        </Button>
                      </div>
                    </div>

                    {/* Sort options */}
                    <div className="pb-2 border-t pt-3">
                      <h3 className="text-sm font-medium mb-1 flex items-center">
                        <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-primary" />
                        Sortare
                      </h3>
                      <Select
                        value={sortOption}
                        onValueChange={(value) => setSortOption(value)}
                      >
                        <SelectTrigger className="w-full h-8 mt-2 text-sm">
                          <SelectValue placeholder="Sortează după" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Cele mai noi</SelectItem>
                          <SelectItem value="priceAsc">Preț: crescător</SelectItem>
                          <SelectItem value="priceDesc">Preț: descrescător</SelectItem>
                          <SelectItem value="nameAsc">Nume: A-Z</SelectItem>
                          <SelectItem value="nameDesc">Nume: Z-A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SheetFooter className="pt-3 border-t mt-2">
                    <SheetClose asChild>
                      <Button className="w-full">Aplică filtre</Button>
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
                      Încarcă încă 10 produse
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
                        Anterior
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
                        Următor
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
                <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900">Nu am găsit produse</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Încearcă alte filtre sau resetează toate filtrele pentru a vedea toate produsele.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleClearFilters}
                >
                  Resetează filtrele
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
