"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, Heart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { useFavorites } from "@/app/contexts/favorites-context";
import { useCart } from "@/app/contexts/cart-context";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/app/components/ui/product-card";

// Type definitions
interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus?: number | null;
  stoc: number;
  imagini: string[];
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    }
  }
  stare?: string;
}

interface Category {
  id: string;
  nume: string;
}

interface Subcategory {
  id: string;
  nume: string;
  categoriePrincipalaId: string;
}

export default function CategorySubcategoryPage() {
  const params = useParams();
  const { toast } = useToast();
  const { favorites, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Create a wrapper for toggleFavorite to match the expected interface
  const handleAddToFavorites = (product: Product) => {
    const isCurrentlyFavorite = favorites.includes(product.id);
    toggleFavorite(product.id);

    toast({
      title: "Actualizare favorite",
      description: `Produsul "${product.nume}" a fost ${isCurrentlyFavorite ? "eliminat din" : "adăugat la"} favorite`,
    });
  };

  // Add handleAddToCart function for consistency
  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Adăugat în coș",
      description: `Produsul "${product.nume}" a fost adăugat în coșul tău`,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Mock data for categories
        const mockCategories = [
          { id: "cat1", nume: "Computere" },
          { id: "cat2", nume: "Telefoane" },
          { id: "cat3", nume: "Electronice" },
          { id: "cat4", nume: "Accesorii" },
          { id: "cat5", nume: "Gaming" },
          { id: "cat6", nume: "Electrocasnice" }
        ];

        // Mock data for subcategories
        const mockSubcategories = [
          { id: "sub1", nume: "Laptopuri", categoriePrincipalaId: "cat1" },
          { id: "sub2", nume: "Desktop", categoriePrincipalaId: "cat1" },
          { id: "sub3", nume: "Monitoare", categoriePrincipalaId: "cat1" },
          { id: "sub4", nume: "Smartphones", categoriePrincipalaId: "cat2" },
          { id: "sub5", nume: "Accesorii telefoane", categoriePrincipalaId: "cat2" },
          { id: "sub6", nume: "Tablete", categoriePrincipalaId: "cat2" },
          { id: "sub7", nume: "Televizoare", categoriePrincipalaId: "cat3" },
          { id: "sub8", nume: "Căști", categoriePrincipalaId: "cat4" },
          { id: "sub9", nume: "Foto & Video", categoriePrincipalaId: "cat3" },
          { id: "sub10", nume: "Smartwatch-uri", categoriePrincipalaId: "cat4" },
          { id: "sub11", nume: "Console", categoriePrincipalaId: "cat5" },
          { id: "sub12", nume: "Aspiratoare", categoriePrincipalaId: "cat6" }
        ];

        // Mock products data
        const mockProducts: Product[] = [
          {
            id: "1",
            nume: "Laptop Example Pro",
            cod: "LP-001",
            pret: 12999,
            pretRedus: 11499,
            imagini: ["https://i.pinimg.com/736x/00/78/23/007823f23f707b60490c82f6544475f2.jpg"],
            stoc: 10,
            subcategorie: {
              id: "sub1",
              nume: "Laptopuri",
              categoriePrincipala: {
                id: "cat1",
                nume: "Computere"
              }
            },
            stare: "nou"
          },
          {
            id: "2",
            nume: "Smartphone Example S",
            cod: "SP-002",
            pret: 8999,
            pretRedus: null,
            imagini: ["https://i.pinimg.com/736x/7e/f6/02/7ef602c6b66304adc65fdfc3afa8cb15.jpg"],
            stoc: 15,
            subcategorie: {
              id: "sub4",
              nume: "Smartphones",
              categoriePrincipala: {
                id: "cat2",
                nume: "Telefoane"
              }
            },
            stare: "nou"
          },
          {
            id: "3",
            nume: "Tablet Example X",
            cod: "TX-003",
            pret: 5999,
            pretRedus: 4999,
            imagini: ["https://i.pinimg.com/736x/36/7e/61/367e61a9bfa273e1fe40de05be697b79.jpg"],
            stoc: 8,
            subcategorie: {
              id: "sub6",
              nume: "Tablete",
              categoriePrincipala: {
                id: "cat2",
                nume: "Telefoane"
              }
            },
            stare: "nou"
          },
          {
            id: "4",
            nume: "Smart TV Example 55\"",
            cod: "TV-001",
            pret: 9999,
            pretRedus: 7999,
            imagini: ["https://i.pinimg.com/736x/ef/5b/0f/ef5b0fa991fb97235d512b5de5cd449b.jpg"],
            stoc: 5,
            subcategorie: {
              id: "sub7",
              nume: "Televizoare",
              categoriePrincipala: {
                id: "cat3",
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
            imagini: ["https://i.pinimg.com/736x/78/51/41/785141f59aabd3352ccc34398cd0f40a.jpg"],
            stoc: 20,
            subcategorie: {
              id: "sub8",
              nume: "Căști",
              categoriePrincipala: {
                id: "cat4",
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
            imagini: ["https://i.pinimg.com/736x/1b/bc/f3/1bbcf394f2f999b67b6f9c7dd7f415e2.jpg"],
            stoc: 8,
            subcategorie: {
              id: "sub9",
              nume: "Foto & Video",
              categoriePrincipala: {
                id: "cat3",
                nume: "Electronice"
              }
            },
            stare: "nou"
          },
          {
            id: "7",
            nume: "iPhone 15 Pro Max",
            cod: "IP-15-PM",
            pret: 12999,
            pretRedus: null,
            imagini: ["https://i.pinimg.com/736x/96/a5/4d/96a54d455969763c33de3d527c071f4e.jpg"],
            stoc: 7,
            subcategorie: {
              id: "sub4",
              nume: "Smartphones",
              categoriePrincipala: {
                id: "cat2",
                nume: "Telefoane"
              }
            },
            stare: "nou"
          },
          {
            id: "8",
            nume: "Samsung Galaxy S23 Ultra",
            cod: "SG-S23-U",
            pret: 10999,
            pretRedus: 9999,
            imagini: ["https://i.pinimg.com/736x/d7/48/6e/d7486e6289bb4b91cf21dda692b7d60e.jpg"],
            stoc: 12,
            subcategorie: {
              id: "sub4",
              nume: "Smartphones",
              categoriePrincipala: {
                id: "cat2",
                nume: "Telefoane"
              }
            },
            stare: "nou"
          }
        ];

        // Find the category and subcategory
        const foundCategory = mockCategories.find(c => c.id === categoryId) || null;
        const foundSubcategory = mockSubcategories.find(s => s.id === subcategoryId) || null;

        setCategory(foundCategory);
        setSubcategory(foundSubcategory);

        // Filter products by category and subcategory
        const filteredProducts = mockProducts.filter(
          product => product.subcategorie.id === subcategoryId
        );

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca produsele",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, subcategoryId, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  if (!category || !subcategory || products.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nicio categorie sau produs găsit</h1>
          <p className="text-muted-foreground mb-8">
            Nu am putut găsi categoria, subcategoria sau produsele specificate.
          </p>
          <Link href="/">
            <Button>Înapoi la pagina principală</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Acasă
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/catalog" className="hover:text-primary transition-colors">
          Catalog
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/catalog?category=${category.id}`}
          className="hover:text-primary transition-colors"
        >
          {category.nume}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{subcategory.nume}</span>
      </nav>

      {/* Page header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{subcategory.nume}</h1>
        <p className="text-muted-foreground">{products.length} produse găsite</p>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <Link key={product.id} href={`/produs/${product.id}`} className="block h-full">
            <ProductCard
              product={product}
              onAddToFavorites={handleAddToFavorites}
              disableLink={true}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
