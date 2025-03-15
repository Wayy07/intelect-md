"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Package, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/contexts/cart-context";
import { useToast } from "@/app/components/ui/use-toast";
import { useFavorites } from "@/app/contexts/favorites-context";

// Match the Product interface used in the cart context
interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus?: number | null;
  stoc: number;
  imagini: string[];
  stare: string;
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    }
  }
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch product data for favorites
  useEffect(() => {
    if (status === "authenticated" && !favoritesLoading && favorites.length >= 0) {
      const fetchProductsForFavorites = async () => {
        setIsLoading(true);
        try {
          // In a real implementation, you would fetch the actual product data from your API
          // For now, we'll use mock data to simulate the products

          // Simulating the products with mock data
          const mockProducts: Product[] = [
            {
              id: "1",
              nume: "Laptop Apple MacBook Air 13\" M2",
              cod: "MAC-M2-AIR",
              pret: 25999,
              pretRedus: 24499,
              stoc: 10,
              imagini: ["/placeholder-product.jpg"],
              stare: "nou",
              subcategorie: {
                id: "laptops",
                nume: "Laptops",
                categoriePrincipala: {
                  id: "computers",
                  nume: "Computers"
                }
              }
            },
            {
              id: "2",
              nume: "Smartphone Samsung Galaxy S23 Ultra",
              cod: "SAM-S23-ULTRA",
              pret: 21999,
              stoc: 5,
              imagini: ["/placeholder-product.jpg"],
              stare: "nou",
              subcategorie: {
                id: "smartphones",
                nume: "Smartphones",
                categoriePrincipala: {
                  id: "phones",
                  nume: "Phones"
                }
              }
            },
            {
              id: "3",
              nume: "Casti Apple AirPods Pro 2",
              cod: "APP-AIRPODS-PRO2",
              pret: 4999,
              pretRedus: 4499,
              stoc: 15,
              imagini: ["/placeholder-product.jpg"],
              stare: "nou",
              subcategorie: {
                id: "headphones",
                nume: "Headphones",
                categoriePrincipala: {
                  id: "accessories",
                  nume: "Accessories"
                }
              }
            },
            {
              id: "4",
              nume: "Smart TV Example 55\"",
              cod: "TV-001",
              pret: 9999,
              pretRedus: 7999,
              imagini: ["/placeholder-product.jpg"],
              stoc: 5,
              subcategorie: {
                id: "sub1",
                nume: "Smart TV",
                categoriePrincipala: {
                  id: "cat1",
                  nume: "Electronice"
                }
              },
              stare: "nou"
            },
            {
              id: "5",
              nume: "Wireless Headphones Pro",
              cod: "WH-002",
              pret: 1999,
              pretRedus: 1499,
              imagini: ["/placeholder-product.jpg"],
              stoc: 20,
              subcategorie: {
                id: "sub2",
                nume: "Căști",
                categoriePrincipala: {
                  id: "cat2",
                  nume: "Accesorii"
                }
              },
              stare: "nou"
            },
            {
              id: "6",
              nume: "Gaming Console X",
              cod: "GC-003",
              pret: 7999,
              pretRedus: 6999,
              imagini: ["/placeholder-product.jpg"],
              stoc: 8,
              subcategorie: {
                id: "sub3",
                nume: "Console",
                categoriePrincipala: {
                  id: "cat3",
                  nume: "Gaming"
                }
              },
              stare: "nou"
            }
          ];

          // Filter mock products to include only the ones in favoriteIds
          const filteredProducts = mockProducts.filter(p =>
            favorites.includes(p.id)
          );

          setProducts(filteredProducts);
        } catch (error) {
          console.error("Failed to fetch products for favorites:", error);
          toast({
            title: "Eroare",
            description: "Nu s-au putut încărca produsele favorite",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchProductsForFavorites();
    }
  }, [status, favorites, favoritesLoading, toast]);

  const handleRemoveFavorite = async (productId: string) => {
    toggleFavorite(productId);
  };

  const addToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Produs adăugat",
      description: `${product.nume} a fost adăugat în coșul de cumpărături`,
    });
  };

  if (status === "loading" || (status === "authenticated" && (isLoading || favoritesLoading))) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Se încarcă produsele favorite...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="container max-w-6xl py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Produsele mele favorite</h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-32 text-center bg-accent/20 rounded-xl">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Nu ai niciun produs favorit</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Adaugă produse în lista de favorite pentru a le găsi mai ușor data viitoare.
            </p>
            <Button asChild>
              <Link href="/catalog">
                Explorează produse
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative flex flex-col border rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
                  onClick={() => handleRemoveFavorite(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <Link href={`/produs/${product.id}`} className="relative aspect-square overflow-hidden bg-accent/20">
                  {product.imagini[0] ? (
                    <Image
                      src={product.imagini[0]}
                      alt={product.nume}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}

                  {product.pretRedus && (
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-white">
                        -{Math.round(((product.pret - product.pretRedus) / product.pret) * 100)}%
                      </span>
                    </div>
                  )}
                </Link>

                <div className="flex flex-col flex-1 p-4">
                  <Link href={`/produs/${product.id}`} className="group-hover:text-primary">
                    <h3 className="font-medium line-clamp-2 mb-1 min-h-[2.5rem]">{product.nume}</h3>
                  </Link>

                  <p className="text-sm text-muted-foreground mb-4">Cod: {product.cod}</p>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      {product.pretRedus ? (
                        <>
                          <p className="text-sm text-muted-foreground line-through">{product.pret.toLocaleString()} MDL</p>
                          <p className="text-lg font-semibold text-primary">{product.pretRedus.toLocaleString()} MDL</p>
                        </>
                      ) : (
                        <p className="text-lg font-semibold">{product.pret.toLocaleString()} MDL</p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="ml-2"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adaugă
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
