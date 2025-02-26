"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Subcategorie } from "@prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Package } from "lucide-react"
import DeleteAlert from "./delete-alert"

interface SubcategoryCardProps {
  subcategory: Subcategorie
  categoryId: string
  onEdit?: () => void
  onDelete?: () => void
}

export default function SubcategoryCard({
  subcategory,
  categoryId,
  onEdit,
  onDelete,
}: SubcategoryCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleDelete = () => {
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = () => {
    onDelete?.()
    setShowDeleteAlert(false)
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{subcategory.nume}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {subcategory.descriere || "Fără descriere"}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-x-2">
            {onEdit && (
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Link href={`/admin/inventar/${categoryId}/${subcategory.id}`}>
            <Button variant="outline" className="flex items-center gap-x-2">
              <Package className="h-4 w-4" />
              Produse
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <DeleteAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDeleteConfirm}
        title="Șterge subcategoria"
        description={`Ești sigur că vrei să ștergi subcategoria "${subcategory.nume}"? Această acțiune nu poate fi anulată.`}
      />
    </>
  )
}
