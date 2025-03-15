"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Minus, Plus, X, ArrowLeft, Package, Truck, Store, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/contexts/cart-context"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()

  const handleCheckout = () => {
    setIsSubmitting(true)
    // This will be handled by the Link component's navigation
    setTimeout(() => setIsSubmitting(false), 500)
  }

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">{t('cart_title')}</h1>
        <Link href="/catalog" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('cart_continue_shopping')}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-muted-foreground">
            <ShoppingCart className="h-12 w-12" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{t('cart_empty')}</h2>
          <p className="mb-8 max-w-md text-center text-muted-foreground">
            {t('cart_empty_description')}
          </p>
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/catalog">
              {t('cart_explore_catalog')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-gray-200 transition-colors"
                >
                  <Link
                    href={`/catalog/${item.product.subcategorie.categoriePrincipala.id}/${item.product.subcategorie.id}/${item.product.id}`}
                    className="relative aspect-square w-24 flex-shrink-0 overflow-hidden rounded-md bg-accent/50"
                  >
                    {item.product.imagini[0] ? (
                      <Image
                        src={item.product.imagini[0]}
                        alt={item.product.nume}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100px, 150px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <Link
                        href={`/catalog/${item.product.subcategorie.categoriePrincipala.id}/${item.product.subcategorie.id}/${item.product.id}`}
                        className="font-medium hover:text-primary transition-colors">
                        {item.product.nume}
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {t('cart_product_code')}: {item.product.cod}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-md"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-md"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">
                          {((item.product.pretRedus || item.product.pret) * item.quantity).toLocaleString()} MDL
                        </div>
                        {item.product.pretRedus && (
                          <div className="text-sm text-muted-foreground line-through">
                            {(item.product.pret * item.quantity).toLocaleString()} MDL
                          </div>
                        )}
                        {item.product.creditOption && (
                          <div className="text-sm text-primary mt-1">
                            {item.product.creditOption.months} {t('cart_monthly_payment')} {item.product.creditOption.monthlyPayment.toLocaleString()} {t('cart_per_month')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-semibold">{t('cart_order_summary')}</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart_products')} ({totalItems})</span>
                    <span>{totalPrice.toLocaleString()} MDL</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart_delivery')}</span>
                    <span>{t('cart_free')}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold">
                  <span>{t('cart_total')}</span>
                  <span>{totalPrice.toLocaleString()} MDL</span>
                </div>
              </div>

              <div className="border-t bg-accent/30 p-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  asChild
                >
                  <Link href="/checkout">
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        {t('cart_processing')}
                      </div>
                    ) : (
                      t('cart_checkout')
                    )}
                  </Link>
                </Button>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    <span>{t('cart_free_delivery')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Store className="h-3 w-3" />
                    <span>{t('cart_payment_options')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
