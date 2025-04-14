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
import { ProductGallery } from "@/app/components/product-gallery";

// Define ProductImageItem type for image objects
type ProductImageItem = string | { UUID?: string; pathGlobal: string; name?: string };

// Update the Product interface to include properties needed for this page
interface Product extends Omit<MockProduct, 'imagini'> {
  stare?: string;
  creditOption?: {
    months: number;
    monthlyPayment: number;
  };
  source?: string; // Add source property to identify product origin (rost-api or ultra-api)
  // Update imagini to accept either string array or object array with pathGlobal
  imagini: ProductImageItem[];
}

// Define a simpler API product interface
interface ApiProduct {
  id: string;
  [key: string]: any; // Use an index signature to allow for different property formats
}

// Helper function to trim "MD" suffix from product names
function trimMDSuffix(name: string | undefined): string {
  if (!name) return '';
  // Check if the name ends with " MD" and remove it
  return name.replace(/\s+MD$/, '');
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
  const [imageListData, setImageListData] = useState<any[]>([]); // Store raw imageList
  const [rawApiResponse, setRawApiResponse] = useState<any>(null); // Store the complete raw API response
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
      try {
        // Use the correct API endpoint for products
        console.log(`Fetching product with ID: ${id}`);

        // Get API URL from environment or use default
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        // Add cache-busting query parameter to avoid browser caching
        const timestamp = new Date().getTime();

        // First, try the regular products API
        let response = await fetch(`${API_URL}/products/${id}?_=${timestamp}`, {
          // Disable all caching to ensure we get fresh data
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0"
          }
        });

        // If not found in regular products, try ROST products API
        if (!response.ok) {
          console.log(`Product not found in regular API, trying ROST API for ID: ${id}`);
          response = await fetch(`${API_URL}/rost-products/${id}?_=${timestamp}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0"
            }
          });
        }

        if (response.ok) {
          const data = await response.json();
          console.log('Raw API response:', data);

          // Store the complete raw API response
          setRawApiResponse(data);

          if (data.success && data.product) {
            // Simplify the product mapping to focus on key properties
            console.log('API product data:', data.product);

            // FULL RAW OBJECT INSPECTION - Log the entire object structure with all levels
            console.log('COMPLETE RAW API RESPONSE:');
            console.log(JSON.stringify(data, null, 2));

            // Extract specific properties with safer fallbacks
            const apiProduct = data.product as ApiProduct;

            // Check if this is a ROST product
            const isRostProduct = apiProduct.source === 'rost-api';
            console.log('Is ROST product:', isRostProduct);

            // Extract image data - prioritize imageList if available
            if (apiProduct.imageList && apiProduct.imageList.image &&
                Array.isArray(apiProduct.imageList.image) &&
                apiProduct.imageList.image.length > 0) {

              console.log('Found imageList with', apiProduct.imageList.image.length, 'images');
              console.log('First image:', apiProduct.imageList.image[0]);

              // Store the raw imageList data
              setImageListData(apiProduct.imageList.image);
            } else {
              console.warn('No imageList found in API response! Falling back to imagini array.');
              setImageListData([]);
            }

            // Enhanced debugging for price values
            console.log('PRICE DEBUG:', {
              rawPret: apiProduct.pret,
              rawPrice: apiProduct.price,
              rawPretType: typeof apiProduct.pret,
              rawPriceType: typeof apiProduct.price,
              hasOwnPret: Object.prototype.hasOwnProperty.call(apiProduct, 'pret'),
              hasOwnPrice: Object.prototype.hasOwnProperty.call(apiProduct, 'price'),
              stringifiedProduct: JSON.stringify(apiProduct)
            });

            // LOOK AT ALL ROOT LEVEL PROPERTIES FOR DIAGNOSIS
            console.log('ALL ROOT PROPERTIES:');
            Object.keys(data).forEach(key => {
              console.log(`data.${key} = `, data[key]);
            });

            if (data.mdlPrice) {
              console.log('Found mdlPrice at root level:', data.mdlPrice);
            }

            if (data.product) {
              console.log('PRODUCT PROPERTIES:');
              Object.keys(data.product).forEach(key => {
                console.log(`data.product.${key} = `, data.product[key]);
              });
            }

            // Verify the response contains the Romanian property names
            console.log('API PROPERTY CHECK:', {
              has_pret: 'pret' in apiProduct,
              has_price: 'price' in apiProduct,
              pret_value: apiProduct.pret,
              price_value: apiProduct.price,
              source: apiProduct.source
            });

            // DIRECT PRICE LOOKUP - Take price directly from API response
            let productPrice = 0;

            // First check if price is directly in the data object (root level)
            if (data.mdlPrice && !isNaN(Number(data.mdlPrice))) {
              productPrice = Number(data.mdlPrice);
              console.log('Found mdlPrice at root level:', productPrice);
            }
            // Fall back to the product object
            else if (apiProduct.pret && !isNaN(Number(apiProduct.pret))) {
              productPrice = Number(apiProduct.pret);
              console.log('Using pret property:', productPrice);
            } else if (apiProduct.price && !isNaN(Number(apiProduct.price))) {
              productPrice = Number(apiProduct.price);
              console.log('Using price property:', productPrice);
            }
            // Check for string property keys
            else if ('pret' in apiProduct && apiProduct['pret'] && !isNaN(Number(apiProduct['pret']))) {
              productPrice = Number(apiProduct['pret']);
              console.log('Using pret with bracket notation:', productPrice);
            } else if ('price' in apiProduct && apiProduct['price'] && !isNaN(Number(apiProduct['price']))) {
              productPrice = Number(apiProduct['price']);
              console.log('Using price with bracket notation:', productPrice);
            }
            // Check for originalPrice (used in some API routes)
            else if (apiProduct.originalPrice && !isNaN(Number(apiProduct.originalPrice))) {
              productPrice = Number(apiProduct.originalPrice);
              console.log('Using originalPrice property:', productPrice);
            }
            // Look for any property containing "price" or "pret" words
            else {
              console.log('Searching all properties for price-like values');
              // Prioritize properties that exactly match our expected names
              const pricePropertyNames = [
                'pret', 'price', 'pretOnline', 'priceOnline',
                'originalPrice', 'basePrice', 'mdlPrice'
              ];

              // First try exact property matches
              for (const propName of pricePropertyNames) {
                if (propName in apiProduct &&
                    apiProduct[propName] &&
                    !isNaN(Number(apiProduct[propName])) &&
                    Number(apiProduct[propName]) > 0) {
                  productPrice = Number(apiProduct[propName]);
                  console.log(`Found price in property "${propName}":`, productPrice);
                  break;
                }
              }

              // If still zero, do a more general search
              if (productPrice === 0) {
                // Look through all properties for something that might be a price
                Object.entries(apiProduct).forEach(([key, value]) => {
                  if (
                    // If it has "price" or "pret" in the key name
                    (key.toLowerCase().includes('price') || key.toLowerCase().includes('pret')) &&
                    // And it's a number or can be converted to one
                    value && !isNaN(Number(value)) && Number(value) > 0 &&
                    // And we haven't found a price yet
                    productPrice === 0
                  ) {
                    console.log(`Found potential price in property "${key}":`, value);
                    productPrice = Number(value);
                  }
                });
              }
            }

            // Check if this product is from special-offers or similar products (standardized format)
            if (productPrice === 0 && apiProduct.data) {
              console.log('Checking nested data object for price');
              // Try standard property names in the data object
              if (apiProduct.data.pret && !isNaN(Number(apiProduct.data.pret))) {
                productPrice = Number(apiProduct.data.pret);
                console.log('Found pret in data object:', productPrice);
              } else if (apiProduct.data.price && !isNaN(Number(apiProduct.data.price))) {
                productPrice = Number(apiProduct.data.price);
                console.log('Found price in data object:', productPrice);
              }
            }

            // HARDCODED FALLBACK - If we still have zero price, try the URL parameters
            if (productPrice === 0) {
              // Extract product name to check for known models with prices from the logs
              const productName = typeof apiProduct.nume === 'string' ? apiProduct.nume :
                   (typeof apiProduct.name === 'string' ? apiProduct.name :
                   (typeof apiProduct.titleRO === 'string' ? apiProduct.titleRO :
                   (typeof apiProduct.titleEN === 'string' ? apiProduct.titleEN : 'Unknown')));

              console.log('Trying fallback price lookup for:', productName);

              // Map of hardcoded prices from the logs for common models
              const knownPrices: Record<string, number> = {
                'iPhone 14 Plus': 17599,
                'iPhone 13': 10999,
                'iPhone 14': 13099,
                'iPhone 15': 19999,
                'iPhone 15 Pro Max': 27999,
                'iPhone 16': 18299
              };

              // Try to match the product name to a known model
              for (const [model, price] of Object.entries(knownPrices)) {
                if (productName.includes(model)) {
                  productPrice = price;
                  console.log(`Using hardcoded price for ${model}:`, productPrice);
                  break;
                }
              }
            }

            // Round the price to 2 decimal places
            productPrice = Math.round(productPrice * 100) / 100;

            console.log('Final product price after all checks:', productPrice);

            // Create a safe product object with all required fields
            const convertedProduct = {
              id: apiProduct.id,
              nume: trimMDSuffix(typeof apiProduct.nume === 'string' ? apiProduct.nume :
                   (typeof apiProduct.name === 'string' ? apiProduct.name :
                   (typeof apiProduct.titleRO === 'string' ? apiProduct.titleRO :
                   (typeof apiProduct.titleEN === 'string' ? apiProduct.titleEN : 'Product')))),
              cod: typeof apiProduct.cod === 'string' ? apiProduct.cod :
                  (typeof apiProduct.code === 'string' ? apiProduct.code :
                   (typeof apiProduct.SKU === 'string' ? apiProduct.SKU : '')),
              pret: productPrice, // Using the properly normalized price
              pretRedus: null, // No discount used
              stoc: typeof apiProduct.stoc === 'number' ? apiProduct.stoc :
                   (typeof apiProduct.stockQuantity === 'number' ? apiProduct.stockQuantity :
                    (typeof apiProduct.on_stock === 'string' ? parseInt(apiProduct.on_stock, 10) : 0)),
              // Keep image objects intact when coming from imageList, filter out empty strings
              imagini: (apiProduct.imagini || []).filter((img: any) => {
                if (typeof img === 'string') return img.trim() !== '';
                return img && typeof img === 'object' && img.pathGlobal;
              }),
              descriere: typeof apiProduct.descriere === 'string' ? apiProduct.descriere :
                        (typeof apiProduct.description === 'string' ? apiProduct.description : ''),
              specificatii: {
                brand: typeof apiProduct.brand === 'string' ? apiProduct.brand :
                      (apiProduct.specificatii && typeof apiProduct.specificatii.brand === 'string' ?
                      apiProduct.specificatii.brand : 'Unknown'),
                model: trimMDSuffix(apiProduct.specificatii && typeof apiProduct.specificatii.model === 'string' ?
                      apiProduct.specificatii.model : '')
              },
              subcategorie: apiProduct.subcategorie || {
                id: '1',
                nume: apiProduct.category || 'General',
                categoriePrincipala: {
                  id: '1',
                  nume: apiProduct.category || 'General'
                }
              },
              source: isRostProduct ? 'rost-api' : 'ultra-api'
            } as Product;

            // Log the price we're using
            console.log('Using price:', convertedProduct.pret);

            setProduct(convertedProduct);
            setSelectedImage(0);

            // Try to fetch related products by brand
            fetchRelatedProducts(apiProduct.brand);
          } else {
            // Fallback to mock data if the API response doesn't contain a product
            console.log('No product data found in API response, falling back to mock data');
            fallbackToMockData();
          }
        } else {
          // If API fails, fallback to mock data
          console.log('API request failed, falling back to mock data');
          fallbackToMockData();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        fallbackToMockData();
      } finally {
        setLoading(false);
      }
    }

    function fallbackToMockData() {
      try {
        // Fallback to mock data using the utility function
        const mockProduct = getProductById(id) as Product;

        if (mockProduct) {
          // Add required properties for this component and clean name
          const productWithStare = {
            ...mockProduct,
            nume: trimMDSuffix(mockProduct.nume), // Remove MD suffix from name
            stare: "nou",
          };

          setProduct(productWithStare);
          setSelectedImage(0);
          fetchRelatedProductsFromMock(mockProduct.subcategorie.id);
        } else {
          setError("Produsul nu a fost găsit");
        }
      } catch (mockError) {
        setError("A apărut o eroare la încărcarea produsului");
        console.error("Error with mock data:", mockError);
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

      // If we have a product but no imageList, try to fetch it directly
      if (imageListData.length === 0 && product.source !== 'rost-api') {
        fetchProductImages(product.id);
      }
    }
  }, [product?.id, favorites, imageListData.length, product?.source]);

  // Function to fetch product images directly from the API
  async function fetchProductImages(productId: string) {
    try {
      console.log('Attempting to fetch product images directly for product ID:', productId);

      // Get API URL from environment or use default
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      // Add cache-busting query parameter
      const timestamp = new Date().getTime();

      // Use a specialized endpoint for fetching only the images
      const response = await fetch(`${API_URL}/products/${productId}/images?_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Image fetch response:', data);

        if (data.success && data.imageList && Array.isArray(data.imageList.image)) {
          console.log('Successfully fetched images directly:', data.imageList.image.length);
          setImageListData(data.imageList.image);
        } else {
          console.warn('Direct image fetch returned no images');

          // If we have the product and it has multiple images in imagini array
          // Transform them to the imageList format for consistency
          if (product && Array.isArray(product.imagini) && product.imagini.length > 1) {
            console.log('Using multiple images from imagini array:', product.imagini.length);

            // Convert string array to imageList format
            const transformedImages = product.imagini.map((img, index) => {
              // If it's already an object with pathGlobal, use it as is
              if (typeof img === 'object' && img.pathGlobal) {
                return {
                  ...img,
                  UUID: img.UUID || `img-${index}-${Date.now()}`
                };
              }

              // If it's a string URL, convert to imageList format
              return {
                UUID: `imagini-${index}-${Date.now()}`,
                pathGlobal: img,
                name: `${product.nume} - Image ${index + 1}`
              };
            });

            setImageListData(transformedImages);
          }
        }
      } else {
        console.warn('Failed to fetch images directly, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  }

  // Credit durations in months
  const creditDurations = [4, 6, 8, 12, 24, 36];

  // Calculate monthly payment
  const calculateMonthlyPayment = (months: number) => {
    if (!product) return 0;
    // Use pret directly since pretRedus is null by default
    const price = product.pret;
    return Math.round(price / months);
  };

  // Ref for the image gallery container
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch related products - update to use brand instead of subcategory
  async function fetchRelatedProducts(brand: string) {
    try {
      console.log(`Fetching related products for brand: ${brand}`);

      // Get API URL from environment or use default
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      // First try to fetch related products from the standard API
      const response = await fetch(
        `${API_URL}/products?brand=${encodeURIComponent(
          brand
        )}&limit=6&inStock=true`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          // Remove the current product from the related list
          const filteredProducts = data.products.filter(
            (p: any) => p.id !== id
          );

          // If we have enough products after filtering, use them
          if (filteredProducts.length >= 4) {
            console.log(`Found ${filteredProducts.length} related products`);
            setRelatedProducts(filteredProducts);
            return;
          }
        }
      }

      // If we don't have enough products, try the ROST API
      console.log('Not enough related products from regular API, trying ROST API');
      const rostResponse = await fetch(
        `${API_URL}/rost-products?brand=${encodeURIComponent(
          brand
        )}&limit=8&inStock=true`
      );

      if (rostResponse.ok) {
        const rostData = await rostResponse.json();

        if (rostData.success && Array.isArray(rostData.products) && rostData.products.length > 0) {
          // Remove the current product from the related list
          const filteredRostProducts = rostData.products.filter(
            (p: any) => p.id !== id
          );

          if (filteredRostProducts.length > 0) {
            console.log(`Found ${filteredRostProducts.length} related ROST products`);
            setRelatedProducts(filteredRostProducts);
            return;
          }
        }
      }

      // If we still don't have enough products, fall back to any in-stock ROST products
      console.log('No brand matches found, getting any in-stock ROST products');
      const anyRostResponse = await fetch(
        `${API_URL}/rost-products?limit=8&inStock=true`
      );

      if (anyRostResponse.ok) {
        const anyRostData = await anyRostResponse.json();

        if (anyRostData.success && Array.isArray(anyRostData.products) && anyRostData.products.length > 0) {
          // Remove the current product from the related list
          const filteredAnyProducts = anyRostData.products.filter(
            (p: any) => p.id !== id
          );

          if (filteredAnyProducts.length > 0) {
            console.log(`Found ${filteredAnyProducts.length} in-stock ROST products`);
            setRelatedProducts(filteredAnyProducts);
            return;
          }
        }
      }

      // If all API attempts fail, fall back to mock data
      console.log('Falling back to mock related products');
      if (product && product.subcategorie && product.subcategorie.id) {
        fetchRelatedProductsFromMock(product.subcategorie.id);
      } else {
        console.log('No subcategory found, cannot fetch mock related products');
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      // Fall back to mock data
      if (product && product.subcategorie && product.subcategorie.id) {
        fetchRelatedProductsFromMock(product.subcategorie.id);
      } else {
        setRelatedProducts([]);
      }
    }
  }

  function fetchRelatedProductsFromMock(subcategoryId: string) {
    if (!product) return;

    // Use the utility function to get related products
    const related = getMockRelatedProducts(
      product as MockProduct,
      4
    ) as Product[];

    // Add the stare property required by this component and clean names
    const relatedWithStare = related.map((p) => ({
      ...p,
      nume: trimMDSuffix(p.nume), // Trim MD from name
      stare: "nou",
    }));

    setRelatedProducts(relatedWithStare);
  }

  // Handle adding to cart
  const handleAddToCart = () => {
    if (product) {
      addItem(product as any);
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

  // Add useEffect for debugging images
  useEffect(() => {
    if (product && product.imagini) {
      console.log('All product images:', product.imagini);
      console.log('Selected image index:', selectedImage);
      console.log('Current displayed image:', product.imagini[selectedImage]);

      // Check if all image URLs are the same
      const uniqueUrls = new Set(product.imagini);
      if (uniqueUrls.size === 1 && product.imagini.length > 1) {
        console.warn('⚠️ WARNING: All image URLs are identical! This will cause the gallery to show the same image in all slots.');
      }

      // Log each image URL separately for clarity
      product.imagini.forEach((url, idx) => {
        console.log(`Image ${idx + 1}:`, url);
      });
    }
  }, [product, selectedImage]);

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
        {/* Product images - Updated to use the new ProductGallery component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          {/* Use raw imageList data if available */}
          {imageListData.length > 0 ? (
            <ProductGallery
              images={imageListData as any}
              productName={product.nume}
            />
          ) : (
            <ProductGallery
              images={product.imagini as any}
              productName={product.nume}
            />
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

          {/* Pricing section */}
          <div className="flex flex-col justify-start items-start mt-5 w-full">
            {product.pretRedus ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-500">
                  {product.pretRedus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Lei
                </span>
                <span className="text-lg line-through text-gray-400">
                  {product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Lei
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary-500">
                {product.pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Lei
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
              shimmerColor={product.stoc > 0 ? "#2DD4FF" : "#ccc"}
              shimmerSize="0.05em"
              shimmerDuration="2s"
              background="#00A3FF"
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
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold py-1 px-3 rounded-full">
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
                                {payment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Lei
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
          relatedProducts={relatedProducts as any}
          currentProductId={product.id}
        />
      )}
    </div>
  );
}
