"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Eye,
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
  disableLink?: boolean;
  hideDiscount?: boolean;
  onImageError?: (productId: string, imageUrl: string) => void;
  getValidImageUrl?: (product: Product) => string;
}

// Modern Desktop Product Card
function ProductCard({
  product,
  disableLink = false,
  hideDiscount = false,
  onImageError,
  getValidImageUrl,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();

  // Calculate discount only if pretRedus exists AND is less than pret
  const discount = hideDiscount ? 0 : (
    product.pretRedus !== undefined &&
    product.pretRedus !== null &&
    product.pret !== undefined &&
    product.pret !== null &&
    product.pretRedus < product.pret
      ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
      : 0
  );

  // Get the image URL - use getValidImageUrl function if provided, otherwise use first image
  const imageUrl = getValidImageUrl ? getValidImageUrl(product) : product.imagini[0];

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

  const content = (
    <div
      className="group h-full relative flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 3xl:max-w-[380px] 3xl:mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute left-0 top-0 z-10 flex flex-col items-start gap-1.5">
        {!hideDiscount && discount > 0 && (
          <div className="transform-gpu rounded-r-md bg-gradient-to-r from-red-600 to-red-500 pl-2 pr-3 py-1 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 translate-y-4 group-hover:translate-y-5 transition-transform">
            <span>-{discount}%</span>
          </div>
        )}
        {/* Only show credit badge for products with price above 1000 lei */}
        {(product.pret !== undefined && product.pret !== null && product.pret >= 1000) && (
          <div
            className="transform-gpu rounded-r-md bg-gradient-to-r from-primary to-primary/80 pl-1 pr-3 py-1 text-xs font-semibold text-white shadow-md flex items-center gap-1.5 translate-y-4 group-hover:translate-y-5 transition-transform duration-300"
            style={{ transitionDelay: "50ms" }}
          >
            <span className="inline-flex items-center justify-center bg-white text-primary rounded-full h-5 w-5 text-[10px] font-bold">
              0%
            </span>
            <span>8 {t?.("months") || "months"}</span>
          </div>
        )}
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden pt-[80%] bg-white/80">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={product.nume || "Product image"}
              fill
              className={cn(
                "object-contain p-2 transition-transform duration-500",
                isHovered ? "scale-[1.08]" : "scale-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onError={(e) => {
                console.log(`Image failed to load: ${imageUrl}`);
                const imgElement = e.currentTarget as HTMLImageElement;
                imgElement.src = "https://placehold.co/400x400/eee/999?text=Image+Unavailable";
                if (onImageError) {
                  onImageError(product.id, imageUrl);
                }
              }}
            />

            {/* Quick View Button */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-white border border-primary/10"
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
                      <Eye className="h-4 w-4 text-primary" />
                    </motion.div>
                    {t?.("quick_view") || "Quick View"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Divider line */}
      <div className="h-px w-full bg-gray-100"></div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <div className="text-xs text-gray-500 font-medium mb-1 truncate">
          {(product.subcategorie?.categoriePrincipala?.nume && product.subcategorie?.categoriePrincipala?.nume !== "")
            ? product.subcategorie.categoriePrincipala.nume
            : (product.subcategorie?.nume && product.subcategorie?.nume !== "")
              ? product.subcategorie.nume
              : t?.("category_unknown") || "Unknown category"}
        </div>

        {/* Product Title */}
        <h3 className="line-clamp-2 text-lg font-medium text-gray-800 group-hover:text-primary transition-colors duration-300 min-h-[3rem] mb-2">
          {product.nume || t?.("product_unknown") || "Unknown product"}
        </h3>

        {/* Description Preview */}
        {product.descriere && (
          <p className="line-clamp-2 text-xs text-gray-500 mt-1 mb-2 min-h-[2rem]">
            {product.descriere}
          </p>
        )}

        {/* Price section */}
        <div className="flex items-center gap-2 mt-auto">
          {!hideDiscount && (product.pretRedus !== undefined && product.pretRedus !== null) && product.pretRedus < product.pret ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">
                  {(product.pretRedus !== undefined && product.pretRedus !== null)
                    ? product.pretRedus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                    : "Price unavailable"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-400 line-through">
                  {(product.pret !== undefined && product.pret !== null)
                    ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                    : ""}
                </span>
                <span className="text-xs font-medium text-red-500">
                  -{discount}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
                {(product.pret !== undefined && product.pret !== null)
                  ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                  : "Price unavailable"}
              </span>
            </div>
          )}
        </div>

        {/* Replace ShimmerButton with our custom button */}
        <div className="mt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(e as React.MouseEvent);
            }}
            disabled={product.stoc === 0}
            className={`fancy-button w-full ${product.stoc === 0 ? "opacity-60" : ""}`}
          >
            <div className="button-content">
              <ShoppingCart className="h-4 w-4 fancy-button-icon" />
              <span>
                {product.stoc === 0
                  ? t?.("out_of_stock") || "Out of stock"
                  : t?.("add_to_cart") || "Add to cart"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return disableLink ? (
    content
  ) : (
    <Link
      href={`/produs/${product.id}`}
      className="block h-full"
    >
      {content}
    </Link>
  );
}

// Mobile Compact Card
function ProductCardCompact({
  product,
  disableLink = false,
  hideDiscount = false,
  onImageError,
  getValidImageUrl,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();

  // Calculate discount only if pretRedus exists AND is less than pret
  const discount = hideDiscount ? 0 : (
    product.pretRedus !== undefined &&
    product.pretRedus !== null &&
    product.pret !== undefined &&
    product.pret !== null &&
    product.pretRedus < product.pret
      ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
      : 0
  );

  // Get the image URL - use getValidImageUrl function if provided, otherwise use first image
  const imageUrl = getValidImageUrl ? getValidImageUrl(product) : product.imagini[0];

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
        duration: 2000, // Shorter duration for mobile
      });
    }, 300);
  };

  // Content specifically optimized for mobile
  const content = (
    <div className="group relative flex flex-col justify-between rounded-xl overflow-hidden border border-gray-100 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 h-full w-full">
      {/* Top ribbon - moved both discount and credit badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
        {!hideDiscount && discount > 0 && (
          <div className="transform-gpu rounded-md bg-gradient-to-r from-red-600 to-red-500 pl-2 pr-2.5 py-0.5 text-[11px] font-semibold text-white shadow-md inline-flex items-center justify-center">
            <span>-{discount}%</span>
          </div>
        )}
        {/* Only show credit badge for products with price above 1000 lei */}
        {(product.pret !== undefined && product.pret !== null && product.pret >= 1000) && (
          <div className="transform-gpu rounded-md bg-gradient-to-r from-primary to-primary/80 pl-1 pr-2.5 py-0.5 text-[11px] font-semibold text-white shadow-md flex items-center gap-1">
            <span className="inline-flex items-center justify-center bg-white text-primary rounded-full h-4 w-4 text-[8px] font-bold">
              0%
            </span>
            <span>8 {t?.("months") || "months"}</span>
          </div>
        )}
      </div>

      {/* Image Container - fixed height */}
      <div className="relative w-full h-36 overflow-hidden bg-white/80">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.nume || "Product image"}
            fill
            className={cn(
              "object-contain p-2 transition-transform duration-300",
              isHovered ? "scale-[1.05]" : "scale-100"
            )}
            sizes="(max-width: 768px) 50vw, 33vw"
            priority
            onError={(e) => {
              console.log(`Image failed to load: ${imageUrl}`);
              const imgElement = e.currentTarget as HTMLImageElement;
              imgElement.src = "https://placehold.co/400x400/eee/999?text=Image+Unavailable";
              if (onImageError) {
                onImageError(product.id, imageUrl);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-10 w-10 text-gray-300" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Divider line */}
      <div className="h-px w-full bg-gray-100"></div>

      {/* Details Container - more flexible layout */}
      <div className="flex flex-col p-3 flex-grow">
        {/* Category */}
        <div className="text-xs text-gray-500 font-medium mb-1 truncate">
          {(product.subcategorie?.categoriePrincipala?.nume && product.subcategorie?.categoriePrincipala?.nume !== "")
            ? product.subcategorie.categoriePrincipala.nume
            : (product.subcategorie?.nume && product.subcategorie?.nume !== "")
              ? product.subcategorie.nume
              : t?.("category_unknown") || "Unknown category"}
        </div>

        {/* Product Title */}
        <h3 className="line-clamp-2 text-lg font-medium text-gray-800 mb-1 group-hover:text-primary transition-colors duration-300 min-h-[3rem]">
          {product.nume || t?.("product_unknown") || "Unknown product"}
        </h3>

        {/* Description Preview */}
        {product.descriere && (
          <p className="line-clamp-2 text-xs text-gray-500 mb-2 min-h-[2rem]">
            {product.descriere}
          </p>
        )}

        {/* Price section - at the bottom with auto margin top */}
        <div className="mt-auto">
          {!hideDiscount && (product.pretRedus !== undefined && product.pretRedus !== null) && product.pretRedus < product.pret ? (
            <div className="flex flex-col">
              <span className="text-base font-bold text-primary">
                {(product.pretRedus !== undefined && product.pretRedus !== null)
                  ? product.pretRedus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                  : "Price unavailable"}
              </span>
              <div className="flex items-center ">
                <span className="text-xs text-gray-400 line-through">
                  {(product.pret !== undefined && product.pret !== null)
                    ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                    : ""}
                </span>
                <span className="text-xs font-medium text-red-500">
                  -{discount}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {(product.pret !== undefined && product.pret !== null)
                  ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                  : "Price unavailable"}
              </span>
            </div>
          )}

          {/* Replace ShimmerButton with our custom button - for mobile */}
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(e as React.MouseEvent);
              }}
              disabled={product.stoc === 0}
              className={`fancy-button w-full ${isAddingToCart ? "opacity-80" : ""} ${product.stoc === 0 ? "opacity-60" : ""}`}
            >
              <div className="button-content">
                {isAddingToCart ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="h-3 w-3 fancy-button-icon" />
                )}
                <span className="text-xs">
                  {isAddingToCart
                    ? t?.("adding_to_cart") || "Adding..."
                    : product.stoc === 0
                    ? t?.("out_of_stock") || "Out of stock"
                    : t?.("add_to_cart") || "Add to cart"}
                </span>
              </div>
            </button>
          </div>
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
      className="block h-full touch-manipulation" /* Added touch-manipulation for better mobile touch */
    >
      {content}
    </Link>
  );
}

// Small search result card for search dropdowns
function SearchResultCard({
  product,
  onClick,
  hideDiscount = false,
}: {
  product: Product;
  onClick?: () => void;
  hideDiscount?: boolean;
}) {
  const { t } = useLanguage();

  // Calculate discount only if pretRedus exists AND is less than pret
  const discount = hideDiscount ? 0 : (
    product.pretRedus !== undefined &&
    product.pretRedus !== null &&
    product.pret !== undefined &&
    product.pret !== null &&
    product.pretRedus < product.pret
      ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
      : 0
  );

  return (
    <div
      className="flex items-center p-2 gap-3 hover:bg-accent/50 hover:backdrop-blur-sm rounded-md transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Product image */}
      <div className="relative h-14 w-14 flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-md overflow-hidden border border-primary/10 shadow-sm transition-transform group-hover:scale-105">
        {product.imagini?.[0] ? (
          <Image
            src={product.imagini[0]}
            alt={product.nume || "Product image"}
            fill
            className="object-contain p-1"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        {/* Title with one line truncation */}
        <h4 className="text-sm font-medium leading-tight text-foreground truncate group-hover:text-primary transition-colors">
          {product.nume}
        </h4>

        {/* Category */}
        <p className="text-xs text-muted-foreground truncate">
          {(product.subcategorie?.categoriePrincipala?.nume || "") !== ""
            ? `${product.subcategorie.categoriePrincipala.nume} / ${product.subcategorie.nume || ""}`
            : product.subcategorie?.nume || t?.("category_unknown") || "Unknown category"}
        </p>

        {/* Price */}
        <div className="flex items-center gap-1.5">
          {!hideDiscount && (product.pretRedus !== undefined && product.pretRedus !== null) && product.pretRedus < product.pret ? (
            <>
              <span className="text-base font-semibold text-primary">
                {(product.pretRedus !== undefined && product.pretRedus !== null)
                  ? product.pretRedus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                  : "Price unavailable"}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {(product.pret !== undefined && product.pret !== null)
                  ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                  : ""}
              </span>
              {discount > 0 && (
                <span className="text-xs font-medium text-red-500">
                  -{discount}%
                </span>
              )}
            </>
          ) : (
            <span className="text-base font-semibold text-primary">
              {(product.pret !== undefined && product.pret !== null)
                ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                : "Price unavailable"}
            </span>
          )}
        </div>
      </div>

      {/* Stock badge */}
      <div className="flex-shrink-0">
        {product.stoc > 0 ? (
          <span className="inline-flex items-center rounded-full bg-green-50/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 group-hover:bg-green-100/90 transition-colors">
            {t?.("in_stock") || "In Stock"}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-50/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 group-hover:bg-red-100/90 transition-colors">
            {t?.("out_of_stock") || "Out of Stock"}
          </span>
        )}
      </div>
    </div>
  );
}

// Mobile Swipe Card - completely new mobile design
function MobileProductCard({
  product,
  disableLink = false,
  hideDiscount = false,
  onImageError,
  getValidImageUrl,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();

  // Calculate discount only if pretRedus exists AND is less than pret
  const discount = hideDiscount ? 0 : (
    product.pretRedus !== undefined &&
    product.pretRedus !== null &&
    product.pret !== undefined &&
    product.pret !== null &&
    product.pretRedus < product.pret
      ? Math.round(((product.pret - product.pretRedus) / product.pret) * 100)
      : 0
  );

  // Get the image URL - use getValidImageUrl function if provided, otherwise use first image
  const imageUrl = getValidImageUrl ? getValidImageUrl(product) : product.imagini[0];

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
        duration: 2000, // Shorter duration for mobile
      });
    }, 300);
  };

  // Content specifically optimized for mobile
  const content = (
    <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-100">
      {/* Image on left */}
      <div className="absolute top-0 left-0 h-full w-1/3 overflow-hidden">
        <div className="relative h-full w-full bg-white">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.nume || "Product image"}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 33vw, 120px"
              priority
              onError={(e) => {
                console.log(`Image failed to load: ${imageUrl}`);
                const imgElement = e.currentTarget as HTMLImageElement;
                imgElement.src = "https://placehold.co/400x400/eee/999?text=Image+Unavailable";
                if (onImageError) {
                  onImageError(product.id, imageUrl);
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" aria-hidden="true" />
            </div>
          )}

          {/* Discount badge */}
          {!hideDiscount && discount > 0 && (
            <div className="absolute top-1 left-1 transform-gpu rounded-md bg-gradient-to-r from-red-600 to-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-md">
              -{discount}%
            </div>
          )}
        </div>
      </div>

      {/* Content on right */}
      <div className="absolute top-0 right-0 h-full w-2/3 pl-2 pr-3 py-2 flex flex-col">
        {/* Category */}
        <div className="text-[10px] text-gray-500 font-medium truncate mb-0.5">
          {(product.subcategorie?.categoriePrincipala?.nume && product.subcategorie?.categoriePrincipala?.nume !== "")
            ? product.subcategorie.categoriePrincipala.nume
            : (product.subcategorie?.nume && product.subcategorie?.nume !== "")
              ? product.subcategorie.nume
              : t?.("category_unknown") || "Unknown category"}
        </div>

        {/* Product title */}
        <h3 className="line-clamp-2 text-xs font-medium text-gray-800 mb-auto">
          {product.nume || t?.("product_unknown") || "Unknown product"}
        </h3>

        {/* Bottom section with price and cart button */}
        <div className="flex items-center justify-between mt-1">
          {/* Price info */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary">
              {!hideDiscount && (product.pretRedus !== undefined && product.pretRedus !== null) && product.pretRedus < product.pret
                ? product.pretRedus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                : (product.pret !== undefined && product.pret !== null)
                  ? product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"
                  : "Price unavailable"}
            </span>

            {!hideDiscount && (product.pretRedus !== undefined && product.pretRedus !== null) && product.pretRedus < product.pret && (
              <span className="text-[10px] text-gray-400 line-through">
                {product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " lei"}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(e as React.MouseEvent);
            }}
            disabled={product.stoc === 0}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-full shadow-sm transition-all active:scale-90",
              product.stoc === 0
                ? "bg-gray-300 text-gray-500"
                : isAddingToCart
                ? "bg-gray-800 text-white"
                : "bg-[#111D4A] text-white hover:bg-indigo-700 hover:scale-105"
            )}
          >
            {isAddingToCart ? (
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : product.stoc === 0 ? (
              <span className="text-[8px] font-bold">N/A</span>
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
          </button>
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
      className="block w-full touch-manipulation"
    >
      {content}
    </Link>
  );
}

// Add new 3D button styles
const addToCartButtonStyles = `
  .fancy-button {
    position: relative;
    background: linear-gradient(to bottom right, #111D4A, #1E3A8A);
    border: none;
    color: white;
    padding: 0.75rem 1.25rem;
    font-weight: 500;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
    transform-style: preserve-3d;
    transform: perspective(800px) translateZ(0);
    z-index: 10;
  }

  .fancy-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(225deg, #1E40AF, #1E3A8A, #0F2167);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  .fancy-button::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%) skewX(-15deg);
    transition: transform 0.6s ease;
  }

  .fancy-button .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
    transition: transform 0.2s ease;
  }

  .fancy-button:hover {
    transform: perspective(800px) translateZ(10px) translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(14, 26, 57, 0.3), 0 8px 10px -6px rgba(14, 26, 57, 0.2);
  }

  .fancy-button:hover::before {
    opacity: 1;
  }

  .fancy-button:hover::after {
    transform: translateX(100%) skewX(-15deg);
  }

  .fancy-button:hover .button-content {
    transform: scale(1.05);
  }

  .fancy-button:active {
    transform: perspective(800px) translateZ(0) translateY(0);
    box-shadow: 0 5px 15px -3px rgba(14, 26, 57, 0.2), 0 4px 6px -2px rgba(14, 26, 57, 0.1);
  }

  .fancy-button:disabled {
    background: #94A3B8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .fancy-button:disabled::before,
  .fancy-button:disabled::after {
    display: none;
  }

  .fancy-button.fancy-button-red {
    background: linear-gradient(to bottom right, #DC2626, #B91C1C);
  }

  .fancy-button.fancy-button-red::before {
    background: linear-gradient(225deg, #EF4444, #DC2626, #B91C1C);
  }

  .fancy-button-icon {
    transition: transform 0.3s ease;
  }

  .fancy-button:hover .fancy-button-icon {
    transform: rotate(-5deg) scale(1.15);
  }

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
`;

// Add the styles to the document when the component is mounted
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = addToCartButtonStyles;
  if (!document.head.querySelector("style#product-card-buttons")) {
    styleTag.id = "product-card-buttons";
    document.head.appendChild(styleTag);
  }
}

export { ProductCard, ProductCardCompact, SearchResultCard, MobileProductCard };
