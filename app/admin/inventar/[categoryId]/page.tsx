"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CategoriePrincipala, Subcategorie } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"
import SubcategoryDialog from "../components/subcategory-dialog"
import DeleteAlert from "../components/delete-alert"
import SearchBar from "../components/search-bar"

interface CategoryPageProps {
  params: Promise<{
    categoryId: string
  }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter()
  const { categoryId } = React.use(params)
  const [category, setCategory] = useState<CategoriePrincipala & { subcategorii: Subcategorie[] }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategorie>()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/categories/${categoryId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch category")
        }
        const data = await response.json()
        setCategory(data)
      } catch (error) {
        setError("A apărut o eroare la încărcarea categoriei")
        console.error("Error fetching category:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId])

  const handleAddSubcategory = () => {
    setSelectedSubcategory(undefined)
    setIsDialogOpen(true)
  }

  const handleEditSubcategory = (subcategory: Subcategorie) => {
    setSelectedSubcategory(subcategory)
    setIsDialogOpen(true)
  }

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      const response = await fetch(
        `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete subcategory")
      }

      // Update local state
      setCategory((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          subcategorii: prev.subcategorii.filter((sub) => sub.id !== subcategoryId),
        }
      })
    } catch (error) {
      console.error("Error deleting subcategory:", error)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedSubcategory(undefined)
    // Refresh data
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch category")
        }
        const data = await response.json()
        setCategory(data)
      } catch (error) {
        console.error("Error fetching category:", error)
      }
    }
    fetchCategory()
  }

  const handleDeleteConfirm = async () => {
    if (selectedSubcategory) {
      await handleDeleteSubcategory(selectedSubcategory.id)
      setShowDeleteAlert(false)
    }
  }

  if (isLoading) {
    return <div>Se încarcă...</div>
  }

  if (error || !category) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error || "Categoria nu a fost găsită"}</p>
        <Link
          href="/admin/inventar"
          className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-x-1 justify-center mt-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Înapoi la categorii
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:space-y-0 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-x-4">
              <Link
                href="/admin/inventar"
                className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sm:hidden">Înapoi</span>
                <span className="hidden sm:inline">Înapoi</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 line-clamp-1">
                {category.nume}
              </h1>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {category.descriere || "Gestionați subcategoriile și produsele asociate"}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddSubcategory} className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Adaugă Subcategorie
            </Button>
          </div>
        </div>
        <div className="max-w-md w-full">
          <SearchBar />
        </div>
      </div>

      {/* Grid of subcategories */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.subcategorii.map((subcategory) => (
          <div
            key={subcategory.id}
            className="bg-white rounded-lg shadow border p-3 sm:p-4 space-y-3 sm:space-y-4"
          >
            <div>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{subcategory.nume}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {subcategory.descriere || "Fără descriere"}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSubcategory(subcategory)}
                      className="flex-1 sm:flex-initial"
                    >
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editează</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive flex-1 sm:flex-initial"
                      onClick={() => {
                        setSelectedSubcategory(subcategory)
                        setShowDeleteAlert(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Șterge</span>
                    </Button>
                  </div>
                  <Link
                    href={`/admin/inventar/${category.id}/${subcategory.id}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-x-2 justify-center"
                    >
                      <Package className="h-4 w-4" />
                      Produse
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing dialogs */}
      <SubcategoryDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        categoryId={category.id}
        subcategory={selectedSubcategory}
      />

      <DeleteAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteConfirm}
        title="Șterge subcategoria"
        description={`Ești sigur că vrei să ștergi subcategoria "${selectedSubcategory?.nume}"? Această acțiune nu poate fi anulată.`}
      />
    </div>
  )
}
