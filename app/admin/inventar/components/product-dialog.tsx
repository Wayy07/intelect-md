"use client"

import React from "react"
import { Produs } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ProductForm from "./product-form"

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  subcategoryId: string
  product?: Produs
}

export default function ProductDialog({
  isOpen,
  onClose,
  categoryId,
  subcategoryId,
  product,
}: ProductDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editează produsul" : "Adaugă un produs nou"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          product={product}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
