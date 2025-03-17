"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Heart, ShoppingCart, ArrowRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/app/components/ui/use-toast"
import { useCart } from "@/app/contexts/cart-context"
import { useLanguage } from "@/lib/language-context"

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
}

interface ProductCardProps {
  product: Product
  onAddToFavorites?: (product: Product) => void
  disableLink?: boolean
}

function ProductCard({ product, onAddToFavorites, disableLink = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()
  const { addItem } = useCart()
  const { t } = useLanguage()

  // Debug logging for category data
  console.log(`ProductCard ${product.id} category data:`, {
    categoryName: product.subcategorie?.categoriePrincipala?.nume,
    subcategoryName: product.subcategorie?.nume,
    hasSubcategory: !!product.subcategorie,
    hasMainCategory: !!product.subcategorie?.categoriePrincipala
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast({
      title: t?.('cart_added_title') || "Adăugat în coș",
      description: t?.('cart_added_description') || "Produsul a fost adăugat în coșul tău",
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFavorite(!isFavorite)
    if (onAddToFavorites) {
      onAddToFavorites(product)
      toast({
        title: isFavorite ? t?.('favorites_removed_title') || "Eliminat din favorite" : t?.('favorites_added_title') || "Adăugat la favorite",
        description: isFavorite
          ? t?.('favorites_removed_description') || "Produsul a fost eliminat din lista ta de favorite"
          : t?.('favorites_added_description') || "Produsul a fost adăugat în lista ta de favorite",
      })
    }
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group h-full"
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-all duration-300
                 hover:shadow-lg border border-gray-100"
      >
        {/* Quick actions - Desktop with improved animations */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute right-4 top-4 z-20 hidden md:flex flex-col gap-2"
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -20 }}
              transition={{
                duration: 0.2,
                staggerChildren: 0.05,
                delayChildren: 0.05
              }}
            >
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "h-9 w-9 rounded-full shadow-lg transition-all",
                    isFavorite ? "bg-primary text-white hover:bg-dark-blue" : "backdrop-blur-sm bg-white/80 hover:bg-dark-blue hover:text-white"
                  )}
                  onClick={handleToggleFavorite}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                </Button>
              </motion.div>

              {product.stoc > 0 && (
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-white/80 hover:bg-dark-blue hover:text-white"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions - Mobile with improved styling */}
        <div className="absolute right-3 top-3 z-20 flex md:hidden">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-10 w-10 rounded-full shadow-lg transition-all backdrop-blur-sm",
                isFavorite
                  ? "bg-primary text-white hover:bg-dark-blue"
                  : "bg-white/90 hover:bg-dark-blue hover:text-white"
              )}
              onClick={handleToggleFavorite}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>
          </motion.div>
        </div>

        {/* Tags with enhanced animations */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {product.pretRedus && product.pretRedus < product.pret && (
            <>
              {(() => {
                const discountPercentage = Math.round(((product.pret - product.pretRedus) / product.pret) * 100);
                return discountPercentage > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm"
                  >
                    -{discountPercentage}%
                  </motion.div>
                ) : null;
              })()}
            </>
          )}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-full bg-black/80 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white shadow-sm"
          >
            {product.subcategorie?.categoriePrincipala?.nume
              ? product.subcategorie.categoriePrincipala.nume
              : product.subcategorie?.nume
                ? product.subcategorie.nume
                : 'Categorie'}
          </motion.div>
          {product.stoc < 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium shadow-sm",
                product.stoc === 0
                  ? "bg-gray-100 text-gray-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {product.stoc === 0 ? "Stoc epuizat" : `${product.stoc} rămase`}
            </motion.div>
          )}
        </div>

        {/* Image container with static image (no scale effect) */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          {product.imagini?.[0] ? (
            <div className="w-full h-full relative">
              <Image
                src={product.imagini[0]}
                alt={product.nume}
                fill
                className="object-cover transition-all duration-500 ease-in-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Preview button in the middle of the image (desktop only) */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center hidden md:flex"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white hover:text-dark-blue transition-all shadow-md border border-gray-200 font-medium px-4"
                  >
                    <span>{t('preview_product') || "Previzualizare"}</span>
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content with improved animations */}
        <div className="flex flex-1 flex-col p-4 pb-16 md:pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-2"
          >
            <div className="text-xs text-primary font-medium mb-1">
              {product.subcategorie?.categoriePrincipala?.nume
                ? product.subcategorie.categoriePrincipala.nume
                : product.subcategorie?.nume
                  ? product.subcategorie.nume
                  : 'Subcategorie'}
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-dark-blue transition-colors duration-300">
              {product.nume}
            </h3>
          </motion.div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium">
                Cod: {product.cod}
              </div>
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-dark-blue hidden md:block"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </div>

            <div className="flex items-end justify-between border-t pt-3">
              <div>
                {product.pretRedus ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-dark-blue">
                      {product.pretRedus} MDL
                    </div>
                    <div className="text-sm text-muted-foreground line-through">
                      {product.pret} MDL
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-900">
                    {product.pret} MDL
                  </div>
                )}
              </div>

              {/* Add to cart button - always visible on mobile */}
              {product.stoc > 0 && (
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  className="rounded-full h-9 bg-dark-blue text-white hover:bg-dark-blue/90 hidden sm:flex md:hidden"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  <span className="text-xs">Adaugă</span>
                </Button>
              )}

              {product.stoc > 0 && (
                <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hidden md:block">
                  În stoc
                </div>
              )}
            </div>
          </div>

          {/* Cart button bottom bar - always visible with hover effect */}
          {product.stoc > 0 && (
            <div className="absolute bottom-0 left-0 right-0 md:block hidden z-10">
              <div className="w-full bg-dark-blue/90 hover:bg-dark-blue transition-all hover:shadow-lg h-12 flex items-center justify-center text-white group">
                <Button
                  onClick={handleAddToCart}
                  variant="ghost"
                  className="w-full h-full text-white hover:bg-dark-blue/90 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform">{t?.('cart_add_to_cart') || "Adaugă în coș"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return disableLink ? content : (
    <Link
      href={`/catalog/${product.subcategorie?.categoriePrincipala?.id || 'all'}/${product.subcategorie?.id || 'all'}/${product.id}`}
      className="block h-full"
    >
      {content}
    </Link>
  );
}

function ProductCardCompact({ product, onAddToFavorites, disableLink = false }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const { addItem } = useCart()
  const { t } = useLanguage()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast({
      title: t?.('cart_added_title') || "Adăugat în coș",
      description: t?.('cart_added_description') || "Produsul a fost adăugat în coșul tău",
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFavorite(!isFavorite)
    if (onAddToFavorites) {
      onAddToFavorites(product)
      toast({
        title: isFavorite ? t?.('favorites_removed_title') || "Eliminat din favorite" : t?.('favorites_added_title') || "Adăugat la favorite",
        description: isFavorite
          ? t?.('favorites_removed_description') || "Produsul a fost eliminat din lista ta de favorite"
          : t?.('favorites_added_description') || "Produsul a fost adăugat în lista ta de favorite",
      })
    }
  }

  const content = (
    <motion.div
      className="group flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image with minimal hover effect */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md group-hover:shadow-md transition-all duration-300">
        {product.imagini?.[0] ? (
          <div className="w-full h-full">
            <Image
              src={product.imagini[0]}
              alt={product.nume}
              fill
              className="object-cover transition-all duration-300"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-dark-blue transition-colors">
          {product.nume}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          {product.pretRedus ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-dark-blue">
                {product.pretRedus} MDL
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {product.pret} MDL
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold">
              {product.pret} MDL
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 rounded-full",
              isFavorite ? "text-primary hover:text-dark-blue" : "hover:text-dark-blue"
            )}
            onClick={handleToggleFavorite}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </motion.div>
        {product.stoc > 0 && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-dark-blue hover:text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return disableLink ? content : (
    <Link
      href={`/catalog/${product.subcategorie?.categoriePrincipala?.id || 'all'}/${product.subcategorie?.id || 'all'}/${product.id}`}
      className="block"
    >
      {content}
    </Link>
  );
}

export { ProductCard, ProductCardCompact }
