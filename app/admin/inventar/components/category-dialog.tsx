import React from "react"
import { CategoriePrincipala } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CategoryForm from "./category-form"

interface CategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  category?: CategoriePrincipala
}

export default function CategoryDialog({
  isOpen,
  onClose,
  category,
}: CategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editează categoria" : "Adaugă o categorie nouă"}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm category={category} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
