"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Heart, ShoppingCart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/app/components/ui/use-toast"
import { useCart } from "@/app/contexts/cart-context"

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
      title: "Adăugat în coș",
      description: "Produsul a fost adăugat în coșul tău",
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFavorite(!isFavorite)
    if (onAddToFavorites) {
      onAddToFavorites(product)
      toast({
        title: isFavorite ? "Eliminat din favorite" : "Adăugat la favorite",
        description: isFavorite
          ? "Produsul a fost eliminat din lista ta de favorite"
          : "Produsul a fost adăugat în lista ta de favorite",
      })
    }
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group h-full"
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-all duration-300
                 hover:shadow-xl hover:shadow-primary/10 border border-gray-100"
      >
        {/* Quick actions - Desktop */}
        <motion.div
          className="absolute right-3 top-3 z-20 hidden md:flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
        >
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-8 w-8 rounded-full shadow-lg transition-colors",
              isFavorite && "bg-primary text-white hover:bg-primary/80"
            )}
            onClick={handleToggleFavorite}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          {product.stoc > 0 && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-lg hover:bg-primary hover:text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </motion.div>

        {/* Quick actions - Mobile */}
        <div className="absolute right-3 top-3 z-20 flex md:hidden flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg transition-colors backdrop-blur-sm",
              isFavorite
                ? "bg-primary text-white hover:bg-primary/80"
                : "bg-white/90 hover:bg-white"
            )}
            onClick={handleToggleFavorite}
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          {product.stoc > 0 && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full shadow-lg bg-white/90 hover:bg-primary hover:text-white backdrop-blur-sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Tags */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {product.pretRedus && product.pretRedus < product.pret && (
            <>
              {(() => {
                const discountPercentage = Math.round(((product.pret - product.pretRedus) / product.pret) * 100);
                return discountPercentage > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white"
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
            className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white"
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
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                product.stoc === 0
                  ? "bg-gray-100 text-gray-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {product.stoc === 0 ? "Stoc epuizat" : `${product.stoc} rămase`}
            </motion.div>
          )}
        </div>

        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          {product.imagini?.[0] ? (
            <Image
              src={product.imagini[0]}
              alt={product.nume}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
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
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
              {product.nume}
            </h3>
          </motion.div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium">
                Cod: {product.cod}
              </div>
              <motion.div
                animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary hidden md:block"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </div>

            <div className="flex items-end justify-between border-t pt-3">
              <div>
                {product.pretRedus ? (
                  <div className="space-y-1">
                    <motion.div
                      className="text-lg font-bold text-primary"
                      animate={{ scale: isHovered ? 1.05 : 1 }}
                    >
                      {product.pretRedus} MDL
                    </motion.div>
                    <div className="text-sm text-muted-foreground line-through">
                      {product.pret} MDL
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="text-lg font-bold text-gray-900"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                  >
                    {product.pret} MDL
                  </motion.div>
                )}
              </div>

              {product.stoc > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hidden md:block"
                >
                  În stoc
                </motion.div>
              )}
            </div>
          </div>
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
  const { toast } = useToast()
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast({
      title: "Adăugat în coș",
      description: "Produsul a fost adăugat în coșul tău",
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFavorite(!isFavorite)
    if (onAddToFavorites) {
      onAddToFavorites(product)
      toast({
        title: isFavorite ? "Eliminat din favorite" : "Adăugat la favorite",
        description: isFavorite
          ? "Produsul a fost eliminat din lista ta de favorite"
          : "Produsul a fost adăugat în lista ta de favorite",
      })
    }
  }

  const content = (
    <div className="group flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg transition-colors">
      {/* Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
        {product.imagini?.[0] ? (
          <Image
            src={product.imagini[0]}
            alt={product.nume}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {product.nume}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          {product.pretRedus ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">
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
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 rounded-full",
            isFavorite && "text-primary hover:text-primary/80"
          )}
          onClick={handleToggleFavorite}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </Button>
        {product.stoc > 0 && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
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
