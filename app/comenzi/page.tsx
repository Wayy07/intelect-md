"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingBag, ExternalLink, Clock, CheckCheck, Truck, CreditCard, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useToast } from "@/app/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          const response = await fetch('/api/orders/user');

          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }

          const data = await response.json();

          if (data.orders && Array.isArray(data.orders)) {
            // Format dates and transform data if needed
            const formattedOrders = data.orders.map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt)
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
            variant: "destructive"
          });
          setOrders([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    }
  }, [status, toast]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case "canceled":
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
      case "pending":
        return "În procesare";
      case "shipped":
        return "Expediat";
      case "delivered":
        return "Livrat";
      case "canceled":
        return "Anulat";
      default:
        return "Necunoscut";
    }
  };

  // Get payment method display text and icon
  const getPaymentMethodInfo = (method: string, financingTerm?: number) => {
    switch (method.toLowerCase()) {
      case "cash":
        return {
          text: "Numerar la livrare",
          icon: <Package className="h-4 w-4 text-blue-500" />
        };
      case "pickup":
        return {
          text: "Ridicare din magazin",
          icon: <Package className="h-4 w-4 text-green-500" />
        };
      case "credit":
        return {
          text: `Credit${financingTerm ? ` (${financingTerm} luni)` : ''}`,
          icon: <CreditCard className="h-4 w-4 text-primary" />
        };
      default:
        return {
          text: method,
          icon: <Package className="h-4 w-4 text-gray-500" />
        };
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Se încarcă comenzile...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="container max-w-6xl py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Comenzile mele</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-32 text-center bg-accent/20 rounded-xl">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Nu ai plasat încă nicio comandă</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Începe să cumperi produsele preferate din magazinul nostru.
            </p>
            <Button asChild>
              <Link href="/catalog">
                Explorează produse
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-xl overflow-hidden">
                <div className="bg-accent/30 p-4 md:p-6 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span>Comandă #{order.orderNumber}</span>
                        <span>•</span>
                        <span>{format(order.createdAt, 'dd MMMM yyyy', { locale: ro })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">{getStatusText(order.status)}</span>
                        </div>

                        {/* Payment method badge */}
                        <div className="ml-2">
                          {order.paymentMethod === 'credit' && (
                            <Badge variant="outline" className="bg-primary/5 text-xs border-primary/20">
                              <BadgePercent className="h-3 w-3 mr-1" />
                              <span>Credit 0%</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total comandă</div>
                        <div className="font-semibold">{order.total.toLocaleString()} MDL</div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/comenzi/${order.id}`}>
                          <span className="hidden md:inline">Detalii comandă</span>
                          <span className="md:hidden">Detalii</span>
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="space-y-4">
                    {/* Display payment method information */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 border-b pb-3">
                      <span className="flex items-center gap-1.5">
                        {getPaymentMethodInfo(order.paymentMethod, order.financingTerm).icon}
                        <span>Metodă de plată: <span className="font-medium">{getPaymentMethodInfo(order.paymentMethod, order.financingTerm).text}</span></span>
                      </span>
                    </div>

                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden bg-accent/20">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/produs/${item.productId}`}
                            className="text-sm md:text-base font-medium hover:text-primary truncate block"
                          >
                            {item.name}
                          </Link>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span>Cantitate: {item.quantity}</span>
                            <span>Preț: {item.price.toLocaleString()} MDL</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-medium">
                            {(item.price * item.quantity).toLocaleString()} MDL
                          </div>
                        </div>
                      </div>
                    ))}
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
