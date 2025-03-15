'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Share2, Check, X, Truck, Info, Clock, CreditCard, Calendar } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/app/contexts/cart-context';
import { useFavorites } from '@/app/contexts/favorites-context';
import { useToast } from '@/app/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Interface for Product matching our API
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
    }
  };
  descriere?: string;
  specificatii?: {
    [key: string]: string;
  };
  stare: string;
  creditOption?: {
    months: number;
    monthlyPayment: number;
  };
}

// Mock data for products - same structure as in other components
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
    descriere: "Laptop de ultimă generație cu performanțe excelente pentru utilizare zilnică și productivitate. Dotat cu un procesor rapid, memorie generoasă și un design elegant care îmbină portabilitatea cu funcționalitatea.",
    specificatii: {
      "Procesor": "Intel Core i7 de generația 11",
      "Memorie": "16GB RAM",
      "Stocare": "512GB SSD",
      "Display": "15.6 inch Full HD",
      "Baterie": "Până la 10 ore de autonomie",
      "Sistem de operare": "Windows 11",
      "Greutate": "1.8 kg"
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
      id: "sub2",
      nume: "Smartphones",
      categoriePrincipala: {
        id: "cat2",
        nume: "Telefoane"
      }
    },
    descriere: "Smartphone performant cu cameră foto de înaltă calitate, ecran AMOLED vibrant și baterie de lungă durată. Perfect pentru utilizatorii care caută un telefon premium cu funcționalități avansate.",
    specificatii: {
      "Procesor": "Octa-core 2.8 GHz",
      "Memorie": "8GB RAM",
      "Stocare": "128GB",
      "Display": "6.5 inch AMOLED",
      "Cameră": "Triple 64MP + 12MP + 8MP",
      "Baterie": "4500 mAh",
      "Sistem de operare": "Android 12"
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
      id: "sub3",
      nume: "Tablete",
      categoriePrincipala: {
        id: "cat2",
        nume: "Tablete"
      }
    },
    descriere: "Tabletă versatilă ideală atât pentru divertisment cât și pentru productivitate. Cu un ecran de înaltă rezoluție, sunet de calitate și un procesor capabil, această tabletă oferă o experiență completă pentru toate nevoile tale digitale.",
    specificatii: {
      "Procesor": "Quad-core 2.0 GHz",
      "Memorie": "4GB RAM",
      "Stocare": "64GB",
      "Display": "10.5 inch IPS LCD",
      "Baterie": "7000 mAh",
      "Sistem de operare": "Android 11",
      "Conectivitate": "Wi-Fi, Bluetooth 5.0"
    },
    stare: "nou"
  },
  {
    id: "4",
    nume: "Smart TV Example 55",
    cod: "TV-001",
    pret: 9999,
    pretRedus: 7999,
    imagini: ["https://i.pinimg.com/736x/ef/5b/0f/ef5b0fa991fb97235d512b5de5cd449b.jpg"],
    stoc: 5,
    subcategorie: {
      id: "sub1",
      nume: "Smart TV",
      categoriePrincipala: {
        id: "cat1",
        nume: "Electronice"
      }
    },
    descriere: "Televizor inteligent cu design subțire și elegant, imagini clare 4K și sistem de operare intuitiv. Perfectă pentru orice living, această televiziune oferă acces la toate platformele populare de streaming și o calitate excepțională a imaginii.",
    specificatii: {
      "Diagonală": "55 inch",
      "Rezoluție": "4K UHD (3840 x 2160)",
      "Tehnologie display": "LED",
      "Smart TV": "Da, Android TV",
      "Conectivitate": "Wi-Fi, Bluetooth, HDMI, USB",
      "Audio": "2x 10W, Dolby Audio",
      "Eficiență energetică": "Clasa A+"
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
      id: "sub2",
      nume: "Căști",
      categoriePrincipala: {
        id: "cat2",
        nume: "Accesorii"
      }
    },
    descriere: "Căști wireless cu anulare activă a zgomotului, sunet de înaltă fidelitate și autonomie extinsă a bateriei. Ideale pentru audiofili și pentru utilizarea zilnică, aceste căști oferă confort maxim și o calitate audio excepțională.",
    specificatii: {
      "Tip": "Over-ear, wireless",
      "Autonomie": "Până la 30 ore",
      "Anulare zgomot": "Da, activă",
      "Conectivitate": "Bluetooth 5.0, Jack 3.5mm",
      "Microfon": "Încorporat",
      "Controlere": "Touch pe pavilion",
      "Compatibilitate": "Android, iOS, Windows, macOS"
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
      id: "sub3",
      nume: "Console",
      categoriePrincipala: {
        id: "cat3",
        nume: "Gaming"
      }
    },
    descriere: "Consolă de gaming de ultimă generație cu grafică impresionantă, viteză de procesare ridicată și o bibliotecă extinsă de jocuri. Perfect pentru gamerii pasionați care caută experiențe de joc imersive și performanțe de top.",
    specificatii: {
      "Procesor": "Custom 8-core AMD Zen 2",
      "GPU": "Custom AMD RDNA 2",
      "Memorie": "16GB GDDR6",
      "Stocare": "1TB SSD",
      "Rezoluție": "4K la 60fps, până la 120fps",
      "Conectivitate": "Wi-Fi 6, Bluetooth 5.1, 3x USB, HDMI 2.1",
      "Include": "1 controller wireless, cablu HDMI"
    },
    stare: "nou"
  }
];

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [hasWebShare, setHasWebShare] = useState(false);

  // Check for Web Share API availability
  useEffect(() => {
    setHasWebShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        // First try to get the product from the API
        const response = await fetch(`/api/products/${id}`);

        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setSelectedImage(0);
          fetchRelatedProducts(data.subcategorie.id);
        } else {
          // If API fails, fallback to mock data
          const mockProduct = mockProducts.find(p => p.id === id);

          if (mockProduct) {
            setProduct(mockProduct);
            setSelectedImage(0);
            fetchRelatedProductsFromMock(mockProduct.subcategorie.id);
          } else {
            setError('Produsul nu a fost găsit');
          }
        }
      } catch (error) {
        setError('A apărut o eroare la încărcarea produsului');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]); // Removed favorites dependency

  // Initialize favorite state only once when product is loaded
  useEffect(() => {
    if (product) {
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product?.id, favorites]); // Keep favorites dependency here only

  // Credit durations in months
  const creditDurations = [4, 6, 8, 12, 24, 36];

  // Calculate monthly payment
  const calculateMonthlyPayment = (months: number) => {
    if (!product) return 0;
    const price = product.pretRedus || product.pret;
    return Math.round(price / months);
  };

  // Ref for the image gallery container
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch related products
  async function fetchRelatedProducts(subcategoryId: string) {
    try {
      const response = await fetch(`/api/products?subcategory=${subcategoryId}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        // Filter out the current product
        setRelatedProducts(data.products.filter((p: Product) => p.id !== id));
      } else {
        fetchRelatedProductsFromMock(subcategoryId);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      fetchRelatedProductsFromMock(subcategoryId);
    }
  }

  function fetchRelatedProductsFromMock(subcategoryId: string) {
    // Get 4 random products from mockProducts
    const filtered = mockProducts.filter(p => p.id !== id);
    const randomProducts = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
    setRelatedProducts(randomProducts);
  }

  // Handle adding to cart
  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast({
        title: 'Produs adăugat în coș',
        description: product.nume,
      });
    }
  };

  // Handle toggling favorite (with optimistic UI update)
  const handleToggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (product) {
      // Optimistic UI update
      setIsFavorite(prev => !prev);

      // Update in context
      toggleFavorite(product.id);

      // Show toast notification
      toast({
        title: isFavorite ? 'Produs eliminat din favorite' : 'Produs adăugat la favorite',
        description: product.nume,
      });
    }
  };

  // Helper function to copy URL to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      // Try using the Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers and non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          throw new Error('Copy failed');
        }

        textArea.remove();
      }

      setShareUrlCopied(true);
      toast({
        title: 'Link copiat',
        description: 'Link-ul a fost copiat în clipboard'
      });
      setTimeout(() => setShareUrlCopied(false), 2000);
    } catch (err) {
      console.error('Could not copy text: ', err);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut copia link-ul',
        variant: 'destructive'
      });
    }
  };

  // Handle sharing product
  const handleShareProduct = async () => {
    if (!product) return;

    const shareData = {
      title: product.nume,
      text: `Vezi acest produs: ${product.nume}`,
      url: window.location.href
    };

    try {
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard copy
        await copyToClipboard(window.location.href);
      }
    } catch (error) {
      // If sharing fails or is cancelled, fallback to clipboard
      await copyToClipboard(window.location.href);
    }
  };

  // Navigate through product images
  const nextImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev === product.imagini.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev === 0 ? product.imagini.length - 1 : prev - 1));
    }
  };

  // Touch controls for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !product) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // Threshold for swipe detection (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, show next image
        nextImage();
      } else {
        // Swipe right, show previous image
        prevImage();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden relative h-96">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t('product_error_title')} </strong>
          <span className="block sm:inline">{error || t('product_not_found')}</span>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('product_back_button')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        <Link href="/" className="text-muted-foreground hover:text-primary whitespace-nowrap">
          {t('product_breadcrumb_home')}
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href={`/catalog?category=${product.subcategorie.categoriePrincipala.id}`}
          className="text-muted-foreground hover:text-primary whitespace-nowrap"
        >
          {product.subcategorie.categoriePrincipala.nume}
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href={`/catalog?subcategory=${product.subcategorie.id}`}
          className="text-muted-foreground hover:text-primary whitespace-nowrap"
        >
          {product.subcategorie.nume}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium truncate">{product.nume}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product images */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="relative overflow-hidden rounded-lg border border-border aspect-square bg-white"
            ref={galleryRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={product.imagini[selectedImage]}
                  alt={product.nume}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {product.imagini.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-transform duration-200 hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-transform duration-200 hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image pagination indicators */}
            {product.imagini.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {product.imagini.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage === idx
                        ? 'bg-primary w-4'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail gallery */}
          {product.imagini.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
              {product.imagini.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative border rounded-md overflow-hidden w-20 h-20 flex-shrink-0 transition-all duration-200 ${
                    selectedImage === idx
                      ? 'border-primary '
                      : 'border-border hover:border-primary'
                  }`}

                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{product.nume}</h1>
            <p className="text-muted-foreground mt-1">{t('product_code')} {product.cod}</p>
          </div>

          {/* Price and credit info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {/* Regular price */}
            {product.pretRedus ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-primary">{product.pretRedus.toLocaleString('ro-RO')} lei</span>
                <span className="text-lg text-muted-foreground line-through">{product.pret.toLocaleString('ro-RO')} lei</span>
                <Badge variant="destructive" className="ml-2">
                  -{getDiscountPercentage(product.pret, product.pretRedus)}%
                </Badge>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">{product.pret.toLocaleString('ro-RO')} lei</span>
            )}

          </div>

          {/* Stock status and delivery */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {product.stoc > 0 ? (
                <>
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                    <Check className="mr-1 h-3.5 w-3.5" />
                    {t('product_in_stock')}
                  </Badge>
                  <span className="text-muted-foreground">({product.stoc} {t('product_available')})</span>
                </>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
                  <X className="mr-1 h-3.5 w-3.5" />
                  {t('product_out_of_stock')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>{t('product_delivery_time')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stoc <= 0}
              className="h-12 flex-1 min-w-[200px] bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {t('product_add_to_cart')}
            </Button>

            <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 flex-1 min-w-[200px] group"
                >
                  <div className="relative mr-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  {t('product_buy_in_installments')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header with decorative badge and background */}
                <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 pb-6 sm:pb-8">
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold py-1 px-3 rounded-full">
                    {t('product_zero_interest')}
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full -mr-6 -mt-6 sm:-mr-10 sm:-mt-10"></div>
                  <div className="relative">
                    <DialogTitle className="text-xl sm:text-2xl">{t('product_installment_payment')}</DialogTitle>
                    <DialogDescription className="mt-1 sm:mt-2 text-sm">
                      {t('product_choose_financing_period')}
                    </DialogDescription>
                  </div>
                </div>

                <div className="p-4 sm:p-6 pt-8 sm:pt-10">
                  {/* Product and price summary */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-white flex items-center justify-center border border-gray-200">
                        {product.imagini && product.imagini[0] && (
                          <Image
                            src={product.imagini[0]}
                            alt={product.nume}
                            width={32}
                            height={32}
                            className="object-contain sm:w-10 sm:h-10"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">{product.nume}</h4>
                        <p className="text-xs text-muted-foreground">Cod: {product.cod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('product_total_price')}</p>
                      <p className="font-bold text-base sm:text-lg text-primary">
                        {(product.pretRedus || product.pret).toLocaleString('ro-RO')} lei
                      </p>
                    </div>
                  </div>

                  {/* Credit options in a better layout */}
                  <h4 className="font-medium text-sm sm:text-base mb-3 sm:mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {t('product_choose_payment_period')}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {creditDurations.map((months) => {
                      const payment = calculateMonthlyPayment(months);
                      const isRecommended = months === 12;

                      return (
                        <div
                          key={months}
                          className={`relative rounded-lg border ${isRecommended
                            ? 'border-primary shadow-sm'
                            : 'border-gray-200 hover:border-primary/50'}
                            transition-all cursor-pointer overflow-hidden`}
                          onClick={() => {
                            if (product) {
                              addItem({
                                ...product,
                                creditOption: {
                                  months,
                                  monthlyPayment: payment
                                }
                              });
                              toast({
                                title: t('product_product_added'),
                                description: `${product.nume} ${t('product_with_payment')} ${months} ${t('product_installments_of')} ${payment.toLocaleString('ro-RO')} ${t('product_per_month')}`,
                              });
                              setCreditDialogOpen(false);
                            }
                          }}
                        >
                          {isRecommended && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] py-0.5 px-2 rounded-bl-md">
                              {t('product_recommended')}
                            </div>
                          )}

                          <div className="p-2.5 sm:p-3 flex justify-between items-center">
                            <div>
                              <p className={`font-medium text-sm sm:text-base ${isRecommended ? 'text-primary' : ''}`}>
                                {months} {t('product_months')}
                              </p>
                              <p className="text-xs text-muted-foreground">{t('product_zero_interest_label')}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{t('product_monthly_payments')}</p>
                              <p className={`font-bold text-sm sm:text-base ${isRecommended ? 'text-primary' : ''}`}>
                                {payment.toLocaleString('ro-RO')} lei
                              </p>
                            </div>
                          </div>

                          {/* Progress bar to visually represent monthly payment amount */}
                          <div className="w-full bg-gray-100 h-0.5 sm:h-1">
                            <div
                              className="bg-primary h-full"
                              style={{
                                width: `${100 - (months / creditDurations[creditDurations.length-1]) * 90}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Additional info with better styling */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm border border-blue-100">
                    <div className="flex gap-2 sm:gap-3">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 mb-1">{t('product_important_info')}</p>
                        <ul className="text-blue-700 space-y-0.5 sm:space-y-1">
                          <li>• {t('product_financing_minimum')}</li>
                          <li>• {t('product_quick_approval')}</li>
                          <li>• {t('product_early_payment')}</li>
                        </ul>
                        <Link
                          href="/credit"
                          className="text-primary font-medium mt-2 inline-block hover:underline"
                          onClick={() => setCreditDialogOpen(false)}
                        >
                          {t('product_see_all_details')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with action button */}
                <div className="p-3 sm:p-4 bg-gray-50 border-t flex justify-end sm:justify-between items-center mt-2">
                  <p className="hidden sm:block text-sm text-muted-foreground">
                    {t('product_select_option')}
                  </p>
                  <Button
                    onClick={() => setCreditDialogOpen(false)}
                    variant="ghost"
                    className="w-full sm:w-auto"
                  >
                    {t('product_close')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              className={cn(
                "h-12 w-12 p-0 aspect-square transition-all",
                isFavorite && "bg-pink-50 text-pink-500 border-pink-200 hover:bg-pink-100 hover:text-pink-600"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 p-0 aspect-square"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium">{t('product_share_product')}</h4>
                  <div className="flex flex-col gap-2">
                    {hasWebShare ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShareProduct();
                        }}
                        className="w-full"
                      >
                        {t('product_share')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShareProduct();
                        }}
                        className="w-full"
                      >
                        {shareUrlCopied ? t('product_link_copied') : t('product_copy_link')}
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Short description */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {t('product_about_product')}
            </h3>
            {product.descriere && (
              <div className="prose prose-sm max-w-none">
                <p>{product.descriere}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Product specifications */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">{t('product_specifications')}</h2>
        <div className="py-4">
          {product.specificatii && Object.keys(product.specificatii).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(product.specificatii).map(([key, value]) => (
                <div key={key} className="flex py-2 border-b">
                  <span className="font-medium min-w-[180px]">{key}:</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t('product_no_specifications')}</p>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-6">{t('product_similar_products')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/produs/${relatedProduct.id}`}
                className="group border rounded-lg overflow-hidden transition-all hover:border-primary hover:shadow-md bg-white"
              >
                <div className="aspect-square relative overflow-hidden">
                  {relatedProduct.imagini && relatedProduct.imagini[0] ? (
                    <Image
                      src={relatedProduct.imagini[0]}
                      alt={relatedProduct.nume}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">{t('product_no_image')}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {relatedProduct.nume}
                  </h3>
                  <div className="mt-2">
                    {relatedProduct.pretRedus ? (
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold text-primary">{relatedProduct.pretRedus.toLocaleString('ro-RO')} lei</span>
                        <span className="text-sm text-muted-foreground line-through">{relatedProduct.pret.toLocaleString('ro-RO')} lei</span>
                      </div>
                    ) : (
                      <span className="font-bold text-primary">{relatedProduct.pret.toLocaleString('ro-RO')} lei</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
