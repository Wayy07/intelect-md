import React from "react"
import { Subcategorie } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SubcategoryForm from "./subcategory-form"

interface SubcategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  subcategory?: Subcategorie
}

export default function SubcategoryDialog({
  isOpen,
  onClose,
  categoryId,
  subcategory,
}: SubcategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {subcategory ? "Editează subcategoria" : "Adaugă o subcategorie nouă"}
          </DialogTitle>
        </DialogHeader>
        <SubcategoryForm
          categoryId={categoryId}
          subcategory={subcategory}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
