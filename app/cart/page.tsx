"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Minus, Plus, X, ArrowLeft, Package, Truck, Store, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/contexts/cart-context"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { MorphingText } from "@/components/magicui/morphing-text"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <GridPattern
          squares={[
            [1, 2],
            [3, 3],
            [6, 2],
            [10, 6],
            [15, 6],
            [19, 5],
            [7, 8],
            [5, 14],
            [8, 11],
            [12, 18],
            [18, 14],
            [9, 19],
            [15, 2],
          ]}
          className="opacity-40 [mask-image:radial-gradient(white,transparent)]"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container max-w-7xl py-10 md:py-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 md:mb-12">
          <Link href="/" className="hover:text-primary transition-colors">
            {t("home")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            {t("cart_title")}
          </span>
        </nav>

        {/* Page title */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {totalItems > 0 ? `${totalItems} ${t("items_in_cart")}` : t("cart_empty")}
          </Badge>

          <div className="mb-4 md:mb-6">
            {/* Mobile title */}
            <div className="md:hidden">
              <MorphingText
                texts={[ t("your_shopping_cart")]}
                className="h-12 text-[23pt]"
              />
            </div>

            {/* Desktop title */}
            <div className="hidden md:block">
              <MorphingText
                texts={[t("cart_title"), t("your_shopping_cart"), t("review_your_items")]}
                className="h-16 text-[40pt] lg:text-[50pt]"
              />
            </div>
          </div>


        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 md:py-16">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="h-12 w-12" />
            </div>

            <div className="text-center max-w-md mx-auto mb-8">
              <h2 className="text-xl font-semibold mb-4">{t('cart_empty')}</h2>
              <p className="text-muted-foreground mb-8">
                {t('cart_empty_description')}
              </p>
            </div>

            <ShimmerButton
              className="px-6 py-2.5 text-base font-medium"
              shimmerColor="#00BFFF"
              shimmerSize="0.05em"
              shimmerDuration="3s"
              borderRadius="8px"
              background="rgba(0, 0, 0, 0.9)"
              onClick={() => window.location.href = "/catalog"}
            >
              {t('cart_explore_catalog')}
            </ShimmerButton>
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
                    className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-primary/10 shadow-md hover:shadow-lg transition-all hover:border-primary/30"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={`/catalog/${item.product.subcategorie.categoriePrincipala.id}/${item.product.subcategorie.id}/${item.product.id}`}
                        className="relative aspect-square w-24 md:w-32 flex-shrink-0 overflow-hidden rounded-md bg-accent/50 group"
                      >
                        {item.product.imagini[0] ? (
                          <Image
                            src={item.product.imagini[0]}
                            alt={item.product.nume}
                            fill
                            className="object-cover transition-transform group-hover:scale-110 duration-300"
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
                              <div className="text-xs text-primary mt-1 bg-primary/5 rounded-full px-2 py-0.5 inline-block">
                                {item.product.creditOption.months} {t('cart_monthly_payment')} {item.product.creditOption.monthlyPayment.toLocaleString()} {t('cart_per_month')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/catalog" className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {t('cart_continue_shopping')}
                </Link>
              </div>
            </div>

            <div>
              <Card className="bg-white/80 backdrop-blur-sm border border-primary/10 shadow-lg sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle>{t('cart_order_summary')}</CardTitle>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cart_products')} ({totalItems})</span>
                      <span>{totalPrice.toLocaleString()} MDL</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cart_delivery')}</span>
                      <span className="text-green-600">{t('cart_free')}</span>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('cart_total')}</span>
                      <span className="text-primary">{totalPrice.toLocaleString()} MDL</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-0">
                  <ShimmerButton
                    className="w-full py-3"
                    shimmerColor="#00BFFF"
                    shimmerSize="0.05em"
                    shimmerDuration="3s"
                    borderRadius="8px"
                    background="rgba(0, 0, 0, 0.9)"
                    onClick={() => window.location.href = "/checkout"}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        {t('cart_processing')}
                      </div>
                    ) : (
                      t('cart_checkout')
                    )}
                  </ShimmerButton>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3 text-primary" />
                      <span>{t('cart_free_delivery')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Store className="h-3 w-3 text-primary" />
                      <span>{t('cart_payment_options')}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
