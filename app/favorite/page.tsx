"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Package,
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  Clock,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/contexts/cart-context";
import { useToast } from "@/app/components/ui/use-toast";
import { useFavorites } from "@/app/contexts/favorites-context";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import { cn } from "@/lib/utils";
import {
  getProductById,
  allProducts,
  Product as ProductType,
} from "@/app/utils/mock-data";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useLanguage } from "@/lib/language-context";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentlyRemoved, setRecentlyRemoved] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t } = useLanguage();
  const {
    favorites,
    toggleFavorite,
    loading: favoritesLoading,
  } = useFavorites();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch product data for favorites
  useEffect(() => {
    if (
      status === "authenticated" &&
      !favoritesLoading &&
      favorites.length >= 0
    ) {
      const fetchProductsForFavorites = () => {
        setIsLoading(true);
        try {
          // Get the actual products from our mock data based on favorite IDs
          const favoriteProducts = favorites
            .map((id) => getProductById(id))
            .filter((p): p is ProductType => p !== undefined);

          setProducts(favoriteProducts);
        } catch (error) {
          console.error("Failed to fetch products for favorites:", error);
          toast({
            title: "Eroare",
            description: "Nu s-au putut încărca produsele favorite",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchProductsForFavorites();
    }
  }, [status, favorites, favoritesLoading, toast]);

  const handleRemoveFavorite = (productId: string) => {
    setRecentlyRemoved(productId);
    // Reset after animation completes
    setTimeout(() => {
      setRecentlyRemoved(null);
      toggleFavorite(productId);
    }, 300);
  };

  const handleAddAllToCart = () => {
    products.forEach((product) => {
      addItem(product);
    });

    toast({
      title: "Produse adăugate",
      description: `${products.length} produse au fost adăugate în coșul de cumpărături`,
    });
  };

  // Loading state with beautiful animation
  if (
    status === "loading" ||
    (status === "authenticated" && (isLoading || favoritesLoading))
  ) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 h-full w-full rounded-full border-t-4 border-primary animate-spin"></div>
            <div className="absolute inset-2 h-20 w-20 rounded-full border-r-4 border-primary/70 animate-spin animate-reverse"></div>
            <div className="absolute inset-4 h-16 w-16 rounded-full border-b-4 border-primary/40 animate-spin animate-delay-500"></div>
            <div className="absolute inset-6 h-12 w-12 rounded-full border-l-4 border-primary/20 animate-spin animate-reverse animate-delay-500"></div>
            <div className="absolute inset-8 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-lg font-medium text-muted-foreground animate-fade-in">
            Se încarcă produsele tale favorite...
          </p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="relative min-h-screen overflow-hidden pb-20">
        {/* Background Patterns */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
          <GridPattern
            squares={[
              [1, 1],
              [2, 3],
              [5, 2],
              [10, 5],
              [15, 6],
              [19, 4],
              [7, 7],
              [4, 15],
              [7, 12],
              [12, 17],
              [17, 13],
              [8, 18],
              [14, 1],
            ]}
            className="opacity-20 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          />
        </div>

        <div className="container max-w-6xl py-8 md:py-12 relative">
          {/* Page Header with Animations */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" fill="currentColor" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Produsele mele favorite
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg shadow-sm p-1 flex items-center">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded transition-colors",
                      viewMode === "grid"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-100"
                    )}
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded transition-colors",
                      viewMode === "list"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-100"
                    )}
                    aria-label="List View"
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>

                {products.length > 0 && (
                  <ShimmerButton
                    onClick={handleAddAllToCart}
                    className="whitespace-nowrap"
                    shimmerColor="#00BFFF"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Adaugă toate
                    </span>
                  </ShimmerButton>
                )}
              </div>
            </motion.div>

            {products.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    Ai{" "}
                    <span className="font-semibold text-primary">
                      {products.length}
                    </span>{" "}
                    {products.length === 1 ? "produs" : "produse"} în lista ta
                    de favorite
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {products.slice(0, 3).map((product) => (
                        <div
                          key={product.id}
                          className="h-8 w-8 rounded-full border-2 border-white overflow-hidden relative"
                        >
                          {product.imagini[0] ? (
                            <Image
                              src={product.imagini[0]}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                      ))}
                      {products.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                          +{products.length - 3}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/catalog"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Descoperă mai multe produse</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Empty State with Animations */}
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl bg-white shadow-xl p-8 md:p-12"
            >
              <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center relative z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8 overflow-hidden relative">
                  <Heart className="w-10 h-10 md:w-12 md:h-12 text-primary/40" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 animate-rotate-slow"></div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-900 text-transparent bg-clip-text">
                  Lista ta de favorite este goală
                </h2>

                <p className="text-muted-foreground max-w-md mb-10 text-lg">
                  Adaugă produse în lista de favorite pentru a le găsi mai ușor
                  data viitoare și pentru a ține evidența produselor care te
                  interesează.
                </p>

                <ShimmerButton
                  onClick={() => router.push("/catalog")}
                  className="px-8 py-3"
                  shimmerColor="#00BFFF"
                >
                  <span className="flex items-center gap-2">
                    Explorează produse
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </ShimmerButton>
              </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            </motion.div>
          ) : (
            <>
              {/* Product Grid with Staggered Animation */}
              <AnimatePresence>
                {viewMode === "grid" ? (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: recentlyRemoved === product.id ? 0 : 1,
                          y: recentlyRemoved === product.id ? -20 : 0,
                          scale: recentlyRemoved === product.id ? 0.8 : 1,
                        }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                        className="relative"
                      >
                        <ProductCard
                          product={product as any}
                          isFavorite={true}
                          onFavoriteToggle={() =>
                            handleRemoveFavorite(product.id)
                          }
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: recentlyRemoved === product.id ? 0 : 1,
                          x: recentlyRemoved === product.id ? -100 : 0,
                        }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                        className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-48 aspect-square md:aspect-auto">
                            <Image
                              src={product.imagini[0] || ""}
                              alt={product.nume}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {product.pretRedus && (
                              <div className="absolute left-3 top-3 z-10">
                                <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                  -
                                  {Math.round(
                                    ((product.pret - product.pretRedus) /
                                      product.pret) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 md:p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-medium text-lg mb-1 line-clamp-2">
                                  {product.nume}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {
                                    product.subcategorie.categoriePrincipala
                                      .nume
                                  }{" "}
                                  / {product.subcategorie.nume}
                                </p>
                              </div>

                              <button
                                onClick={() => handleRemoveFavorite(product.id)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                aria-label="Remove from favorites"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>

                            {product.descriere && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4">
                                {product.descriere}
                              </p>
                            )}

                            <div className="mt-auto flex items-center justify-between">
                              <div>
                                {product.pretRedus ? (
                                  <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold text-primary">
                                      {product.pretRedus} MDL
                                    </p>
                                    <p className="text-sm text-muted-foreground line-through">
                                      {product.pret} MDL
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xl font-bold text-primary">
                                    {product.pret} MDL
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {Math.round(
                                    (product.pretRedus || product.pret) / 8
                                  )}{" "}
                                  MDL/month (0%)
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link href={`/produs/${product.id}`} passHref>
                                  <Button variant="outline" size="sm">
                                    Detalii
                                  </Button>
                                </Link>

                                <ShimmerButton
                                  onClick={() => {
                                    addItem(product);
                                    toast({
                                      title: "Produs adăugat",
                                      description: `${product.nume} a fost adăugat în coșul de cumpărături`,
                                    });
                                  }}
                                  className="px-4"
                                  shimmerColor="#00BFFF"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  <span>Adaugă în coș</span>
                                </ShimmerButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recently Viewed Section */}
              <div className="mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Te-ar putea interesa și
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.slice(0, 4).map((product, index) => (
                    <motion.div
                      key={`suggested-${product.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProductCardCompact
                        product={product as any}
                        isFavorite={favorites.includes(product.id)}
                        onFavoriteToggle={() => toggleFavorite(product.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
