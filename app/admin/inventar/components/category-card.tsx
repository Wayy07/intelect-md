"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CategoriePrincipala } from "@prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Package } from "lucide-react"
import DeleteAlert from "./delete-alert"

interface CategoryCardProps {
  category: CategoriePrincipala
  onEdit: () => void
  onDelete: () => void
}

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleDelete = () => {
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = () => {
    onDelete()
    setShowDeleteAlert(false)
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{category.nume}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.descriere || "Fără descriere"}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-x-2">
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Link href={`/admin/inventar/${category.id}`}>
            <Button variant="outline" className="flex items-center gap-x-2">
              <Package className="h-4 w-4" />
              Subcategorii
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <DeleteAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteConfirm}
        title="Șterge categoria"
        description={`Ești sigur că vrei să ștergi categoria "${category.nume}"? Această acțiune nu poate fi anulată.`}
      />
    </>
  )
}
