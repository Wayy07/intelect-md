"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Heart,
  ShoppingCart,
  Eye,
  Check,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { useCart } from "@/app/contexts/cart-context";
import { useLanguage } from "@/lib/language-context";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus?: number | null;
  imagini: string[];
  stoc: number;
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    };
  };
  descriere?: string;
  specificatii?: Record<string, string>;
}

interface ProductCardProps {
  product: Product;
  onAddToFavorites?: (product: Product) => void;
  disableLink?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

// Modern Desktop Product Card
function ProductCard({
  product,
  onAddToFavorites,
  disableLink = false,
  isFavorite,
  onFavoriteToggle,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();

  const discount = product.pretRedus
    ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddingToCart(true);

    // Simulate loading for better UX
    setTimeout(() => {
      addItem(product);
      setIsAddingToCart(false);
      toast({
        title: t?.("cart_added_title") || "Adăugat în coș",
        description:
          t?.("cart_added_description") ||
          "Produsul a fost adăugat în coșul tău",
      });
    }, 300);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
    if (onAddToFavorites) {
      onAddToFavorites(product);
      toast({
        title: isFavorite
          ? t?.("favorites_removed_title") || "Eliminat din favorite"
          : t?.("favorites_added_title") || "Adăugat la favorite",
        description: isFavorite
          ? t?.("favorites_removed_description") ||
            "Produsul a fost eliminat din lista ta de favorite"
          : t?.("favorites_added_description") ||
            "Produsul a fost adăugat în lista ta de favorite",
      });
    }
  };

  const content = (
    <div
      className="group h-full relative flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white transition-all duration-300 hover:shadow-md 3xl:max-w-[380px] 3xl:mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute left-0 top-0 z-10 flex flex-col items-start gap-1.5">
        {discount > 0 && (
          <div className="transform-gpu rounded-r-md bg-gradient-to-r from-red-600 to-red-500 pl-2 pr-3 py-1 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 translate-y-4 group-hover:translate-y-5 transition-transform">
            <span>-{discount}%</span>
          </div>
        )}
        <div
          className="transform-gpu rounded-r-md bg-gradient-to-r from-blue-600 to-blue-500 pl-1 pr-3 py-1 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 translate-y-4 group-hover:translate-y-5 transition-transform duration-300"
          style={{ transitionDelay: "50ms" }}
        >
          <span className="inline-flex items-center justify-center bg-white text-blue-600 rounded-full h-5 w-5 text-[10px] font-bold">
            0%
          </span>
          <span>8 {t?.("months") || "months"}</span>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden pt-[80%] bg-white">
        {/* Heart icon at bottom-left of image */}
        <div className="absolute bottom-2 left-2 z-20">
          <button
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm",
              isFavorite
                ? "bg-primary/10 text-primary"
                : "bg-white/90 text-gray-500 hover:bg-gray-100"
            )}
            onClick={handleToggleFavorite}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className="h-5 w-5"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        {product.imagini?.[0] ? (
          <>
            <Image
              src={product.imagini[0]}
              alt={product.nume}
              fill
              className={cn(
                "object-contain p-2 transition-transform duration-500",
                isHovered && "scale-[1.05]"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />

            {/* Quick View Button */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-gray-50"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotateY: [0, 360] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </motion.div>
                    {t?.("quick_view") || "Quick View"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Divider line */}
      <div className="h-px w-full bg-gray-100"></div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3">
        {/* Category */}
        <div className="text-xs text-gray-500 font-medium mb-1 truncate">
          {product.subcategorie?.categoriePrincipala?.nume ||
            product.subcategorie?.nume ||
            ""}
        </div>

        {/* Product Title */}
        <h3 className="line-clamp-2 text-lg font-medium text-gray-800 min-h-[2.5rem]">
          {product.nume}
        </h3>

        {/* Description Preview */}
        {product.descriere && (
          <p className="line-clamp-2 text-xs text-gray-500 mt-1 mb-2">
            {product.descriere}
          </p>
        )}

        {/* Price section */}
        <div className="flex items-center gap-2 mt-auto">
          {product.pretRedus ? (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                {product.pretRedus} MDL
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-400 line-through">
                  {product.pret} MDL
                </span>
                <span className="text-xs font-medium text-red-500">
                  -{discount}%
                </span>
              </div>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {product.pret} MDL
            </span>
          )}
        </div>

        {/* Add Shimmer Button */}
        <div className="mt-3">
          <ShimmerButton
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(e as React.MouseEvent);
            }}
            disabled={product.stoc === 0}
            className="w-full shadow-sm"
            borderRadius="8px"
          >
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {product.stoc === 0
                ? t?.("out_of_stock") || "Out of stock"
                : t?.("add_to_cart") || "Add to cart"}
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );

  return disableLink ? (
    content
  ) : (
    <Link
      href={`/catalog/${
        product.subcategorie?.categoriePrincipala?.id || "all"
      }/${product.subcategorie?.id || "all"}/${product.id}`}
      className="block h-full"
    >
      {content}
    </Link>
  );
}

// Modern Compact Card for Mobile
function ProductCardCompact({
  product,
  onAddToFavorites,
  disableLink = false,
  isFavorite,
  onFavoriteToggle,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();

  const discount = product.pretRedus
    ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);

    // Simulate loading for better UX
    setTimeout(() => {
      addItem(product);
      setIsAddingToCart(false);
      toast({
        title: t?.("cart_added_title") || "Adăugat în coș",
        description:
          t?.("cart_added_description") ||
          "Produsul a fost adăugat în coșul tău",
      });
    }, 300);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
    if (onAddToFavorites) {
      onAddToFavorites(product);
      toast({
        title: isFavorite
          ? t?.("favorites_removed_title") || "Eliminat din favorite"
          : t?.("favorites_added_title") || "Adăugat la favorite",
        description: isFavorite
          ? t?.("favorites_removed_description") ||
            "Produsul a fost eliminat din lista ta de favorite"
          : t?.("favorites_added_description") ||
            "Produsul a fost adăugat în lista ta de favorite",
      });
    }
  };

  const content = (
    <div
      className="relative flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm h-full 3xl:max-w-[380px] 3xl:mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top ribbon - moved both discount and credit badges */}
      <div className="absolute left-0 top-4 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <div className="transform-gpu rounded-r-md bg-gradient-to-r from-red-600 to-red-500 pl-2 pr-3 py-1 text-xs font-semibold text-white shadow-md inline-flex items-center justify-center">
            <span>-{discount}%</span>
          </div>
        )}
        <div className="transform-gpu rounded-r-md bg-gradient-to-r from-blue-600 to-blue-500 pl-1 pr-3 py-1 text-xs font-semibold text-white shadow-md flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center bg-white text-blue-600 rounded-full h-5 w-5 text-[10px] font-bold">
            0%
          </span>
          <span>8 {t?.("months") || "months"}</span>
        </div>
      </div>

      {/* New tag or trending */}
      <div className="absolute right-2 top-2 z-10">
        {false && (
          <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-100">
            <TrendingUp className="h-3 w-3" />
            <span>Popular</span>
          </div>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.imagini?.[0] ? (
          <Image
            src={product.imagini[0]}
            alt={product.nume}
            fill
            className={cn(
              "object-contain p-2 transition-transform duration-500",
              isHovered && "scale-[1.05]"
            )}
            sizes="(max-width: 768px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>

      {/* Divider line */}
      <div className="h-px w-full bg-gray-100"></div>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-3">
        {/* Category & Title */}
        <div className="mb-2">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-800 min-h-[2.5rem]">
            {product.nume}
          </h3>

          {/* Description Preview */}
          {product.descriere && (
            <p className="line-clamp-1 text-xs text-gray-500 mt-1">
              {product.descriere}
            </p>
          )}
        </div>

        {/* Price Row */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.pretRedus ? (
              <>
                <span className="text-base font-bold text-primary">
                  {product.pretRedus} MDL
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 line-through">
                    {product.pret} MDL
                  </span>
                  <span className="text-xs font-medium text-red-500">
                    -{discount}%
                  </span>
                </div>
              </>
            ) : (
              <span className="text-base font-bold text-gray-900">
                {product.pret} MDL
              </span>
            )}
          </div>
        </div>

        {/* Add Shimmer Button */}
        <div className="mt-3">
          <ShimmerButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e as React.MouseEvent);
            }}
            disabled={product.stoc === 0}
            className="w-full shadow-sm"
            borderRadius="8px"
          >
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {product.stoc === 0
                ? t?.("out_of_stock") || "Out of stock"
                : t?.("add_to_cart") || "Add to cart"}
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );

  return disableLink ? (
    content
  ) : (
    <Link
      href={`/catalog/${
        product.subcategorie?.categoriePrincipala?.id || "all"
      }/${product.subcategorie?.id || "all"}/${product.id}`}
      className="block h-full"
    >
      {content}
    </Link>
  );
}

// Small search result card for search dropdowns
function SearchResultCard({
  product,
  onClick,
}: {
  product: Product;
  onClick?: () => void;
}) {
  const { t } = useLanguage();

  // Calculate discount if applicable
  const discount = product.pretRedus
    ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
    : 0;

  return (
    <div
      className="flex items-center p-2 gap-3 hover:bg-accent/50 rounded-md transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Product image */}
      <div className="relative h-12 w-12 flex-shrink-0 bg-accent/30 rounded-md overflow-hidden">
        {product.imagini?.[0] ? (
          <Image
            src={product.imagini[0]}
            alt={product.nume}
            fill
            className="object-contain p-1"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        {/* Title with one line truncation */}
        <h4 className="text-sm font-medium leading-tight text-foreground truncate">
          {product.nume}
        </h4>

        {/* Category */}
        <p className="text-xs text-muted-foreground truncate">
          {product.subcategorie.categoriePrincipala.nume} /{" "}
          {product.subcategorie.nume}
        </p>

        {/* Price */}
        <div className="flex items-center gap-1.5">
          {product.pretRedus ? (
            <>
              <span className="text-sm font-semibold text-primary">
                {product.pretRedus} MDL
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {product.pret} MDL
              </span>
              {discount > 0 && (
                <span className="text-xs font-medium text-red-500">
                  -{discount}%
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {product.pret} MDL
            </span>
          )}
        </div>
      </div>

      {/* Stock badge */}
      <div className="flex-shrink-0">
        {product.stoc > 0 ? (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {t?.("in_stock") || "In Stock"}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            {t?.("out_of_stock") || "Out of Stock"}
          </span>
        )}
      </div>
    </div>
  );
}

// Completely redesign the button styling and animation
const buttonStyles = `
button {
 position: relative;
 display: inline-block;
 cursor: pointer;
 outline: none;
 border: 0;
 vertical-align: middle;
 text-decoration: none;
 background: transparent;
 padding: 0;
 font-size: inherit;
 font-family: inherit;
}

button.learn-more {
 width: 100%;
 height: auto;
}

button.learn-more .circle {
 transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
 position: relative;
 display: block;
 margin: 0;
 width: 3rem;
 height: 3rem;
 background: var(--primary, #282936);
 border-radius: 1.625rem;
}

button.learn-more .circle .icon {
 transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
 position: absolute;
 top: 0;
 bottom: 0;
 margin: auto;
 background: #fff;
}

button.learn-more .circle .icon.arrow {
 transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
 left: 0.625rem;
 width: 1.125rem;
 height: 0.125rem;
 background: none;
}

button.learn-more .circle .icon.arrow::before {
 position: absolute;
 content: "";
 top: -0.29rem;
 right: 0.0625rem;
 width: 0.625rem;
 height: 0.625rem;
 border-top: 0.125rem solid #fff;
 border-right: 0.125rem solid #fff;
 transform: rotate(45deg);
}

button.learn-more .button-text {
 transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 padding: 0.75rem 0;
 margin: 0 0 0 1.85rem;
 color: var(--gray-900, #282936);
 font-weight: 700;
 line-height: 1.6;
 text-align: center;
 text-transform: uppercase;
}

button.learn-more:hover .circle {
 width: 100%;
}

button.learn-more:hover .circle .icon.arrow {
 background: #fff;
 transform: translate(1rem, 0);
}

button.learn-more:hover .button-text {
 color: #fff;
}

button.learn-more:disabled {
 opacity: 0.6;
 cursor: not-allowed;
}
`;

// Add the styles to the document when the component is mounted
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = buttonStyles;
  if (!document.head.querySelector("style#product-card-buttons")) {
    styleTag.id = "product-card-buttons";
    document.head.appendChild(styleTag);
  }
}

export { ProductCard, ProductCardCompact, SearchResultCard };
