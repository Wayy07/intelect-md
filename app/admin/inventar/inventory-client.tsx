"use client"

import React, { useState } from "react"
import { PrismaClient, CategoriePrincipala } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CategoryCard from "./components/category-card"
import CategoryDialog from "./components/category-dialog"
import SearchBar from "./components/search-bar"

async function getCategories() {
  const response = await fetch("/api/categories")
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  return response.json()
}

export default function InventoryClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoriePrincipala | undefined>()
  const [categories, setCategories] = useState<CategoriePrincipala[]>([])

  React.useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const handleAddCategory = () => {
    setSelectedCategory(undefined)
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: CategoriePrincipala) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to delete category")
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    } catch (error) {
      console.error("Error deleting category:", error)
      // Re-fetch categories to ensure UI is in sync with server state
      getCategories().then(setCategories)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedCategory(undefined)
    getCategories().then(setCategories)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:space-y-0 space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Inventar
            </h1>
            <p className="text-sm text-gray-600">
              Gestionați categoriile și produsele din inventar
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddCategory} className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Adaugă Categorie
            </Button>
          </div>
        </div>
        <div className="max-w-md w-full">
          <SearchBar />
        </div>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => handleEditCategory(category)}
            onDelete={() => handleDeleteCategory(category.id)}
          />
        ))}
      </div>

      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        category={selectedCategory}
      />
    </div>
  )
}
