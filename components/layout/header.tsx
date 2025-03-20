"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  ChevronRight,
  LayoutGrid,
  LogIn,
  X,
  Phone,
  Clock,
  Package,
  Minus,
  Plus,
  Home,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useRouter, usePathname } from "next/navigation";
import { ProductCard } from "@/app/components/ui/product-card";
import { ProductCardCompact } from "@/app/components/ui/product-card";
import { useCart } from "@/app/contexts/cart-context";
import { signIn, signOut, useSession } from "next-auth/react";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { useProtectedSession } from "@/lib/hooks/use-protected-session";
import {
  CategoryWithSubcategories,
  Produs,
  getCategoriesWithProducts,
} from "@/lib/mock-data";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Add Facebook icon component
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const {
    totalItems,
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const { data: session, status } = useProtectedSession();
  // Desktop states
  const [isDesktopCatalogOpen, setIsDesktopCatalogOpen] = useState(false);
  const [isDesktopUserMenuOpen, setIsDesktopUserMenuOpen] = useState(false);
  const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Produs[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Announcement bar animation
  const baseVelocity = -0.5;
  const baseX = useMotionValue(0);
  const announcements = [
    "0% Credit - Cumpără acum, plătește mai târziu",
    "Rate fără dobândă până la 36 de luni",
  ];

  const announcementWidth = 2000; // Increased width to prevent overlapping

  const wrap = (x: number) => {
    const rangeX = announcementWidth;
    const x2 = x % rangeX;
    return x2;
  };

  useAnimationFrame((time, delta) => {
    let moveBy = baseVelocity * (delta / 16);
    baseX.set(wrap(baseX.get() + moveBy));
  });

  const x = useTransform(baseX, (value) => `${wrap(value)}px`);

  // Add refs for click outside detection
  const catalogRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const cartMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm) {
        setIsSearching(true);
        try {
          // Using mock data instead of API call
          // This is a placeholder that would be replaced with a custom API call
          setSearchResults([]);
          setIsSearching(false);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the categories with products from our mock data file
        const categoriesWithProducts = getCategoriesWithProducts();
        setCategories(categoriesWithProducts);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Add useEffect for click outside detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsDesktopUserMenuOpen(false);
      }

      // Close cart menu if click is outside
      if (
        cartMenuRef.current &&
        !cartMenuRef.current.contains(event.target as Node)
      ) {
        setIsDesktopCartOpen(false);
      }

      // Only close catalog if click is outside both the menu content AND the catalog button
      if (catalogRef.current) {
        const catalogButton = catalogRef.current.querySelector("button");
        const menuContent = document.querySelector(".desktop-catalog-menu");
        const isClickInsideMenu = menuContent?.contains(event.target as Node);
        const isClickOnButton = catalogButton?.contains(event.target as Node);

        if (
          !isClickInsideMenu &&
          !isClickOnButton &&
          !catalogRef.current.contains(event.target as Node)
        ) {
          setIsDesktopCatalogOpen(false);
        }
      }
    }

    // Add the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragEnd = (
    info: PanInfo,
    menuType: "catalog" | "user" | "menu"
  ) => {
    const threshold = 50; // minimum distance to trigger close
    if (info.offset.y > threshold) {
      switch (menuType) {
        case "catalog":
          setIsDesktopCatalogOpen(false);
          break;
        case "user":
          setIsDesktopUserMenuOpen(false);
          break;
        case "menu":
          setActiveMobileCategory(null);
          break;
      }
    }
  };

  // Cart menu state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Handle sign in with Google
  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  // Handle sign in with Facebook
  const handleFacebookSignIn = async () => {
    await signIn("facebook", { callbackUrl: "/" });
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto">
          {/* Top bar */}
          <div className="hidden md:block border-b">
            <div className="flex h-9 lg:h-10 items-center justify-between text-xs lg:text-sm">
              {/* Left section - Contact and Hours */}
              <div className="flex items-center gap-3 lg:gap-6">
                <a
                  href="tel:+37360123456"
                  className="flex items-center gap-1 lg:gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                  <span>+373 601 75 111</span>
                </a>
                <div className="flex items-center gap-1 lg:gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                  <span>{t("workingHours")}</span>
                </div>
              </div>

              {/* Right section - Links and Language */}
              <div className="flex items-center gap-3 lg:gap-6">
                <nav className="flex items-center gap-2 lg:gap-4">
                  <Link
                    href="/credit"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("credit")}
                  </Link>
                  <Link
                    href="/livrare"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("delivery")}
                  </Link>
                </nav>
                <div className="flex items-center gap-1 lg:gap-2 border-l pl-3 lg:pl-4">
                  <button
                    className={cn(
                      "text-xs lg:text-sm transition-colors",
                      language === "ro"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => {
                      setLanguage("ro");
                      window.location.reload();
                    }}
                  >
                    RO
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <button
                    className={cn(
                      "text-xs lg:text-sm transition-colors",
                      language === "ru"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => {
                      setLanguage("ru");
                      window.location.reload();
                    }}
                  >
                    RU
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main header */}
          <div className="relative hidden md:flex h-20 items-center justify-between gap-4 pt-4 pb-2">
            {/* Left section - Logo and Catalog */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden">
                  <Image
                    src="/logo.jpg"
                    alt="Intelect MD"
                    fill
                    className="object-contain p-1 rounded-full"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                    Intelect MD
                  </h1>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {t("techStore")}
                  </p>
                </div>
              </Link>
              <div className="hidden md:flex items-center" ref={catalogRef}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1 lg:gap-2 px-3 lg:px-5 py-6 h-11 lg:h-12 text-sm lg:text-base transition-all duration-200 rounded-lg hover:bg-accent/80",
                    isDesktopCatalogOpen
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "hover:shadow-sm"
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling
                    setIsDesktopCatalogOpen(!isDesktopCatalogOpen);
                    if (!isDesktopCatalogOpen) {
                      setHoveredCategory(categories[0]?.id || null);
                    }
                  }}
                >
                  <LayoutGrid className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="font-medium">{t("catalog")}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300",
                      isDesktopCatalogOpen && "rotate-180"
                    )}
                  />
                </Button>
              </div>
            </div>

            {/* Center section - Search */}
            <div className="hidden md:flex flex-1 w-full mx-2 lg:mx-4">
              <div className="relative w-full">
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                      // Redirect to catalog page with search query
                      const params = new URLSearchParams();
                      // Use the exact search term for consistency
                      params.set("q", searchTerm.trim());

                      // Ensure we're starting on page 1
                      params.set("page", "1");

                      // If already on catalog page, use replace to update URL without navigation
                      if (pathname === "/catalog") {
                        router.replace(`/catalog?${params.toString()}`, {
                          scroll: false, // Prevent scrolling to top
                        });
                      } else {
                        // Otherwise navigate to catalog
                        router.push(`/catalog?${params.toString()}`);
                      }
                    }
                  }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 lg:h-5 lg:w-5" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    className="w-full h-10 lg:h-12 pl-10 lg:pl-12 pr-4 text-sm lg:text-base rounded-full border border-input bg-accent/50 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/70"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white h-6 lg:h-7 w-6 lg:w-7 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors"
                    aria-label="Search"
                  >
                    <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right section - Cart and User */}
            <div className="hidden md:flex items-center gap-1 lg:gap-3">
              <Link href="/contact" className="px-2 lg:px-3">
                <Button
                  variant="ghost"
                  className="text-sm lg:text-base h-10 lg:h-12 px-2 lg:px-4 hover:text-primary"
                >
                  {t("contact")}
                </Button>
              </Link>

              <div className="relative" ref={cartMenuRef}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="relative hover:bg-accent/80 h-10 lg:h-12 px-3 lg:px-4"
                  onClick={() => setIsDesktopCartOpen(!isDesktopCartOpen)}
                >
                  <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                      {totalItems}
                    </span>
                  )}
                </Button>

                {/* Desktop Cart Dropdown */}
                <AnimatePresence>
                  {isDesktopCartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-80 md:w-96 rounded-xl bg-white shadow-xl z-50 overflow-hidden border border-gray-100"
                    >
                      <div className="p-3 lg:p-4 border-b flex items-center justify-between bg-gray-50/80 backdrop-blur-sm">
                        <h3 className="font-medium text-base lg:text-lg flex items-center gap-1.5 lg:gap-2">
                          <ShoppingCart className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
                          {t("cart_title")}
                          {totalItems > 0 && (
                            <motion.span
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white"
                            >
                              {totalItems}
                            </motion.span>
                          )}
                        </h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 lg:h-8 lg:w-8 rounded-full hover:bg-gray-200/70"
                          onClick={() => setIsDesktopCartOpen(false)}
                        >
                          <X className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                      </div>

                      {items.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="p-4 lg:p-6 text-center"
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.2,
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                            className="flex h-14 w-14 lg:h-16 lg:w-16 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3 lg:mb-4"
                          >
                            <ShoppingCart className="h-7 w-7 lg:h-8 lg:w-8" />
                          </motion.div>
                          <h4 className="font-medium text-sm lg:text-base mb-1 lg:mb-2">
                            {t("cart_empty")}
                          </h4>
                          <p className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4">
                            {t("cart_empty_description")}
                          </p>
                          <Button
                            variant="outline"
                            className="text-xs lg:text-sm h-8 lg:h-9 rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                            onClick={() => {
                              setIsDesktopCartOpen(false);
                              setIsDesktopCatalogOpen(true);
                            }}
                          >
                            <LayoutGrid className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" />
                            {t("cart_explore_catalog")}
                          </Button>
                        </motion.div>
                      ) : (
                        <>
                          <div className="max-h-72 lg:max-h-96 overflow-y-auto p-3 lg:p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                            <div className="space-y-2 lg:space-y-3">
                              {items.map((item, index) => (
                                <motion.div
                                  key={item.product.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ scale: 1.01 }}
                                  className="flex gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                >
                                  <div className="relative w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/90 border border-primary/10 shadow-sm group-hover:shadow-md transition-all">
                                    {item.product.imagini[0] ? (
                                      <Image
                                        src={item.product.imagini[0]}
                                        alt={item.product.nume}
                                        fill
                                        className="object-contain p-1 transition-transform group-hover:scale-105 duration-300"
                                        sizes="(max-width: 768px) 48px, 64px"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Package className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                      {item.product.nume}
                                    </h4>
                                    <div className="text-xs text-muted-foreground mt-1.5 flex items-center">
                                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-600 mr-1">
                                        {t("cart_product_code")}
                                      </span>
                                      {item.product.cod}
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex flex-col">
                                        <div className="text-base font-semibold text-primary">
                                          {((item.product.pretRedus || item.product.pret) * item.quantity).toLocaleString()} MDL
                                        </div>
                                        {item.product.pretRedus && (
                                          <div className="text-xs text-muted-foreground line-through">
                                            {(item.product.pret * item.quantity).toLocaleString()} MDL
                                          </div>
                                        )}
                                      </div>

                                    </div>
                                  </div>
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeItem(item.product.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </motion.button>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          <motion.div
                            className="p-3 lg:p-4 border-t bg-gray-50/80 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center justify-between mb-3 lg:mb-4">
                              <span className="font-medium text-sm lg:text-base text-gray-500">
                                {t("cart_total")}
                              </span>
                              <motion.span
                                className="font-semibold text-base lg:text-lg"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.3,
                                  type: "spring",
                                  stiffness: 300,
                                }}
                              >
                                {totalPrice.toLocaleString()} MDL
                              </motion.span>
                            </div>
                            <div className="flex items-center justify-between mb-3 lg:mb-4 text-[10px] lg:text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Package className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                                {t("cart_free_delivery")}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              className="flex items-center justify-center w-full mb-2 text-xs lg:text-sm h-8 lg:h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => clearCart()}
                            >
                              <X className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                              {t("cart_clear") || "Clear Cart"}
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 text-xs lg:text-sm h-8 lg:h-10 rounded-full border-primary/20 text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setIsDesktopCartOpen(false);
                                  window.location.href = "/cart";
                                }}
                              >
                                {t("cart_title")}
                              </Button>
                              <Button
                                className="flex-1 text-xs lg:text-sm h-8 lg:h-10 rounded-full bg-primary hover:bg-primary/90 text-white"
                                onClick={() => {
                                  setIsDesktopCartOpen(false);
                                  window.location.href = "/checkout";
                                }}
                              >
                                {t("cart_checkout")}
                              </Button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 lg:h-12 lg:w-12"
                  onClick={() =>
                    setIsDesktopUserMenuOpen(!isDesktopUserMenuOpen)
                  }
                >
                  {status === "authenticated" && session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority
                    />
                  ) : (
                    <User className="h-5 w-5 lg:h-6 lg:w-6" />
                  )}
                </Button>

                <AnimatePresence>
                  {isDesktopUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 md:w-72 origin-top-right rounded-lg border bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 desktop-catalog-menu"
                    >
                      <div className="p-4">
                        {status === "authenticated" ? (
                          <div>
                            <div className="flex items-center gap-3 lg:gap-4">
                              <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-accent/50 flex items-center justify-center">
                                {session.user?.image ? (
                                  <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-primary"
                                  />
                                ) : (
                                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs lg:text-sm text-black font-medium">
                                  {session.user?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {session.user?.email}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-1 lg:space-y-2">
                              <Link
                                href="/comenzi"
                                className="flex items-center justify-between rounded-lg px-3 py-1.5 lg:py-2 text-xs lg:text-sm hover:bg-accent hover:text-primary transition-colors w-full"
                                onClick={() => setIsDesktopUserMenuOpen(false)}
                              >
                                <span>{t("myOrders")}</span>
                                <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                              </Link>
                              <Link
                                href="/favorite"
                                className="flex items-center justify-between rounded-lg px-3 py-1.5 lg:py-2 text-xs lg:text-sm hover:bg-accent hover:text-primary transition-colors w-full"
                                onClick={() => setIsDesktopUserMenuOpen(false)}
                              >
                                <span>{t("favorites")}</span>
                                <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                              </Link>
                              <Link
                                href="/credit"
                                className="flex items-center justify-between rounded-lg px-3 py-1.5 lg:py-2 text-xs lg:text-sm hover:bg-accent hover:text-primary transition-colors w-full"
                                onClick={() => setIsDesktopUserMenuOpen(false)}
                              >
                                <span>{t("buyInInstallments")}</span>
                                <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                              </Link>
                            </div>

                            <div className="mt-4">
                              <Button
                                className="w-full text-xs lg:text-sm h-8 lg:h-9"
                                variant="destructive"
                                onClick={handleSignOut}
                              >
                                {t("signOut")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-3 lg:gap-4">
                              <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-accent/50 flex items-center justify-center">
                                <User className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs lg:text-sm text-black font-medium">
                                  {t("welcome")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("loginToContinue")}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button
                                className="w-full text-xs lg:text-sm h-8 lg:h-9"
                                variant="outline"
                                onClick={handleGoogleSignIn}
                              >
                                <div className="bg-white rounded-full p-1 mr-2">
                                  <GoogleIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                                </div>
                                <span>{t("signInWithGoogle")}</span>
                              </Button>
                              <Button
                                className="w-full mt-2 text-xs lg:text-sm h-8 lg:h-9"
                                variant="outline"
                                onClick={handleFacebookSignIn}
                              >
                                <div className="bg-white rounded-full p-1 mr-2">
                                  <FacebookIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                                </div>
                                {t("signInWithFacebook")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Desktop mega menu */}
          <AnimatePresence>
            {isDesktopCatalogOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full bg-white border-b shadow-lg backdrop-blur-sm bg-white/95 z-50 desktop-catalog-menu"
              >
                <div className="container mx-auto py-6 lg:py-8">
                  <div className="grid grid-cols-[220px,1fr] lg:grid-cols-[280px,1fr] divide-x divide-gray-100">
                    {/* Categories list */}
                    <div className="pr-4 lg:pr-8">
                      <h3 className="text-xs lg:text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3 lg:mb-4 px-3 lg:px-4">
                        {t("catalog")}
                      </h3>
                      <ul className="space-y-1 lg:space-y-1.5">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <button
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base font-medium transition-all duration-200",
                                hoveredCategory === category.id
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                              )}
                              onMouseEnter={() =>
                                setHoveredCategory(category.id)
                              }
                            >
                              <span>
                                {category.numeKey
                                  ? t(category.numeKey)
                                  : category.nume}
                              </span>
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-200",
                                  hoveredCategory === category.id &&
                                    "translate-x-0.5"
                                )}
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Subcategories */}
                    <div className="px-4 lg:px-8">
                      {hoveredCategory && (
                        <div className="space-y-4 lg:space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs lg:text-sm font-medium uppercase tracking-wide text-muted-foreground">
                              {t("subcategories")}
                            </h3>
                            <Link
                              href={`/catalog?category=${hoveredCategory}`}
                              className="text-xs lg:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                              onClick={() => setIsDesktopCatalogOpen(false)}
                            >
                              {t("seeAll")}
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 lg:gap-x-6 gap-y-2">
                            {categories
                              .find((cat) => cat.id === hoveredCategory)
                              ?.subcategorii.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  href={`/catalog?category=${hoveredCategory}&subcategory=${subcategory.id}`}
                                  className="group flex items-center p-2 lg:p-3 rounded-lg border border-transparent bg-accent/40 hover:bg-accent hover:border-accent/50 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                                  onClick={() => setIsDesktopCatalogOpen(false)}
                                >
                                  {subcategory.imagine && (
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/90 border border-primary/10 shadow-sm group-hover:shadow-md transition-all">
                                      <Image
                                        src={subcategory.imagine}
                                        alt={
                                          subcategory.numeKey
                                            ? t(subcategory.numeKey)
                                            : subcategory.nume
                                        }
                                        fill
                                        className="object-contain p-1 transition-transform group-hover:scale-105 duration-300"
                                        sizes="64px"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm lg:text-base truncate group-hover:text-primary transition-colors">
                                      {subcategory.numeKey
                                        ? t(subcategory.numeKey)
                                        : subcategory.nume}
                                    </p>
                                    {subcategory.descriere && (
                                      <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/70 transition-colors">
                                        {subcategory.descriere}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-2 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 duration-200" />
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile bottom navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-t border-gray-100 md:hidden">
            <div className="container mx-auto px-2 pb-safe">
              <div className="grid grid-cols-5 gap-1">
                <button
                  onClick={() => router.push("/")}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                      pathname === "/"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Home className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 transition-colors",
                      pathname === "/"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {t("home")}
                  </span>
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                      isMobileMenuOpen
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Menu className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 transition-colors",
                      isMobileMenuOpen
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {t("catalog")}
                  </span>
                </button>

                <button
                  onClick={() => router.push("/contact")}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                      pathname === "/contact"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <MapPin className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 transition-colors",
                      pathname === "/contact"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {t("contact")}
                  </span>
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                      isCartOpen
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <ShoppingCart className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 transition-colors",
                      isCartOpen
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {t("cart")}
                  </span>
                </button>

                <button
                  onClick={() => setIsMobileUserMenuOpen(true)}
                  className="group flex flex-col items-center justify-center py-2"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                      isMobileUserMenuOpen
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <User className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 transition-colors",
                      isMobileUserMenuOpen
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    {t("account")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <motion.div
                  ref={menuRef}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => handleDragEnd(info, "menu")}
                  className="fixed inset-x-0 bottom-0 h-[85vh] bg-white shadow-xl z-50 md:hidden flex flex-col overflow-hidden rounded-t-2xl"
                >
                  {/* Menu header */}
                  <div className="flex items-center justify-between px-4 h-16 border-b">
                    <h2 className="font-semibold text-2xl">{t("catalog")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Menu content */}
                  <div className="flex-1 overflow-y-auto">
                    {activeMobileCategory ? (
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="h-full"
                      >
                        {/* Back button */}
                        <button
                          className="flex items-center gap-2 p-4 w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          onClick={() => setActiveMobileCategory(null)}
                        >
                          <ChevronDown className="h-4 w-4 rotate-90" />
                          {t("back")}
                        </button>

                        {/* Category header */}
                        <div className="px-4 pb-4">
                          <h3 className="font-semibold text-lg">
                            {(() => {
                              const category = categories.find(
                                (cat) => cat.id === activeMobileCategory
                              );
                              return category?.numeKey
                                ? t(category.numeKey)
                                : category?.nume;
                            })()}
                          </h3>
                        </div>

                        {/* Subcategories grid */}
                        <div className="grid grid-cols-2 gap-4 px-4 pb-20">
                          {categories
                            .find((cat) => cat.id === activeMobileCategory)
                            ?.subcategorii.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/catalog?category=${activeMobileCategory}&subcategory=${subcategory.id}`}
                                className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white border shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                                  {subcategory.imagine ? (
                                    <Image
                                      src={subcategory.imagine}
                                      alt={
                                        subcategory.numeKey
                                          ? t(subcategory.numeKey)
                                          : subcategory.nume
                                      }
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                                      priority
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>
                                <div className="flex items-center justify-between p-4">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                      {subcategory.numeKey
                                        ? t(subcategory.numeKey)
                                        : subcategory.nume}
                                    </h4>
                                    <p className="mt-1 text-xs text-muted-foreground truncate">
                                      {subcategory.produse?.length || 0}{" "}
                                      {t("products")}
                                    </p>
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                                      <ChevronRight className="h-4 w-4" />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full"
                      >
                        {/* Main categories list */}
                        <div className="divide-y">
                          {categories.map((category) => (
                            <div key={category.id} className="flex w-full">
                              <div
                                className="flex-1 flex items-center justify-between px-4 py-4 text-base hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() =>
                                  setActiveMobileCategory(category.id)
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {category.numeKey
                                      ? t(category.numeKey)
                                      : category.nume}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {category.subcategorii.length}{" "}
                                    {t("subcategories").toLowerCase()}
                                  </span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Link
                                href={`/catalog?category=${category.id}`}
                                className="px-4 flex items-center justify-center text-primary hover:bg-accent/50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {t("seeAll")}
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Quick links */}
                        <div className="border-t px-4 py-6 space-y-2">
                          <Link
                            href="/credit"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>{t("credit")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/livrare"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>{t("delivery")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>{t("contact")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </div>

                        {/* Language switcher */}
                        <div className="border-t px-4 py-6">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              className={cn(
                                "text-sm transition-colors px-3 py-1 rounded-md",
                                language === "ro"
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() => {
                                setLanguage("ro");
                                window.location.reload();
                              }}
                            >
                              Română
                            </button>
                            <button
                              className={cn(
                                "text-sm transition-colors px-3 py-1 rounded-md",
                                language === "ru"
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() => {
                                setLanguage("ru");
                                window.location.reload();
                              }}
                            >
                              Русский
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile search overlay */}
          <AnimatePresence>
            {showMobileSearch && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setShowMobileSearch(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 50) {
                      setShowMobileSearch(false);
                    }
                  }}
                  className="fixed inset-x-0 bottom-0 h-[85vh] bg-white shadow-xl z-50 md:hidden flex flex-col overflow-hidden rounded-t-2xl"
                >
                  {/* Search header */}
                  <div className="flex items-center justify-between px-4 h-16 border-b">
                    <h2 className="font-semibold text-lg">{t("search")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobileSearch(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Search input */}
                  <div className="p-4 border-b">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchTerm.trim()) {
                          // Redirect to catalog page with search query
                          const params = new URLSearchParams();
                          params.set("q", searchTerm.trim());

                          // Hide the mobile search panel first
                          setShowMobileSearch(false);

                          // If already on catalog page, use replace to update URL without navigation
                          if (pathname === "/catalog") {
                            router.replace(`/catalog?${params.toString()}`, {
                              scroll: false, // Prevent scrolling to top
                            });
                          } else {
                            // Otherwise navigate to catalog
                            router.push(`/catalog?${params.toString()}`);
                          }
                        }
                      }}
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={t("searchPlaceholder")}
                          className="w-full h-11 pl-10 pr-12 text-base rounded-lg border border-input bg-accent/50 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
                        />
                        <button
                          type="submit"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary h-7 w-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                          aria-label="Search"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Search results */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/produs/${product.id}`}
                            className="group relative flex gap-4 rounded-xl border bg-white p-3 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20"
                            onClick={() => setShowMobileSearch(false)}
                          >
                            {/* Product Image */}
                            <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {product.imagini && product.imagini.length > 0 ? (
                                <Image
                                  src={product.imagini[0]}
                                  alt={product.nume || ""}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  priority
                                  unoptimized
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              {product.pretRedus && product.pret && (
                                <div className="absolute left-0 top-0">
                                  <span className="inline-flex items-center rounded-br-lg bg-primary px-1.5 py-0.5 text-xs font-medium text-white">
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
                            {/* Product Info */}
                            <div className="flex flex-1 flex-col justify-between min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
                                {product.nume}
                              </h4>
                              <div className="mt-1">
                                {product.pret && (
                                  <>
                                    {product.pretRedus ? (
                                      <>
                                        <span className="block text-xs text-gray-500 line-through">
                                          {product.pret.toLocaleString()} MDL
                                        </span>
                                        <span className="block font-medium text-sm text-primary">
                                          {product.pretRedus.toLocaleString()}{" "}
                                          MDL
                                        </span>
                                      </>
                                    ) : (
                                      <span className="block font-medium text-sm text-primary">
                                        {product.pret.toLocaleString()} MDL
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : searchTerm ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("noProductsFound")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* User menu panel */}
          <AnimatePresence>
            {isMobileUserMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsMobileUserMenuOpen(false)}
                />
                <motion.div
                  ref={userMenuRef}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 50) {
                      setIsMobileUserMenuOpen(false);
                    }
                  }}
                  className="fixed inset-x-0 bottom-0 z-50 h-[50vh] rounded-t-xl bg-background pb-safe"
                >
                  {/* User menu header */}
                  <div className="flex items-center justify-between px-4 h-16 border-b ">
                    <h2 className="font-semibold text-lg">{t("account")}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileUserMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-6">
                    {status === "authenticated" ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center overflow-hidden">
                            {session.user?.image ? (
                              <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              {session.user?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Link
                            href="/comenzi"
                            className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent hover:text-primary transition-colors w-full"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                          >
                            <span>{t("myOrders")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/favorite"
                            className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent hover:text-primary transition-colors w-full"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                          >
                            <span>{t("favorites")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                          <Link
                            href="/credit"
                            className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-accent hover:text-primary transition-colors w-full"
                            onClick={() => setIsMobileUserMenuOpen(false)}
                          >
                            <span>{t("buyInInstallments")}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </div>
                        <Button
                          className="w-full"
                          variant="destructive"
                          onClick={handleSignOut}
                        >
                          {t("signOut")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">{t("welcome")}</h3>
                            <p className="text-sm text-muted-foreground">
                              {t("loginToContinue")}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleGoogleSignIn}
                        >
                          <div className="bg-white rounded-full p-1 mr-2">
                            <GoogleIcon className="h-5 w-5" />
                          </div>
                          {t("signInWithGoogle")}
                        </Button>
                        <Button
                          className="w-full mt-2"
                          variant="outline"
                          onClick={handleFacebookSignIn}
                        >
                          <div className="bg-white rounded-full p-1 mr-2">
                            <FacebookIcon className="h-5 w-5" />
                          </div>
                          {t("signInWithFacebook")}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile cart panel */}
          <AnimatePresence>
            {isCartOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsCartOpen(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 50) {
                      setIsCartOpen(false);
                    }
                  }}
                  className="fixed inset-x-0 bottom-0 h-[85vh] bg-white shadow-xl z-50 md:hidden flex flex-col overflow-hidden rounded-t-2xl"
                >
                  {/* Drag handle */}
                  <div className="w-full pt-3 pb-2 px-4">
                    <div className="h-1 w-16 mx-auto rounded-full bg-gray-300/80" />
                  </div>

                  {/* Cart header */}
                  <div className="flex items-center justify-between h-14 px-4 border-b bg-gray-50/80 backdrop-blur-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-gray-200/70"
                      onClick={() => setIsCartOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        {t("cart_title")}
                      </h2>
                      {totalItems > 0 && (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                        >
                          {totalItems}
                        </motion.span>
                      )}
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                  </div>

                  {items.length === 0 ? (
                    // Empty cart state with better animations
                    <div className="flex-1 flex flex-col items-center justify-center px-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                        className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-6"
                      >
                        <ShoppingCart className="h-12 w-12" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center space-y-2 mb-8"
                      >
                        <h3 className="text-xl font-semibold">
                          {t("cart_empty")}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                          {t("cart_empty_description")}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-sm"
                      >
                        <Button
                          onClick={() => {
                            setIsCartOpen(false);
                            setIsMobileMenuOpen(true);
                          }}
                          className="w-full h-12 rounded-xl bg-black hover:bg-black/90 text-white"
                        >
                          <LayoutGrid className="h-5 w-5 mr-2" />
                          {t("cart_explore_catalog")}
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    // Cart with items - enhanced with animations
                    <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <motion.div
                            key={item.product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.05,
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.01 }}
                            className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all group relative bg-white hover:shadow-sm"
                          >
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/90 border border-primary/10 shadow-sm group-hover:shadow-md transition-all">
                              {item.product.imagini[0] ? (
                                <Image
                                  src={item.product.imagini[0]}
                                  alt={item.product.nume}
                                  fill
                                  className="object-contain p-1 transition-transform group-hover:scale-105 duration-300"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                {item.product.nume}
                              </h4>
                              <div className="text-xs text-muted-foreground mt-1.5 flex items-center">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-600 mr-1">
                                  {t("cart_product_code")}
                                </span>
                                {item.product.cod}
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-col">
                                  <div className="text-base font-semibold text-primary">
                                    {((item.product.pretRedus || item.product.pret) * item.quantity).toLocaleString()} MDL
                                  </div>
                                  {item.product.pretRedus && (
                                    <div className="text-xs text-muted-foreground line-through">
                                      {(item.product.pret * item.quantity).toLocaleString()} MDL
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item.product.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cart footer */}
                  <div className="border-t p-4 bg-gray-50/80 backdrop-blur-sm">
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div className="flex flex-col gap-2 mb-2">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{t("cart_products")}</span>
                          <span>
                            {totalItems}{" "}
                            {totalItems === 1 ? t("item") : t("items")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{t("cart_delivery")}</span>
                          <span className="font-medium text-primary">
                            {t("cart_free")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-base pt-2 border-t">
                          <span className="font-medium">{t("cart_total")}</span>
                          <motion.span
                            className="font-semibold text-lg text-primary"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.1,
                              type: "spring",
                              stiffness: 300,
                            }}
                          >
                            {totalPrice.toLocaleString()} MDL
                          </motion.span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full h-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 mb-2"
                        disabled={items.length === 0}
                        onClick={() => clearCart()}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("cart_clear") || "Clear Cart"}
                      </Button>
                      <Button
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white"
                        disabled={items.length === 0}
                        onClick={() => (window.location.href = "/checkout")}
                      >
                        {t("cart_checkout")}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-10 rounded-xl text-sm border-gray-200 hover:border-primary/30 hover:text-primary"
                        disabled={items.length === 0}
                        onClick={() => (window.location.href = "/cart")}
                      >
                        {t("cart_title")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Credit announcement bar - Full width background with contained text */}
      <div className="hidden lg:block bg-primary text-white overflow-hidden whitespace-nowrap border-t border-white/10">
        <div className="container mx-auto relative">
          <div className="relative h-12 overflow-hidden">
            <div className="absolute inset-0">
              <motion.div
                className="flex items-center gap-12 py-3 absolute left-0 right-0"
                style={{ x }}
              >
                {[...announcements, ...announcements, ...announcements].map(
                  (text, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-24 shrink-0"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {t(
                          text ===
                            "0% Credit - Cumpără acum, plătește mai târziu"
                            ? "zeroCreditBuyNow"
                            : "installmentsUpTo"
                        )}
                      </span>
                    </span>
                  )
                )}
              </motion.div>
              <motion.div
                className="flex items-center gap-12 py-3 absolute left-0 right-0"
                style={{
                  x: useTransform(
                    baseX,
                    (value) => `${value + announcementWidth}px`
                  ),
                }}
              >
                {[...announcements, ...announcements, ...announcements].map(
                  (text, index) => (
                    <span
                      key={`second-${index}`}
                      className="inline-flex items-center gap-32 shrink-0"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {t(
                          text ===
                            "0% Credit - Cumpără acum, plătește mai târziu"
                            ? "zeroCreditBuyNow"
                            : "installmentsUpTo"
                        )}
                      </span>
                    </span>
                  )
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
