"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Share2,
  Check,
  X,
  Truck,
  Info,
  Clock,
  CreditCard,
  Calendar,
  ZoomIn,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useDragControls,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/app/contexts/cart-context";
import { useFavorites } from "@/app/contexts/favorites-context";
import { useToast } from "@/app/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Product as MockProduct,
  getProductById,
  getRelatedProducts as getMockRelatedProducts,
} from "@/app/utils/mock-data";
import {
  ProductCard,
  ProductCardCompact,
} from "@/app/components/ui/product-card";
import SimilarProducts from "@/app/components/similar-products";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MorphingText } from "@/components/magicui/morphing-text";

// Update the Product interface to include properties needed for this page
interface Product extends MockProduct {
  stare?: string;
  creditOption?: {
    months: number;
    monthlyPayment: number;
  };
}

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
  const [isMobile, setIsMobile] = useState(false);

  // Add drag functionality state variables
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const dragConstraints = useRef<HTMLDivElement>(null);
  const [dragStarted, setDragStarted] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [isDraggable, setIsDraggable] = useState(true);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Thumbnail layout state for responsive design
  const [thumbnailLayout, setThumbnailLayout] = useState<
    "horizontal" | "vertical"
  >("horizontal");

  // Check for Web Share API availability
  useEffect(() => {
    setHasWebShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Add mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
          // If API fails, fallback to mock data using the utility function
          const mockProduct = getProductById(id) as Product;

          if (mockProduct) {
            // Add required properties for this component
            const productWithStare = {
              ...mockProduct,
              stare: "nou",
            };

            setProduct(productWithStare);
            setSelectedImage(0);
            fetchRelatedProductsFromMock(mockProduct.subcategorie.id);
          } else {
            setError("Produsul nu a fost găsit");
          }
        }
      } catch (error) {
        setError("A apărut o eroare la încărcarea produsului");
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

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
      const response = await fetch(
        `/api/products?subcategory=${subcategoryId}&limit=4`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out the current product
        setRelatedProducts(data.products.filter((p: Product) => p.id !== id));
      } else {
        fetchRelatedProductsFromMock(subcategoryId);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      fetchRelatedProductsFromMock(subcategoryId);
    }
  }

  function fetchRelatedProductsFromMock(subcategoryId: string) {
    if (!product) return;

    // Use the utility function to get related products
    const related = getMockRelatedProducts(
      product as MockProduct,
      4
    ) as Product[];

    // Add the stare property required by this component
    const relatedWithStare = related.map((p) => ({
      ...p,
      stare: "nou",
    }));

    setRelatedProducts(relatedWithStare);
  }

  // Handle adding to cart
  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast({
        title: "Produs adăugat în coș",
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
      setIsFavorite((prev) => !prev);

      // Update in context
      toggleFavorite(product.id);

      // Show toast notification
      toast({
        title: isFavorite
          ? "Produs eliminat din favorite"
          : "Produs adăugat la favorite",
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
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback: Oops, unable to copy", err);
          throw new Error("Copy failed");
        }

        textArea.remove();
      }

      setShareUrlCopied(true);
      toast({
        title: "Link copiat",
        description: "Link-ul a fost copiat în clipboard",
      });
      setTimeout(() => setShareUrlCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text: ", err);
      toast({
        title: "Eroare",
        description: "Nu s-a putut copia link-ul",
        variant: "destructive",
      });
    }
  };

  // Handle sharing product
  const handleShareProduct = async () => {
    if (!product) return;

    const shareData = {
      title: product.nume,
      text: `Vezi acest produs: ${product.nume}`,
      url: window.location.href,
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
      setSelectedImage((prev) =>
        prev === product.imagini.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setSelectedImage((prev) =>
        prev === 0 ? product.imagini.length - 1 : prev - 1
      );
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

  // Update container size on resize
  useEffect(() => {
    const updateLayout = () => {
      setThumbnailLayout(window.innerWidth >= 1024 ? "vertical" : "horizontal");
      setIsDraggable(!isMobile && window.innerWidth > 768);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [isMobile]);

  // Desktop drag handlers
  const handleDragStart = () => {
    setDragStarted(true);
    setDragDistance(0);
  };

  const handleDrag = (_: any, info: any) => {
    setDragDistance(info.offset.x);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragDistance) > 100 && product) {
      if (dragDistance > 0) {
        // Swiped right, show previous image
        prevImage();
      } else {
        // Swiped left, show next image
        nextImage();
      }
    }
    setDragStarted(false);
  };

  // Toggle zoom on image
  const toggleZoom = () => {
    setImageZoomed(!imageZoomed);
    setIsDraggable(!imageZoomed);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 relative min-h-screen isolate">
        {/* Grid Pattern Background */}
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-300/25 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] opacity-20"
          squares={[
            [0, 2],
            [5, 3],
            [2, 8],
            [8, 10],
            [10, 7],
            [12, 2],
            [15, 9],
          ]}
        />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden relative h-96 bg-white/40 backdrop-blur-sm border border-white/20 p-4">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
          <div className="space-y-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20 p-6">
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
      <div className="container mx-auto px-4 py-8 relative min-h-screen isolate">
        {/* Grid Pattern Background */}
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-300/25 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] opacity-20"
          squares={[
            [0, 2],
            [5, 3],
            [2, 8],
            [8, 10],
            [10, 7],
            [12, 2],
            [15, 9],
          ]}
        />
        <div
          className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 px-6 py-5 rounded-xl relative max-w-xl mx-auto shadow-sm"
          role="alert"
        >
          <strong className="font-bold text-lg">
            {t("product_error_title")}{" "}
          </strong>
          <span className="block sm:inline mt-1">
            {error || t("product_not_found")}
          </span>
          <ShimmerButton
            className="mt-4 border border-red-200 bg-white/80 backdrop-blur-sm text-red-700 hover:bg-white flex items-center rounded-md px-3 py-2"
            onClick={() => router.back()}
            shimmerColor="rgba(239, 68, 68, 0.1)"
            shimmerSize="0.1em"
            shimmerDuration="1.5s"
            background="transparent"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t("product_back_button")}
          </ShimmerButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen isolate">
      {/* Grid Pattern Background */}
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className="absolute inset-0 -z-10 h-full w-full stroke-gray-300/25 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] opacity-20"
        squares={[
          [0, 2],
          [5, 3],
          [2, 8],
          [8, 10],
          [10, 7],
          [12, 2],
          [15, 9],
        ]}
      />

      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary whitespace-nowrap"
        >
          {t("product_breadcrumb_home")}
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product images - Updated layout */}
        <motion.div
          className="lg:flex lg:gap-4 lg:items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Vertical thumbnail gallery for larger screens */}
          {product.imagini.length > 1 && thumbnailLayout === "vertical" && (
            <div className="hidden lg:flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 w-[85px] flex-shrink-0">
              {product.imagini.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  whileHover={{ scale: 1.05 }}
                  className={`relative border rounded-md overflow-hidden w-[75px] h-[75px] flex-shrink-0 transition-all duration-200 ${
                    selectedImage === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.nume} - Image ${idx + 1}`}
                    fill
                    sizes="75px"
                    className="object-contain p-1"
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* Main image container */}
          <div className="flex-1">
            <div
              className={`relative overflow-hidden rounded-lg border border-border bg-white ${
                imageZoomed
                  ? "cursor-zoom-out"
                  : isDraggable
                  ? "cursor-grab active:cursor-grabbing"
                  : ""
              } aspect-square max-h-[400px] lg:max-h-[450px] w-full max-w-[450px] mx-auto`}
              ref={galleryRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={toggleZoom}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                  drag={isDraggable && product.imagini.length > 1 ? "x" : false}
                  dragControls={dragControls}
                  dragConstraints={galleryRef}
                  dragElastic={0.1}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className={`w-full h-full relative ${
                      imageZoomed ? "scale-150 transition-transform" : ""
                    }`}
                  >
                    <Image
                      src={product.imagini[selectedImage]}
                      alt={product.nume || "Product image"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      className={`object-contain p-4 transition-transform duration-300`}
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {product.imagini.length > 1 && !imageZoomed && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-transform duration-200 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-transform duration-200 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Zoom button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 transition-transform duration-200 hover:scale-110"
                aria-label={imageZoomed ? "Zoom out" : "Zoom in"}
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {/* Image pagination indicators */}
              {product.imagini.length > 1 && !imageZoomed && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {product.imagini.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImage === idx
                          ? "bg-primary w-4"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Drag instruction for desktop */}
              {isDraggable &&
                product.imagini.length > 1 &&
                !isMobile &&
                !imageZoomed && (
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                      {t("product_drag_to_navigate") || "Drag to navigate"}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Horizontal thumbnail gallery for mobile/tablet */}
          {product.imagini.length > 1 && thumbnailLayout === "horizontal" && (
            <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar mt-4 lg:hidden">
              {product.imagini.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative border rounded-md overflow-hidden w-20 h-20 flex-shrink-0 transition-all duration-200 ${
                    selectedImage === idx
                      ? "border-primary ring-1 ring-primary/20"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.nume} - Image ${idx + 1}`}
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
          className="space-y-5 max-w-[600px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">
              {product.nume}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("product_code")} {product.cod}
            </p>
          </div>

          {/* Price and credit info */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-sm space-y-2">
            {/* Regular price */}
            {product.pretRedus ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-primary">
                  {product.pretRedus.toLocaleString("ro-RO")} lei
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {product.pret.toLocaleString("ro-RO")} lei
                </span>
                <Badge variant="destructive" className="ml-2">
                  -{getDiscountPercentage(product.pret, product.pretRedus)}%
                </Badge>
              </div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                {product.pret.toLocaleString("ro-RO")} lei
              </span>
            )}
          </div>

          {/* Stock status and delivery */}
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {product.stoc > 0 ? (
                <>
                  <Badge
                    variant="outline"
                    className="bg-green-50/80 backdrop-blur-sm text-green-700 hover:bg-green-50/80 border-green-200 transition-all duration-300 hover:shadow"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    {t("product_in_stock")}
                  </Badge>
                  <span className="text-muted-foreground">
                    ({product.stoc} {t("product_available")})
                  </span>
                </>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-gray-100/80 backdrop-blur-sm text-gray-700 hover:bg-gray-100/80 border-gray-200 transition-all duration-300 hover:shadow"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  {t("product_out_of_stock")}
                </Badge>
              )}
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Truck className="h-4 w-4 text-primary" />
              <span>{t("product_delivery_time")}</span>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <ShimmerButton
              onClick={handleAddToCart}
              disabled={product.stoc <= 0}
              className="h-10 sm:h-11 flex-1 min-w-0 text-sm sm:text-base flex items-center justify-center"
              shimmerColor={product.stoc > 0 ? "#00BFFF" : "#ccc"}
              shimmerSize="0.05em"
              shimmerDuration="2s"
              background="rgba(0, 114, 245, 0.9)"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("product_add_to_cart")}
            </ShimmerButton>

            <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 flex-1 min-w-0 text-sm sm:text-base flex items-center justify-center border-2 border-gray-400 bg-gray backdrop-blur-sm rounded-md hover:bg-white/80 transition-all duration-300 text-gray-700 "
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {t("product_view_credit_options")}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header with decorative badge and background */}
                <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 pb-6 sm:pb-8">
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold py-1 px-3 rounded-full">
                    {t("product_zero_interest")}
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full -mr-6 -mt-6 sm:-mr-10 sm:-mt-10"></div>
                  <div className="relative">
                    <DialogTitle className="text-lg sm:text-xl">
                      {t("product_credit_options")}
                    </DialogTitle>
                    <DialogDescription className="mt-1 sm:mt-2 text-sm">
                      {t("product_financing_description")}
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
                            alt={product.nume || "Product image"}
                            width={32}
                            height={32}
                            className="object-contain sm:w-10 sm:h-10"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">
                          {product.nume}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Cod: {product.cod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("product_total_price")}
                      </p>
                      <p className="font-bold text-base sm:text-lg text-primary">
                        {(product.pretRedus || product.pret).toLocaleString(
                          "ro-RO"
                        )}{" "}
                        lei
                      </p>
                    </div>
                  </div>

                  {/* Credit options in a better layout */}
                  <h4 className="font-medium text-sm sm:text-base mb-3 sm:mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {t("product_available_payment_periods")}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {creditDurations.map((months) => {
                      const payment = calculateMonthlyPayment(months);
                      const isRecommended = months === 12;

                      return (
                        <div
                          key={months}
                          className={`relative rounded-lg border ${
                            isRecommended
                              ? "border-primary shadow-sm"
                              : "border-gray-200"
                          } overflow-hidden`}
                        >
                          {isRecommended && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] py-0.5 px-2 rounded-bl-md">
                              {t("product_recommended")}
                            </div>
                          )}

                          <div className="p-2.5 sm:p-3 flex justify-between items-center">
                            <div>
                              <p
                                className={`font-medium text-sm sm:text-base ${
                                  isRecommended ? "text-primary" : ""
                                }`}
                              >
                                {months} {t("product_months")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("product_zero_interest_label")}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {t("product_monthly_payments")}
                              </p>
                              <p
                                className={`font-bold text-sm sm:text-base ${
                                  isRecommended ? "text-primary" : ""
                                }`}
                              >
                                {payment.toLocaleString("ro-RO")} lei
                              </p>
                            </div>
                          </div>

                          {/* Progress bar to visually represent monthly payment amount */}
                          <div className="w-full bg-gray-100 h-0.5 sm:h-1">
                            <div
                              className="bg-primary h-full"
                              style={{
                                width: `${
                                  100 -
                                  (months /
                                    creditDurations[
                                      creditDurations.length - 1
                                    ]) *
                                    90
                                }%`,
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
                        <p className="font-medium text-blue-700 mb-1">
                          {t("product_important_info")}
                        </p>
                        <ul className="text-blue-700 space-y-0.5 sm:space-y-1">
                          <li>• {t("product_financing_minimum")}</li>
                          <li>• {t("product_quick_approval")}</li>
                          <li>• {t("product_early_payment")}</li>
                        </ul>
                        <Link
                          href="/credit"
                          className="text-primary font-medium mt-2 inline-block hover:underline"
                          onClick={() => setCreditDialogOpen(false)}
                        >
                          {t("product_see_all_details")} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with action button */}
                <div className="p-3 sm:p-4 bg-gray-50 border-t flex justify-end items-center mt-2">
                  <ShimmerButton
                    onClick={() => setCreditDialogOpen(false)}
                    className="px-4 py-2 text-sm bg-transparent border border-gray-200 rounded-md"
                    shimmerColor="rgba(0, 0, 0, 0.05)"
                    shimmerSize="0.1em"
                    shimmerDuration="1.5s"
                    background="transparent"
                  >
                    {t("product_close")}
                  </ShimmerButton>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              className={cn(
                "h-10 w-10 sm:h-11 sm:w-11 p-0 aspect-square transition-all bg-white/50 backdrop-blur-sm border-gray-200",
                isFavorite &&
                  "bg-pink-50/80 text-pink-500 border-pink-200 hover:bg-pink-100/80 hover:text-pink-600"
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>

            <Popover>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium">{t("product_share_product")}</h4>
                  <div className="flex flex-col gap-2">
                    {hasWebShare ? (
                      <ShimmerButton
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShareProduct();
                        }}
                        className="w-full text-sm py-1.5"
                        shimmerColor="#00BFFF"
                        shimmerSize="0.03em"
                        shimmerDuration="1.5s"
                      >
                        {t("product_share")}
                      </ShimmerButton>
                    ) : (
                      <ShimmerButton
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShareProduct();
                        }}
                        className="w-full text-sm py-1.5"
                        shimmerColor="#00BFFF"
                        shimmerSize="0.03em"
                        shimmerDuration="1.5s"
                      >
                        {shareUrlCopied
                          ? t("product_link_copied")
                          : t("product_copy_link")}
                      </ShimmerButton>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Short description */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {t("product_about_product")}
            </h3>
            {product.descriere && (
              <div className="prose prose-sm max-w-none">
                <p>{product.descriere}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Product specifications - Enhanced Desktop UI */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-primary" />
          {t("product_specifications")}
        </h2>
        <div className="bg-white/70 backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4 sm:p-6">
          {product.specificatii &&
          Object.keys(product.specificatii).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(product.specificatii || {}).map(
                ([key, value], index, arr) => (
                  <div
                    key={key}
                    className="flex py-3 border-b border-gray-100 last:border-0 md:even:last:border-0 md:odd:last:md:border-0 group hover:bg-gray-50/50 transition-colors duration-200 rounded-lg px-2"
                  >
                    <span className="font-medium text-sm w-[40%] text-gray-700 group-hover:text-primary transition-colors duration-200">
                      {key}:
                    </span>
                    <span className="text-sm text-muted-foreground flex-1">
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-muted-foreground py-4 text-center">
              {t("product_no_specifications")}
            </p>
          )}
        </div>
      </div>

      {/* Similar Products - using the new component */}
      {relatedProducts.length > 0 && (
        <SimilarProducts
          relatedProducts={relatedProducts}
          currentProductId={product.id}
        />
      )}
    </div>
  );
}
