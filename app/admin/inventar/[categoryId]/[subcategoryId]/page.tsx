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

      {/* Grid of products */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subcategory.produse.map((produs) => (
          <div
            key={produs.id}
            className="bg-white rounded-lg shadow border p-3 sm:p-4 space-y-3 sm:space-y-4"
          >
            {produs.imagini[0] && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={produs.imagini[0]}
                  alt={produs.nume}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"
                  }}
                />
              </div>
            )}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{produs.nume}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{produs.descriere}</p>
                </div>
                <p className="text-sm font-medium shrink-0">Cod: {produs.cod}</p>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-sm font-medium">
                        {produs.pretRedus ? (
                          <>
                            <span className="text-destructive font-bold">
                              {produs.pretRedus} MDL
                            </span>
                            <span className="ml-2 text-gray-500 line-through">
                              {produs.pret} MDL
                            </span>
                            <span className="ml-2 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                              -{Math.round(((produs.pret - produs.pretRedus) / produs.pret) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span>{produs.pret} MDL</span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Stoc: {produs.stoc} buc.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(produs)}
                      className="flex-1 sm:flex-initial"
                    >
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editează</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive flex-1 sm:flex-initial"
                      onClick={() => handleDeleteClick(produs)}
                    >
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Șterge</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
