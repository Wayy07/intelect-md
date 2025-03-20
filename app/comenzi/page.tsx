"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingBag,
  ExternalLink,
  Clock,
  CheckCheck,
  Truck,
  CreditCard,
  BadgePercent,
  ArrowRight,
  Filter,
  CalendarRange,
  ReceiptText,
  Search,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useToast } from "@/app/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  financingTerm?: number;
}

// Status translation map
const STATUS_TRANSLATIONS = {
  PENDING: "ÎN AȘTEPTARE",
  PROCESSING: "ÎN PROCESARE",
  COMPLETED: "FINALIZATĂ",
  CANCELLED: "ANULATĂ",
  SHIPPED: "EXPEDIATĂ",
};

// Payment method-specific status translations
const STATUS_TRANSLATIONS_CREDIT = {
  PENDING: "ÎN AȘTEPTARE APROBARE",
  PROCESSING: "ÎN PROCESARE CREDIT",
  COMPLETED: "CREDIT ACTIVAT",
  CANCELLED: "CREDIT RESPINS",
  SHIPPED: "CREDIT APROBAT",
};

const STATUS_TRANSLATIONS_CASH = {
  PENDING: "COMANDĂ PLASATĂ",
  PROCESSING: "ÎN PREGĂTIRE",
  COMPLETED: "LIVRATĂ ȘI ACHITATĂ",
  CANCELLED: "ANULATĂ",
  SHIPPED: "ÎN CURS DE LIVRARE",
};

const STATUS_TRANSLATIONS_PICKUP = {
  PENDING: "COMANDĂ PLASATĂ",
  PROCESSING: "ÎN PREGĂTIRE",
  COMPLETED: "RIDICATĂ ȘI ACHITATĂ",
  CANCELLED: "ANULATĂ",
  SHIPPED: "GATA DE RIDICARE",
};

// Get translated status - updated to be payment method aware
const getTranslatedStatus = (status: string, paymentMethod?: string) => {
  if (!paymentMethod) {
    return (
      STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status
    );
  }

  const methodUpperCase = paymentMethod.toUpperCase();

  if (methodUpperCase === "CREDIT") {
    return (
      STATUS_TRANSLATIONS_CREDIT[
        status as keyof typeof STATUS_TRANSLATIONS_CREDIT
      ] ||
      STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] ||
      status
    );
  } else if (methodUpperCase === "CASH") {
    return (
      STATUS_TRANSLATIONS_CASH[
        status as keyof typeof STATUS_TRANSLATIONS_CASH
      ] ||
      STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] ||
      status
    );
  } else if (methodUpperCase === "PICKUP") {
    return (
      STATUS_TRANSLATIONS_PICKUP[
        status as keyof typeof STATUS_TRANSLATIONS_PICKUP
      ] ||
      STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] ||
      status
    );
  }

  return (
    STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status
  );
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number>(
    new Date().getFullYear()
  );
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch orders from the database
  useEffect(() => {
    if (status === "authenticated") {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          // Call the API to get user's orders
          const response = await fetch("/api/orders/user");

          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }

          const data = await response.json();

          if (data.orders && Array.isArray(data.orders)) {
            // Format dates and transform data if needed
            const formattedOrders = data.orders.map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt),
            }));

            setOrders(formattedOrders);
          } else {
            // If no orders or invalid response format, set empty array
            setOrders([]);
          }
        } catch (error) {
          console.error("Failed to fetch orders:", error);
          toast({
            title: "Eroare",
            description: "Nu s-au putut încărca comenzile",
            variant: "destructive",
          });
          setOrders([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    }
  }, [status, toast]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status if a filter is selected
    if (filter && order.status.toUpperCase() !== filter) {
      return false;
    }

    // Filter by year
    if (filterYear) {
      return order.createdAt.getFullYear() === filterYear;
    }

    return true;
  });

  // Get all available years from orders
  const availableYears = orders
    .map((order) => order.createdAt.getFullYear())
    .filter((year, index, self) => self.indexOf(year) === index)
    .sort((a, b) => b - a); // Sort descending

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "COMPLETED":
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case "CANCELLED":
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "În așteptare";
      case "PROCESSING":
        return "În procesare";
      case "SHIPPED":
        return "Expediat";
      case "COMPLETED":
        return "Finalizată";
      case "CANCELLED":
        return "Anulată";
      default:
        return "Necunoscut";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "PROCESSING":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "SHIPPED":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "COMPLETED":
        return "bg-green-50 border-green-200 text-green-700";
      case "CANCELLED":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  // Get payment method display text and icon
  const getPaymentMethodInfo = (method: string, financingTerm?: number) => {
    switch (method.toLowerCase()) {
      case "cash":
        return {
          text: "Numerar la livrare",
          icon: <Package className="h-4 w-4 text-blue-500" />,
        };
      case "pickup":
        return {
          text: "Ridicare din magazin",
          icon: <Package className="h-4 w-4 text-green-500" />,
        };
      case "credit":
        return {
          text: `Credit${financingTerm ? ` (${financingTerm} luni)` : ""}`,
          icon: <CreditCard className="h-4 w-4 text-primary" />,
        };
      default:
        return {
          text: method,
          icon: <Package className="h-4 w-4 text-gray-500" />,
        };
    }
  };

  // Loading state with beautiful animation
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 h-full w-full rounded-full border-t-4 border-primary animate-spin"></div>
            <div className="absolute inset-2 h-20 w-20 rounded-full border-r-4 border-primary/70 animate-spin animate-reverse"></div>
            <div className="absolute inset-4 h-16 w-16 rounded-full border-b-4 border-primary/40 animate-spin animate-delay-500"></div>
            <div className="absolute inset-6 h-12 w-12 rounded-full border-l-4 border-primary/20 animate-spin animate-reverse animate-delay-500"></div>
            <div className="absolute inset-8 flex items-center justify-center">
              <ReceiptText className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-lg font-medium text-muted-foreground animate-fade-in">
            Se încarcă istoricul comenzilor tale...
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ReceiptText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Istoric comenzi
              </h1>
            </div>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl bg-white shadow-xl p-8 md:p-12"
            >
              <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center relative z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8 overflow-hidden relative">
                  <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-primary/40" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 animate-rotate-slow"></div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-900 text-transparent bg-clip-text">
                  Nu ai plasat încă nicio comandă
                </h2>

                <p className="text-muted-foreground max-w-md mb-10 text-lg">
                  Începe să cumperi produsele preferate din magazinul nostru și
                  urmărește comenzile tale aici.
                </p>

                <ShimmerButton
                  onClick={() => router.push("/catalog")}
                  className="px-8 py-3"
                  shimmerColor="#00BFFF"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
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
            <div className="space-y-8">
              {/* Filters and stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4 md:justify-between items-start md:items-center"
              >
                <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setFilter(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      filter === null
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    Toate
                  </button>
                  <button
                    onClick={() => setFilter("PENDING")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                      filter === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    În așteptare
                  </button>
                  <button
                    onClick={() => setFilter("PROCESSING")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                      filter === "PROCESSING"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    În procesare
                  </button>
                  <button
                    onClick={() => setFilter("SHIPPED")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                      filter === "SHIPPED"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Expediate
                  </button>
                  <button
                    onClick={() => setFilter("COMPLETED")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                      filter === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Finalizate
                  </button>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-primary" />
                  <select
                    className="bg-white border rounded-md px-2 py-1 text-sm"
                    value={filterYear || new Date().getFullYear()}
                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              {/* Order Stats Summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-400">
                  <div className="text-sm text-gray-500">În așteptare</div>
                  <div className="text-2xl font-bold mt-1">
                    {
                      orders.filter((o) => o.status.toUpperCase() === "PENDING")
                        .length
                    }
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
                  <div className="text-sm text-gray-500">În procesare</div>
                  <div className="text-2xl font-bold mt-1">
                    {
                      orders.filter(
                        (o) => o.status.toUpperCase() === "PROCESSING"
                      ).length
                    }
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-400">
                  <div className="text-sm text-gray-500">Expediate</div>
                  <div className="text-2xl font-bold mt-1">
                    {
                      orders.filter((o) => o.status.toUpperCase() === "SHIPPED")
                        .length
                    }
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
                  <div className="text-sm text-gray-500">Finalizate</div>
                  <div className="text-2xl font-bold mt-1">
                    {
                      orders.filter(
                        (o) => o.status.toUpperCase() === "COMPLETED"
                      ).length
                    }
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary">
                  <div className="text-sm text-gray-500">Total comenzi</div>
                  <div className="text-2xl font-bold mt-1">{orders.length}</div>
                </div>
              </motion.div>

              {/* Orders List */}
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredOrders.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-lg shadow-sm p-6 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <Search className="h-8 w-8 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium">
                          Nicio comandă nu corespunde filtrelor selectate
                        </h3>
                        <p className="text-gray-500 mt-1">
                          Schimbă filtrele pentru a vedea mai multe comenzi
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setFilter(null);
                            setFilterYear(new Date().getFullYear());
                          }}
                        >
                          Resetează filtrele
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="bg-gray-50 p-4 md:p-6 border-b">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span className="font-medium text-gray-700">
                                  Comandă #{order.orderNumber}
                                </span>
                                <span>•</span>
                                <span>
                                  {format(order.createdAt, "dd MMMM yyyy", {
                                    locale: ro,
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center flex-wrap gap-2">
                                <div
                                  className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                                    getStatusColor(order.status)
                                  )}
                                >
                                  {getStatusIcon(order.status)}
                                  <span>{getStatusText(order.status)}</span>
                                </div>

                                {/* Payment method badge */}
                                {order.paymentMethod === "credit" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-primary/5 border-primary/20 rounded-full"
                                  >
                                    <BadgePercent className="h-3 w-3 mr-1" />
                                    <span>Credit 0%</span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  Total comandă
                                </div>
                                <div className="font-bold text-lg text-primary">
                                  {order.total.toLocaleString()} MDL
                                </div>
                              </div>
                              <Link href={`/comenzi/${order.id}`}>
                                <ShimmerButton shimmerColor="#00BFFF">
                                  <span className="flex items-center whitespace-nowrap gap-1.5 px-3 py-1.5 rounded-full text-sm">
                                    <span className="hidden sm:inline">
                                      Detalii comandă
                                    </span>
                                    <span className="sm:hidden">Detalii</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </span>
                                </ShimmerButton>
                              </Link>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 md:p-6">
                          <div>
                            {/* Payment method information */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                {
                                  getPaymentMethodInfo(
                                    order.paymentMethod,
                                    order.financingTerm
                                  ).icon
                                }
                                <span>
                                  Metodă de plată:{" "}
                                  <span className="font-medium text-gray-700">
                                    {
                                      getPaymentMethodInfo(
                                        order.paymentMethod,
                                        order.financingTerm
                                      ).text
                                    }
                                  </span>
                                </span>
                              </span>
                              <span>•</span>
                              <span>{order.items.length} produse</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
