"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCheck,
  Truck,
  CreditCard,
  BadgePercent,
  CalendarRange,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowUpRight,
  Printer,
  Share2,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useToast } from "@/app/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { GridPattern } from "@/components/magicui/grid-pattern";

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
  subtotal: number;
  shipping: number;
  discount?: number;
  items: OrderItem[];
  paymentMethod: string;
  financingTerm?: number;
  customerDetails?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  isPaid: boolean;
}

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  // Properly unwrap params with React.use() with type assertion
  const unwrappedParams = React.use(params as any) as { id: string };
  const orderId = unwrappedParams.id;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch order details from the database
  useEffect(() => {
    if (status === "authenticated") {
      const fetchOrderData = async () => {
        setIsLoading(true);
        try {
          // Call the API to get order details
          const response = await fetch(`/api/orders/${orderId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch order details");
          }

          const data = await response.json();

          if (data.order) {
            // Format dates and transform data if needed
            const formattedOrder = {
              ...data.order,
              createdAt: new Date(data.order.createdAt),
              updatedAt: new Date(data.order.updatedAt),
            };

            setOrder(formattedOrder);
          } else {
            toast({
              title: "Comandă negăsită",
              description: "Comanda solicitată nu a fost găsită",
              variant: "destructive",
            });
            router.push("/comenzi");
          }
        } catch (error) {
          console.error("Failed to fetch order details:", error);
          toast({
            title: "Eroare",
            description: "Nu s-au putut încărca detaliile comenzii",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderData();
    }
  }, [orderId, status, toast, router]);

  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "În așteptare",
          color: "text-amber-500",
          bgColor: "bg-amber-500",
          lightBgColor: "bg-amber-50",
          border: "border-amber-200",
        };
      case "PROCESSING":
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "În procesare",
          color: "text-blue-500",
          bgColor: "bg-blue-500",
          lightBgColor: "bg-blue-50",
          border: "border-blue-200",
        };
      case "SHIPPED":
        return {
          icon: <Truck className="h-5 w-5" />,
          text: "Expediat",
          color: "text-purple-500",
          bgColor: "bg-purple-500",
          lightBgColor: "bg-purple-50",
          border: "border-purple-200",
        };
      case "COMPLETED":
        return {
          icon: <CheckCheck className="h-5 w-5" />,
          text: "Finalizată",
          color: "text-green-500",
          bgColor: "bg-green-500",
          lightBgColor: "bg-green-50",
          border: "border-green-200",
        };
      case "CANCELLED":
        return {
          icon: <Package className="h-5 w-5" />,
          text: "Anulată",
          color: "text-red-500",
          bgColor: "bg-red-500",
          lightBgColor: "bg-red-50",
          border: "border-red-200",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "Necunoscut",
          color: "text-gray-500",
          bgColor: "bg-gray-500",
          lightBgColor: "bg-gray-50",
          border: "border-gray-200",
        };
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

  // Function to get the status progress percentage
  const getOrderProgress = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return 25;
      case "PROCESSING":
        return 50;
      case "SHIPPED":
        return 75;
      case "COMPLETED":
        return 100;
      case "CANCELLED":
        return 0;
      default:
        return 0;
    }
  };

  // Loading state with beautiful animation
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container max-w-5xl py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 h-full w-full rounded-full border-t-4 border-primary animate-spin"></div>
            <div className="absolute inset-2 h-20 w-20 rounded-full border-r-4 border-primary/70 animate-spin animate-reverse"></div>
            <div className="absolute inset-4 h-16 w-16 rounded-full border-b-4 border-primary/40 animate-spin animate-delay-500"></div>
            <div className="absolute inset-6 h-12 w-12 rounded-full border-l-4 border-primary/20 animate-spin animate-reverse animate-delay-500"></div>
            <div className="absolute inset-8 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-lg font-medium text-muted-foreground animate-fade-in">
            Se încarcă detaliile comenzii...
          </p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && order) {
    const statusInfo = getStatusInfo(order.status);
    const orderProgress = getOrderProgress(order.status);

    return (
      <div className="relative min-h-screen overflow-hidden pb-20">
        {/* Background Patterns */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
          <GridPattern
            squares={[
              [1, 2],
              [3, 3],
              [6, 2],
              [10, 6],
              [15, 6],
              [19, 5],
              [7, 8],
              [5, 14],
              [8, 11],
              [12, 18],
              [18, 14],
              [9, 19],
              [15, 2],
            ]}
            className="opacity-20 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          />
        </div>

        <div className="container max-w-5xl py-8 md:py-12 relative">
          {/* Back button and page title */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link
              href="/comenzi"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la comenzi
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Comanda #{order.orderNumber}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Plasată pe{" "}
                    {format(order.createdAt, "dd MMMM yyyy", { locale: ro })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ShimmerButton
                  className="rounded-full px-4 py-1.5 text-sm"
                  shimmerColor="#00BFFF"
                  onClick={() => window.print()}
                >
                  <div className="flex items-center gap-1.5">
                    <Printer className="h-4 w-4" />
                    <span>Printează</span>
                  </div>
                </ShimmerButton>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Order items and payment details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order status card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={cn(
                  "bg-white rounded-xl overflow-hidden border shadow-sm",
                  statusInfo.border
                )}
              >
                <div
                  className={cn(
                    "p-4 border-b flex items-center justify-between",
                    statusInfo.lightBgColor
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        statusInfo.lightBgColor
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          statusInfo.color
                        )}
                      >
                        {statusInfo.icon}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Status comandă
                      </div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span className={statusInfo.color}>
                          {statusInfo.text}
                        </span>
                        {order.isPaid ? (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-50 text-green-700 border-green-200 rounded-full"
                          >
                            Plătită
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-amber-50 text-amber-700 border-amber-200 rounded-full"
                          >
                            Neplătită
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Actualizat:{" "}
                    {format(order.updatedAt, "dd MMM yyyy, HH:mm", {
                      locale: ro,
                    })}
                  </div>
                </div>

                <div className="p-6">
                  {/* Order progress tracker - Customized by payment method */}
                  <div className="mb-8">
                    <div className="relative pt-1">
                      <div className="flex mb-5 items-center justify-between">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                order.status.toUpperCase() === "CANCELLED"
                                  ? "bg-red-500"
                                  : "bg-primary"
                              )}
                              style={{ width: `${orderProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Credit payment method progress */}
                      {order.paymentMethod.toLowerCase() === "credit" && (
                        <div className="flex text-xs md:text-sm justify-between">
                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 25 ||
                                order.status.toUpperCase() === "CANCELLED"
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 25 ||
                                  order.status.toUpperCase() === "CANCELLED"
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 25 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "1"
                              )}
                            </div>
                            <span>Aprobare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 50
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 50
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 50 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "2"
                              )}
                            </div>
                            <span>Procesare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 75
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 75
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 75 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "3"
                              )}
                            </div>
                            <span>Activare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 100
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 100
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 100 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "4"
                              )}
                            </div>
                            <span>Finalizare</span>
                          </div>
                        </div>
                      )}

                      {/* Cash on delivery payment method progress */}
                      {order.paymentMethod.toLowerCase() === "cash" && (
                        <div className="flex text-xs md:text-sm justify-between">
                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 25 ||
                                order.status.toUpperCase() === "CANCELLED"
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 25 ||
                                  order.status.toUpperCase() === "CANCELLED"
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 25 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "1"
                              )}
                            </div>
                            <span>Confirmare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 50
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 50
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 50 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "2"
                              )}
                            </div>
                            <span>Procesare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 75
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 75
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 75 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "3"
                              )}
                            </div>
                            <span>Expediere</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 100
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 100
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 100 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "4"
                              )}
                            </div>
                            <span>Livrare/Plată</span>
                          </div>
                        </div>
                      )}

                      {/* Store pickup payment method progress */}
                      {order.paymentMethod.toLowerCase() === "pickup" && (
                        <div className="flex text-xs md:text-sm justify-between">
                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 25 ||
                                order.status.toUpperCase() === "CANCELLED"
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 25 ||
                                  order.status.toUpperCase() === "CANCELLED"
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 25 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "1"
                              )}
                            </div>
                            <span>Confirmare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 50
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 50
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 50 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "2"
                              )}
                            </div>
                            <span>Procesare</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 75
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 75
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 75 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "3"
                              )}
                            </div>
                            <span>Pregătire</span>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-center text-center",
                              orderProgress >= 100
                                ? statusInfo.color
                                : "text-gray-400"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 mb-1 rounded-full flex items-center justify-center border-2",
                                orderProgress >= 100
                                  ? cn(
                                      "border-current",
                                      statusInfo.lightBgColor
                                    )
                                  : "border-gray-300 bg-gray-100"
                              )}
                            >
                              {orderProgress >= 100 ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                "4"
                              )}
                            </div>
                            <span>Ridicare</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking information, only for shipped orders */}
                  {order.status.toUpperCase() === "SHIPPED" &&
                    order.trackingNumber && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-purple-700">
                              Informații de urmărire
                            </div>
                            <div className="text-sm text-purple-600">
                              Număr de urmărire: {order.trackingNumber}
                            </div>
                          </div>

                          {order.trackingUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800 w-full sm:w-auto"
                              onClick={() =>
                                window.open(order.trackingUrl, "_blank")
                              }
                            >
                              <span className="flex items-center gap-1.5">
                                Urmărește expedirea
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Payment method specific information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white rounded-xl overflow-hidden border shadow-sm mb-4"
                  >
                    <div className="p-4 bg-gray-50 border-b">
                      <h2 className="font-semibold">
                        {order.paymentMethod.toLowerCase() === "credit"
                          ? "Detalii credit"
                          : order.paymentMethod.toLowerCase() === "pickup"
                          ? "Ridicare din magazin"
                          : "Detalii livrare"}
                      </h2>
                    </div>

                    <div className="p-4">
                      {order.paymentMethod.toLowerCase() === "credit" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-primary" />
                              <span className="font-medium">Finanțare:</span>
                            </div>
                            <span className="font-semibold">
                              {order.financingTerm} luni
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Suma totală credit:
                            </span>
                            <span className="font-medium">
                              {order.total.toLocaleString()} MDL
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Rata lunară:
                            </span>
                            <span className="font-medium text-primary">
                              {Math.ceil(
                                order.total / (order.financingTerm || 1)
                              ).toLocaleString()}{" "}
                              MDL
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Dobândă:
                            </span>
                            <span className="font-medium text-green-600">
                              0%
                            </span>
                          </div>
                        </div>
                      )}

                      {order.paymentMethod.toLowerCase() === "cash" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-600">
                            <Package className="h-5 w-5" />
                            <span className="font-medium">
                              Plată la livrare
                            </span>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                <CreditCard className="h-4 w-4 text-amber-500" />
                              </div>
                              <div>
                                <div className="font-medium text-amber-700">
                                  Important:
                                </div>
                                <div className="text-sm text-amber-600">
                                  Plata se va efectua curierului la momentul
                                  livrării. Suma de plată:{" "}
                                  {order.total.toLocaleString()} MDL.
                                </div>
                              </div>
                            </div>
                          </div>

                          {order.status.toUpperCase() === "SHIPPED" && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  <Truck className="h-4 w-4 text-purple-500" />
                                </div>
                                <div>
                                  <div className="font-medium text-purple-700">
                                    Livrare în curs
                                  </div>
                                  <div className="text-sm text-purple-600">
                                    Coletul este în drum spre adresa de livrare.
                                    Veți fi contactat de către curier înainte de
                                    livrare.
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">
                              Adresa de livrare:
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="font-medium">
                                {order.customerDetails?.address}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {order.paymentMethod.toLowerCase() === "pickup" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-600">
                            <MapPin className="h-5 w-5" />
                            <span className="font-medium">
                              Ridicare personală din magazin
                            </span>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                <ShoppingBag className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <div className="font-medium text-green-700">
                                  Instrucțiuni:
                                </div>
                                <div className="text-sm text-green-600">
                                  Puteți ridica comanda din magazinul nostru
                                  prezentând dovada comenzii și un act de
                                  identitate. Vă vom anunța când comanda este
                                  pregătită pentru ridicare.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Status pregătire:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  order.status.toUpperCase() === "COMPLETED"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : order.status.toUpperCase() === "SHIPPED"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }
                              >
                                {order.status.toUpperCase() === "COMPLETED"
                                  ? "Pregătit pentru ridicare"
                                  : order.status.toUpperCase() === "SHIPPED"
                                  ? "În curs de pregătire"
                                  : "Comandă în procesare"}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Metodă de plată:
                              </span>
                              <span className="font-medium">
                                {order.isPaid
                                  ? "Plătit în avans"
                                  : "Plată la ridicare"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Adresa magazin:
                              </span>
                              <span className="font-medium">
                                Str. Independenței 42, Chișinău
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Program:
                              </span>
                              <span className="font-medium">
                                Luni-Vineri: 9:00-18:00, Sâmbăta: 10:00-15:00
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Order items card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white rounded-xl overflow-hidden border shadow-sm"
                  >
                    <div className="p-4 bg-gray-50 border-b">
                      <h2 className="font-semibold">
                        Produse în comandă ({order.items.length})
                      </h2>
                    </div>

                    <div className="divide-y">
                      <AnimatePresence>
                        {order.items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.1 + index * 0.05,
                            }}
                            className="p-4 md:p-6 flex gap-4 group"
                          >
                            <div className="relative w-16 md:w-20 aspect-square flex-shrink-0 rounded-md overflow-hidden bg-gray-100 group-hover:shadow-md transition-all">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-all duration-300 group-hover:scale-110"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              {item.quantity > 1 && (
                                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                                  {item.quantity}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/produs/${item.productId}`}
                                className="text-sm md:text-base font-medium hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-muted-foreground mt-1">
                                <span>
                                  Preț unitar: {item.price.toLocaleString()} MDL
                                </span>
                                {item.quantity > 1 && (
                                  <span className="flex items-center gap-1">
                                    <span>Cantitate:</span>
                                    <span className="font-medium text-gray-700">
                                      {item.quantity}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="font-semibold text-primary">
                                {(item.price * item.quantity).toLocaleString()}{" "}
                                MDL
                              </div>

                              {/* Monthly payment calculation if credit */}
                              {order.paymentMethod === "credit" &&
                                order.financingTerm && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {Math.ceil(
                                      (item.price * item.quantity) /
                                        order.financingTerm
                                    ).toLocaleString()}{" "}
                                    MDL/lună
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right column: Summary, Customer info */}
            <div className="space-y-6">
              {/* Order summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-white rounded-xl overflow-hidden border shadow-sm"
              >
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="font-semibold">Sumar comandă</h2>
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{order.subtotal.toLocaleString()} MDL</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transport</span>
                      <span>{order.shipping.toLocaleString()} MDL</span>
                    </div>

                    {order.discount !== undefined && order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <BadgePercent className="h-4 w-4" />
                          Discount
                        </span>
                        <span>-{order.discount.toLocaleString()} MDL</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary text-lg">
                        {order.total.toLocaleString()} MDL
                      </span>
                    </div>

                    {order.paymentMethod === "credit" &&
                      order.financingTerm && (
                        <div className="bg-primary/5 p-3 rounded-lg mt-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5 text-primary">
                              <CreditCard className="h-4 w-4" />
                              <span className="font-medium">Rate lunare:</span>
                            </span>
                            <span className="font-semibold">
                              {Math.ceil(
                                order.total / order.financingTerm
                              ).toLocaleString()}{" "}
                              MDL/lună
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Credit pentru {order.financingTerm} luni cu dobândă
                            0%
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>

              {/* Customer information */}
              {order.customerDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="bg-white rounded-xl overflow-hidden border shadow-sm"
                >
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="font-semibold">Informații client</h2>
                  </div>

                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Nume
                          </div>
                          <div className="font-medium">
                            {order.customerDetails.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Email
                          </div>
                          <div className="font-medium">
                            {order.customerDetails.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Telefon
                          </div>
                          <div className="font-medium">
                            {order.customerDetails.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Adresa de livrare
                          </div>
                          <div className="font-medium">
                            {order.customerDetails.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
