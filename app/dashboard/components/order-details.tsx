"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { ro } from "date-fns/locale"
import {
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Banknote,
  Calendar,
  FileText,
  CreditCardIcon,
  Receipt,
  Mail,
  History,
  Truck,
  ListChecks,
  Phone,
  Printer,
  Download,
  ArrowRight,
  X,
  Bell,
  Trash2,
  FilePen,
  ClipboardCheck,
  Building,
  UserRound,
  CalendarCheck
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react"

// Define Dialog components directly from the radix primitives
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
)

const DialogOverlay = ({ className, ...props }: DialogPrimitive.DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    className={`fixed inset-0 z-50 bg-black/80 ${className}`}
    {...props}
  />
)

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg ${className}`}
      {...props}
    >
      {children}
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </DialogPrimitive.Content>
  </DialogPortal>
))

const DialogTitle = DialogPrimitive.Title
const DialogDescription = DialogPrimitive.Description

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
)

// Status translation map
const STATUS_TRANSLATIONS = {
  "PENDING": "ÎN AȘTEPTARE",
  "PROCESSING": "ÎN PROCESARE",
  "COMPLETED": "FINALIZATĂ",
  "CANCELLED": "ANULATĂ",
  "SHIPPED": "EXPEDIATĂ"
};

// Payment method translation map - updated to Romanian
const PAYMENT_METHOD_TRANSLATIONS = {
  "CARD": "Card bancar",
  "CASH": "Numerar la livrare",
  "CREDIT": "Credit",
  "TRANSFER": "Transfer bancar",
  "PICKUP_CASH": "Numerar la ridicare",
  "PICKUP": "Numerar la ridicare",
  // Ensure we have both uppercase and lowercase versions for compatibility
  "card": "Card bancar",
  "cash": "Numerar la livrare",
  "credit": "Credit",
  "transfer": "Transfer bancar",
  "pickup_cash": "Numerar la ridicare",
  "pickup": "Numerar la ridicare",
  "Cash": "Numerar la livrare",
  "Credit": "Credit",
  "Card": "Card bancar",
  "Pickup": "Numerar la ridicare"
};

// Types
interface OrderItem {
  id: string
  productId: string
  name: string
  code: string
  quantity: number
  price: number
  imageUrl?: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  city?: string
}

interface User {
  id: string
  name: string | null
  email: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  updatedAt: string
  paymentMethod: string
  financingTerm?: number
  items: OrderItem[]
  customer: Customer
  user: User | null
}

interface OrderDetailsProps {
  selectedOrder: Order | null
  showOrderDetails: boolean
  setShowOrderDetails: (show: boolean) => void
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>
  statusUpdating: boolean
}

// Status badge color mapper
const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
}

// Payment method badge color mapper
const getPaymentMethodColor = (method: string) => {
  // Convert to uppercase for consistency
  const lookupMethod = method.toUpperCase();

  switch (lookupMethod) {
    case "CARD":
      return "bg-blue-100 text-blue-800";
    case "CASH":
    case "PICKUP_CASH":
    case "PICKUP":
      return "bg-green-100 text-green-800";
    case "CREDIT":
      return "bg-purple-100 text-purple-800";
    case "TRANSFER":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ro-MD', {
    style: 'currency',
    currency: 'MDL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Get translated status
const getTranslatedStatus = (status: string) => {
  return STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status;
}

// Get translated payment method - update to handle case insensitivity
const getTranslatedPaymentMethod = (method: string) => {
  // Convert to uppercase for consistency in lookup
  const lookupKey = method.toUpperCase();
  return PAYMENT_METHOD_TRANSLATIONS[lookupKey as keyof typeof PAYMENT_METHOD_TRANSLATIONS] ||
         PAYMENT_METHOD_TRANSLATIONS[method as keyof typeof PAYMENT_METHOD_TRANSLATIONS] ||
         method;
};

// Function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Define status steps for the order timeline
const ORDER_STATUS_STEPS = {
  "PENDING": 1,
  "PROCESSING": 2,
  "SHIPPED": 3,
  "COMPLETED": 4,
  "CANCELLED": 0
};

// Timeline event type interface
interface TimelineEvent {
  id: string;
  type: string;
  createdAt: string;
  status: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  metadata: any;
}

// Add print styles component
const PrintStyles = () => (
  <style jsx global>{`
    @media print {
      body * {
        visibility: hidden;
      }

      .dialog-content, .dialog-content * {
        visibility: visible;
      }

      .dialog-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
      }

      .no-print {
        display: none !important;
      }

      .print-full-width {
        width: 100% !important;
      }

      .print-break-inside-avoid {
        break-inside: avoid;
      }

      @page {
        size: auto;
        margin: 20mm;
      }
    }
  `}</style>
);

export function OrderDetails({
  selectedOrder,
  showOrderDetails,
  setShowOrderDetails,
  updateOrderStatus,
  statusUpdating
}: OrderDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [localOrder, setLocalOrder] = useState<Order | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Copy selected order to local state for real-time updates
  useEffect(() => {
    if (selectedOrder) {
      setLocalOrder(selectedOrder);
    }
  }, [selectedOrder]);

  // Update local state when updating status
  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    // Update local order state to reflect changes immediately
    if (localOrder) {
      setLocalOrder({
        ...localOrder,
        status: status,
        updatedAt: new Date().toISOString()
      });
    }
    // If on the timeline tab, refresh the timeline data
    if (activeTab === "timeline") {
      fetchOrderHistory();
    }
  };

  useEffect(() => {
    // Fetch order history when the timeline tab is active
    if (activeTab === "timeline" && localOrder) {
      fetchOrderHistory();
    }
  }, [activeTab, localOrder]);

  // Function to fetch order history
  const fetchOrderHistory = async () => {
    if (!localOrder) return;

    setTimelineLoading(true);
    try {
      const response = await fetch(`/api/orders/${localOrder.id}/history`);

      if (response.ok) {
        const data = await response.json();
        setTimeline(data.timeline || []);
      } else {
        console.error('Failed to fetch order history:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setTimelineLoading(false);
    }
  };

  // Function to format timeline event information
  const getEventInfo = (event: TimelineEvent) => {
    switch (event.type) {
      case "ORDER_CREATED":
        return {
          title: "Comandă plasată",
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          color: "bg-green-100",
          description: `Comanda cu numărul #${event.metadata?.orderNumber || ''} a fost plasată cu succes.`
        };
      case "ORDER_STATUS_UPDATED":
        return {
          title: `Statusul comenzii a fost actualizat la ${getTranslatedStatus(event.status || '')}`,
          icon: getStatusIcon(event.status || ''),
          color: getStatusIconBackground(event.status || ''),
          description: `Statusul comenzii a fost schimbat ${event.user ? `de ${event.user.name}` : ''}.`
        };
      case "EMAIL_SENT_CONFIRMATION":
        return {
          title: "Email de confirmare trimis",
          icon: <Mail className="h-6 w-6 text-blue-600" />,
          color: "bg-blue-100",
          description: "Un email de confirmare a fost trimis către client."
        };
      case "EMAIL_SENT_SHIPPING":
        return {
          title: "Notificare de expediere trimisă",
          icon: <Truck className="h-6 w-6 text-purple-600" />,
          color: "bg-purple-100",
          description: "Un email de notificare despre expediere a fost trimis către client."
        };
      case "EMAIL_SENT_CREDIT":
        return {
          title: "Informații credit trimise",
          icon: <CreditCard className="h-6 w-6 text-indigo-600" />,
          color: "bg-indigo-100",
          description: "Informații despre credit au fost trimise către client."
        };
      default:
        return {
          title: "Acțiune",
          icon: <FileText className="h-6 w-6 text-gray-600" />,
          color: "bg-gray-100",
          description: event.type
        };
    }
  };

  // Helper to get appropriate icon for status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "PROCESSING":
        return <Clock className="h-6 w-6 text-blue-600" />;
      case "SHIPPED":
        return <Truck className="h-6 w-6 text-purple-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  // Helper to get background color for status icon
  const getStatusIconBackground = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100";
      case "PROCESSING":
        return "bg-blue-100";
      case "SHIPPED":
        return "bg-purple-100";
      case "COMPLETED":
        return "bg-green-100";
      case "CANCELLED":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  if (!localOrder) return null;

  // Make the credit check case-insensitive
  const isCreditOrder = localOrder.paymentMethod.toUpperCase() === "CREDIT";

  // Function to send customer email notification
  const sendCustomerEmail = async (emailType: string) => {
    setEmailSending(true);
    setEmailSuccess(null);

    try {
      // Connect to the email API endpoint
      const response = await fetch(`/api/orders/${localOrder.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          // Include additional data for specific email types
          ...(emailType === 'shipping' && {
            trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`, // Example tracking number
            estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ro-MD', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            shippingMethod: 'Livrare standard'
          }),
          ...(emailType === 'credit' && {
            financingTerm: localOrder.financingTerm || 12
          })
        })
      });

      if (response.ok) {
        setEmailSuccess(true);
        // You could add a toast notification here
      } else {
        setEmailSuccess(false);
        console.error('Failed to send email:', await response.text());
      }
    } catch (error) {
      setEmailSuccess(false);
      console.error('Error sending email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
      <DialogContent className="w-[95vw] max-w-5xl overflow-hidden flex flex-col dialog-content" ref={printRef}>
        <PrintStyles />

        <DialogHeader className="border-b pb-4 border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isCreditOrder && <CreditCard className="h-5 w-5 text-purple-600" />}
            Comanda #{localOrder.orderNumber}
            <Badge variant="outline" className={getStatusColor(localOrder.status) + " ml-2"}>
              {getTranslatedStatus(localOrder.status)}
            </Badge>
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center justify-between mt-1">
            <span>
              Plasată {format(new Date(localOrder.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ro })}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto py-4 justify-start">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full no-print bg-gray-100">
              <TabsTrigger value="details" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                <Package className="h-4 w-4" />
                Detalii comandă
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                <History className="h-4 w-4" />
                Istoric
              </TabsTrigger>
              <TabsTrigger value="messaging" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                <Mail className="h-4 w-4" />
                Comunicare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-4 print-full-width">
              {isCreditOrder ? (
                // Special Credit Order View
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="text-purple-700 font-semibold">Achiziție prin credit</h3>
                    </div>
                    <p className="text-sm text-purple-600 mt-1">
                      Această comandă a fost plasată prin credit și necesită monitorizare specială.
                    </p>
                    {localOrder.financingTerm && (
                      <div className="mt-2 flex items-center text-sm text-purple-700">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Termen finanțare: {localOrder.financingTerm} luni</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Status Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Status comandă
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className={getStatusColor(localOrder.status)}>
                              {getTranslatedStatus(localOrder.status)}
                            </Badge>
                            <Select
                              value={localOrder.status}
                              onValueChange={(value) => handleStatusUpdate(localOrder.id, value)}
                              disabled={statusUpdating}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Schimbă status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">ÎN AȘTEPTARE</SelectItem>
                                <SelectItem value="PROCESSING">ÎN PROCESARE</SelectItem>
                                <SelectItem value="COMPLETED">FINALIZATĂ</SelectItem>
                                <SelectItem value="CANCELLED">ANULATĂ</SelectItem>
                                <SelectItem value="SHIPPED">EXPEDIATĂ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-gray-500">
                            Ultima actualizare: {format(new Date(localOrder.updatedAt), 'dd MMM yyyy, HH:mm', { locale: ro })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Info Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Informații plată
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Metodă plată:</span>
                            <Badge variant="outline" className={getPaymentMethodColor(localOrder.paymentMethod)}>
                              {getTranslatedPaymentMethod(localOrder.paymentMethod)}
                            </Badge>
                          </div>

                          {/* Add financing term info for credit payment */}
                          {localOrder.paymentMethod.toUpperCase() === 'CREDIT' && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Perioada creditare:</span>
                                <span className="text-sm font-medium">{localOrder.financingTerm || 12} luni</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Rata lunară estimativă:</span>
                                <span className="text-sm font-medium">{formatCurrency(Math.round(localOrder.total / (localOrder.financingTerm || 12)))}</span>
                              </div>
                            </>
                          )}

                          <div className="flex justify-between items-center font-medium">
                            <span>Total:</span>
                            <span>{formatCurrency(localOrder.total)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Info Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Receipt className="h-4 w-4 mr-2 text-gray-500" />
                          Client
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{localOrder.customer.firstName} {localOrder.customer.lastName}</p>
                          <div className="flex items-center gap-1">
                            <a
                              href={`mailto:${localOrder.customer.email}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {localOrder.customer.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${localOrder.customer.phone}`}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {localOrder.customer.phone}
                            </a>
                          </div>
                          {localOrder.customer.address && (
                            <p className="text-gray-600">{localOrder.customer.address}</p>
                          )}
                          {localOrder.customer.city && (
                            <p className="text-gray-600">{localOrder.customer.city}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="font-semibold mb-3">Produse comandate</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produs</TableHead>
                            <TableHead>Cod</TableHead>
                            <TableHead className="text-right">Cantitate</TableHead>
                            <TableHead className="text-right">Preț</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {localOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.imageUrl ? (
                                    <div className="h-10 w-10 rounded-md bg-gray-100 relative overflow-hidden">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                  <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{item.code}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular Order View - Convert into card-based layout
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Status Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Status comandă
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className={getStatusColor(localOrder.status)}>
                              {getTranslatedStatus(localOrder.status)}
                            </Badge>
                            <Select
                              value={localOrder.status}
                              onValueChange={(value) => handleStatusUpdate(localOrder.id, value)}
                              disabled={statusUpdating}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Schimbă status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">ÎN AȘTEPTARE</SelectItem>
                                <SelectItem value="PROCESSING">ÎN PROCESARE</SelectItem>
                                <SelectItem value="COMPLETED">FINALIZATĂ</SelectItem>
                                <SelectItem value="CANCELLED">ANULATĂ</SelectItem>
                                <SelectItem value="SHIPPED">EXPEDIATĂ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-xs text-gray-500">
                            Ultima actualizare: {format(new Date(localOrder.updatedAt), 'dd MMM yyyy, HH:mm', { locale: ro })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Info Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Informații plată
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Metodă plată:</span>
                            <Badge variant="outline" className={getPaymentMethodColor(localOrder.paymentMethod)}>
                              {getTranslatedPaymentMethod(localOrder.paymentMethod)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center font-medium">
                            <span>Total:</span>
                            <span>{formatCurrency(localOrder.total)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Info Card */}
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Receipt className="h-4 w-4 mr-2 text-gray-500" />
                          Client
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{localOrder.customer.firstName} {localOrder.customer.lastName}</p>
                          <div className="flex items-center gap-1">
                            <a
                              href={`mailto:${localOrder.customer.email}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {localOrder.customer.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${localOrder.customer.phone}`}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {localOrder.customer.phone}
                            </a>
                          </div>
                          {localOrder.customer.address && (
                            <p className="text-gray-600">{localOrder.customer.address}</p>
                          )}
                          {localOrder.customer.city && (
                            <p className="text-gray-600">{localOrder.customer.city}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="font-semibold mb-3">Produse comandate</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produs</TableHead>
                            <TableHead>Cod</TableHead>
                            <TableHead className="text-right">Cantitate</TableHead>
                            <TableHead className="text-right">Preț</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {localOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.imageUrl ? (
                                    <div className="h-10 w-10 rounded-md bg-gray-100 relative overflow-hidden">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                  <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{item.code}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 mt-4 no-print">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-medium mb-6">Istoric comandă</h3>

                {timelineLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nu există evenimente în istoric</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={fetchOrderHistory}
                    >
                      Reîncarcă
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {timeline.map((event, index) => {
                      const eventInfo = getEventInfo(event);
                      return (
                        <div key={event.id} className="flex gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${eventInfo.color}`}>
                            {eventInfo.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                              <div>
                                <h4 className="font-medium">{eventInfo.title}</h4>
                                <p className="text-sm text-gray-600">{eventInfo.description}</p>
                              </div>
                              <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                                {format(new Date(event.createdAt), 'dd MMM yyyy, HH:mm', { locale: ro })}
                              </div>
                            </div>
                            {event.user && (
                              <p className="text-xs text-gray-500 mt-1">
                                De către: {event.user.name || event.user.email}
                              </p>
                            )}
                            {index < timeline.length - 1 && (
                              <div className="border-l-2 border-gray-200 h-8 ml-4 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messaging" className="mt-4 no-print">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Trimite email către client
                    </CardTitle>
                    <CardDescription>
                      Trimite notificări importante clientului despre comanda sa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Email client:</div>
                        <div className="font-medium">{localOrder.customer.email}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Telefon client:</div>
                        <div className="font-medium">{localOrder.customer.phone}</div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        className="w-full bg-black hover:bg-gray-800 text-white justify-between"
                        onClick={() => sendCustomerEmail('confirmation')}
                        disabled={emailSending}
                      >
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmare comandă
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-between border-gray-300 hover:bg-gray-50"
                        onClick={() => sendCustomerEmail('shipping')}
                        disabled={emailSending}
                      >
                        <span className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          Notificare expediere
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      {localOrder.paymentMethod.toUpperCase() === "CREDIT" && (
                        <Button
                          variant="outline"
                          className="w-full justify-between border-gray-300 hover:bg-gray-50"
                          onClick={() => sendCustomerEmail('credit')}
                          disabled={emailSending}
                        >
                          <span className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Informații credit
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {emailSending && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Se trimite email...</span>
                      </div>
                    )}

                    {emailSuccess !== null && (
                      <div className={`p-3 rounded-md ${emailSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {emailSuccess
                          ? "Email trimis cu succes către client."
                          : "Eroare la trimiterea emailului. Încearcă din nou."}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      Contactare rapidă
                    </CardTitle>
                    <CardDescription>
                      Contactează clientul direct pentru informații suplimentare
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Nume client</p>
                        <p className="text-lg font-medium">{localOrder.customer.firstName} {localOrder.customer.lastName}</p>
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <p className="text-sm text-gray-500">Detalii contact</p>
                        <div className="flex flex-col gap-1">
                          <a href={`tel:${localOrder.customer.phone}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {localOrder.customer.phone}
                          </a>
                          <a href={`mailto:${localOrder.customer.email}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {localOrder.customer.email}
                          </a>
                        </div>
                      </div>

                      {localOrder.customer.address && (
                        <div className="flex flex-col gap-2 mt-4">
                          <p className="text-sm text-gray-500">Adresă livrare</p>
                          <p className="text-gray-700">{localOrder.customer.address}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-500 mb-2">Acțiuni rapide</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() => window.open(`tel:${localOrder.customer.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Apelare
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() => window.open(`mailto:${localOrder.customer.email}`)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
