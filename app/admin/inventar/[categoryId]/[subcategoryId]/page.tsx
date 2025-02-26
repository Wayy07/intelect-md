"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CategoriePrincipala, Subcategorie, Produs } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import ProductDialog from "../../components/product-dialog"
import DeleteAlert from "../../components/delete-alert"
import SearchBar from "../../components/search-bar"
import { cn } from "@/lib/utils"

interface ProductsPageProps {
  params: Promise<{
    categoryId: string
    subcategoryId: string
  }>
}

interface SubcategoryWithProducts extends Subcategorie {
  categoriePrincipala: CategoriePrincipala
  produse: Produs[]
}

export default function ProductsPage({ params }: ProductsPageProps) {
  const router = useRouter()
  const { categoryId, subcategoryId } = React.use(params)
  const [subcategory, setSubcategory] = useState<SubcategoryWithProducts>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Produs>()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Produs>()

  useEffect(() => {
    const fetchSubcategory = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/categories/${categoryId}/subcategories/${subcategoryId}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch subcategory")
        }
        const data = await response.json()
        setSubcategory(data)
      } catch (error) {
        setError("A apărut o eroare la încărcarea subcategoriei")
        console.error("Error fetching subcategory:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubcategory()
  }, [categoryId, subcategoryId])

  const handleAddProduct = () => {
    setSelectedProduct(undefined)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Produs) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (product: Produs) => {
    setProductToDelete(product)
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(
        `/api/categories/${categoryId}/subcategories/${subcategoryId}/products/${productToDelete.id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setSubcategory((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          produse: prev.produse.filter((p) => p.id !== productToDelete.id),
        }
      })
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setShowDeleteAlert(false)
      setProductToDelete(undefined)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedProduct(undefined)
    // Refresh data
    const fetchSubcategory = async () => {
      try {
        const response = await fetch(
          `/api/categories/${categoryId}/subcategories/${subcategoryId}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch subcategory")
        }
        const data = await response.json()
        setSubcategory(data)
      } catch (error) {
        console.error("Error fetching subcategory:", error)
      }
    }
    fetchSubcategory()
  }

  if (isLoading) {
    return <div>Se încarcă...</div>
  }

  if (error || !subcategory) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error || "Subcategoria nu a fost găsită"}</p>
        <Link
          href={`/admin/inventar/${categoryId}`}
          className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-x-1 justify-center mt-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Înapoi la subcategorii
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-x-4">
            <Link
              href={`/admin/inventar/${categoryId}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sm:hidden">Înapoi</span>
              <span className="hidden sm:inline">Înapoi</span>
            </Link>
            <div>
              <h2 className="text-sm text-muted-foreground line-clamp-1">
                {subcategory.categoriePrincipala.nume}
              </h2>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 line-clamp-1">
                {subcategory.nume}
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {subcategory.descriere || "Gestionați produsele din această subcategorie"}
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAddProduct} className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Adaugă Produs
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="max-w-md w-full">
        <SearchBar />
      </div>

      {/* List of products */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr,100px,120px,100px,120px] gap-4 p-4 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
          <div>Produs</div>
          <div>Cod</div>
          <div className="text-right">Preț</div>
          <div className="text-right">Stoc</div>
          <div></div>
        </div>
        <div className="divide-y">
          {subcategory.produse.map((produs) => (
            <div
              key={produs.id}
              className="grid grid-cols-[1fr,100px,120px,100px,120px] gap-4 p-4 items-center hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <h3 className="font-medium truncate">{produs.nume}</h3>
                <p className="text-sm text-muted-foreground truncate">{produs.descriere}</p>
              </div>
              <div className="text-sm">{produs.cod}</div>
              <div className="text-right">
                {produs.pretRedus ? (
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-destructive">
                      {produs.pretRedus} MDL
                    </span>
                    <span className="block text-xs text-muted-foreground line-through">
                      {produs.pret} MDL
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium">{produs.pret} MDL</span>
                )}
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-sm font-medium",
                  produs.stoc === 0 ? "text-destructive" :
                  produs.stoc < 5 ? "text-orange-500" :
                  "text-emerald-600"
                )}>
                  {produs.stoc} buc
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditProduct(produs)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteClick(produs)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        categoryId={categoryId}
        subcategoryId={subcategoryId}
        product={selectedProduct}
      />

      <DeleteAlert
        isOpen={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false)
          setProductToDelete(undefined)
        }}
        onConfirm={handleDeleteConfirm}
        title="Șterge produsul"
        description={
          productToDelete
            ? `Ești sigur că vrei să ștergi produsul "${productToDelete.nume}"? Această acțiune nu poate fi anulată.`
            : "Ești sigur că vrei să ștergi acest produs? Această acțiune nu poate fi anulată."
        }
      />
    </div>
  )
}
