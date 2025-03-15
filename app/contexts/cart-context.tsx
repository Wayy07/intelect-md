"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

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
  creditOption?: {
    months: number
    monthlyPayment: number
  }
}

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render (client-side only)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
  }, [])

  // Save to localStorage when cart changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [items])

  const addItem = (product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id)

      if (existingItem) {
        // If product already exists, increase quantity
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Otherwise add new item with quantity 1
        return [...prevItems, { product, quantity: 1 }]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  // Calculate total items count
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  // Calculate total price
  const totalPrice = items.reduce((total, item) => {
    const price = item.product.pretRedus || item.product.pret
    return total + (price * item.quantity)
  }, 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
