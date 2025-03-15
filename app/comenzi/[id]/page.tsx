"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ArrowLeft,
  Clock,
  CheckCheck,
  Truck,
  CreditCard,
  BadgePercent,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useToast } from "@/app/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
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
  customer: CustomerInfo;
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
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
    if (status === "authenticated" && orderId) {
      const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
          // Call the API to get order details
          const response = await fetch(`/api/orders/${orderId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch order details');
          }

          const data = await response.json();

          if (data.order) {
            // Format dates
            setOrder({
              ...data.order,
              createdAt: new Date(data.order.createdAt),
              updatedAt: new Date(data.order.updatedAt)
            });
          } else {
            // If no order or invalid response format
            toast({
              title: "Eroare",
              description: "Comanda nu a fost găsită",
              variant: "destructive"
            });
            router.push("/comenzi");
          }
        } catch (error) {
          console.error("Failed to fetch order details:", error);
          toast({
            title: "Eroare",
            description: "Nu s-au putut încărca detaliile comenzii",
            variant: "destructive"
          });
          router.push("/comenzi");
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [status, orderId, router, toast]);

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
          icon: <Package className="h-5 w-5 text-blue-500" />
        };
      case "pickup":
        return {
          text: "Ridicare din magazin",
          icon: <Package className="h-5 w-5 text-green-500" />
        };
      case "credit":
        return {
          text: `Credit${financingTerm ? ` (${financingTerm} luni)` : ''}`,
          icon: <CreditCard className="h-5 w-5 text-primary" />
        };
      default:
        return {
          text: method,
          icon: <Package className="h-5 w-5 text-gray-500" />
        };
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Se încarcă detaliile comenzii...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && order) {
    const paymentInfo = getPaymentMethodInfo(order.paymentMethod, order.financingTerm);
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`;

    return (
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/comenzi")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la comenzi
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Detalii comandă</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order summary and status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl overflow-hidden">
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
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total comandă</div>
                    <div className="text-xl font-semibold">{order.total.toLocaleString()} MDL</div>
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold mb-4">Produse comandate</h2>
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md overflow-hidden bg-accent/20">
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
                          className="text-base md:text-lg font-medium hover:text-primary truncate block"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                          <span>Cantitate: {item.quantity}</span>
                          <span>Preț: {item.price.toLocaleString()} MDL</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-medium text-base md:text-lg">
                          {(item.price * item.quantity).toLocaleString()} MDL
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order totals */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{order.total.toLocaleString()} MDL</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Livrare:</span>
                    <span>Gratuită</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-4 pt-2 border-t">
                    <span>Total:</span>
                    <span>{order.total.toLocaleString()} MDL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order details sidebar */}
          <div className="space-y-6">
            {/* Payment information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {paymentInfo.icon}
                  <CardTitle className="text-lg">Informații plată</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metodă:</span>
                    <span className="font-medium">{paymentInfo.text}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{getStatusText(order.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{format(order.createdAt, 'dd.MM.yyyy', { locale: ro })}</span>
                  </div>
                </div>

                {/* Credit payment specific information */}
                {order.paymentMethod === 'credit' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                      <div className="flex items-start gap-2">
                        <BadgePercent className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <h4 className="font-medium mb-1">Solicitare credit înregistrată</h4>
                          <p className="text-muted-foreground mb-2">
                            Un reprezentant te va contacta în decurs de 24 de ore pentru a continua procesul de creditare.
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Perioada: {order.financingTerm || 12} luni</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <FileText className="h-3 w-3" />
                            <span>Rata lunară estimativă: {Math.round(order.total / (order.financingTerm || 12)).toLocaleString()} MDL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Informații client</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{customerName}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{order.customer.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{order.customer.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{order.customer.address}</div>
                      {order.customer.city && <div>{order.customer.city}</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order timeline */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Istoric comandă</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded-full bg-green-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Comandă plasată</div>
                      <div className="text-sm text-muted-foreground">
                        {format(order.createdAt, 'dd MMMM yyyy, HH:mm', { locale: ro })}
                      </div>
                    </div>
                  </div>

                  {order.status.toLowerCase() !== 'pending' && order.status.toLowerCase() !== 'canceled' && (
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-4 w-4 rounded-full ${order.status.toLowerCase() === 'processing' ? 'bg-amber-500' : 'bg-green-500'} flex-shrink-0`} />
                      <div>
                        <div className="font-medium">Comandă în procesare</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt.getTime() + 1000 * 60 * 60), 'dd MMMM yyyy, HH:mm', { locale: ro })}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status.toLowerCase() === 'shipped' && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Comandă expediată</div>
                        <div className="text-sm text-muted-foreground">
                          {format(order.updatedAt, 'dd MMMM yyyy, HH:mm', { locale: ro })}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status.toLowerCase() === 'delivered' && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 rounded-full bg-green-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Comandă livrată</div>
                        <div className="text-sm text-muted-foreground">
                          {format(order.updatedAt, 'dd MMMM yyyy, HH:mm', { locale: ro })}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status.toLowerCase() === 'canceled' && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 rounded-full bg-red-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Comandă anulată</div>
                        <div className="text-sm text-muted-foreground">
                          {format(order.updatedAt, 'dd MMMM yyyy, HH:mm', { locale: ro })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Need help section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Ai nevoie de ajutor?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Dacă ai întrebări despre comandă sau ai nevoie de asistență, contactează-ne:
                </p>
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Contactează-ne
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
