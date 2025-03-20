"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
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
  CalendarCheck,
  MapPin,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

// Define Dialog components directly from the radix primitives
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
);

const DialogOverlay = ({
  className,
  ...props
}: DialogPrimitive.DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    className={`fixed inset-0 z-50 bg-black/80 ${className}`}
    {...props}
  />
);

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
));

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
);

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

// Payment method translation map - updated to Romanian
const PAYMENT_METHOD_TRANSLATIONS = {
  CARD: "Card bancar",
  CASH: "Numerar la livrare",
  CREDIT: "Credit",
  TRANSFER: "Transfer bancar",
  PICKUP_CASH: "Numerar la ridicare",
  PICKUP: "Numerar la ridicare",
  // Ensure we have both uppercase and lowercase versions for compatibility
  card: "Card bancar",
  cash: "Numerar la livrare",
  credit: "Credit",
  transfer: "Transfer bancar",
  pickup_cash: "Numerar la ridicare",
  pickup: "Numerar la ridicare",
  Cash: "Numerar la livrare",
  Credit: "Credit",
  Card: "Card bancar",
  Pickup: "Numerar la ridicare",
};

// Types
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  code: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  financingTerm?: number;
  items: OrderItem[];
  customer: Customer;
  user: User | null;
}

interface OrderDetailsProps {
  selectedOrder: Order | null;
  showOrderDetails: boolean;
  setShowOrderDetails: (show: boolean) => void;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  statusUpdating: boolean;
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
};

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
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ro-MD", {
    style: "currency",
    currency: "MDL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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

// Get translated payment method - update to handle case insensitivity
const getTranslatedPaymentMethod = (method: string) => {
  // Convert to uppercase for consistency in lookup
  const lookupKey = method.toUpperCase();
  return (
    PAYMENT_METHOD_TRANSLATIONS[
      lookupKey as keyof typeof PAYMENT_METHOD_TRANSLATIONS
    ] ||
    PAYMENT_METHOD_TRANSLATIONS[
      method as keyof typeof PAYMENT_METHOD_TRANSLATIONS
    ] ||
    method
  );
};

// Function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Define status steps for the order timeline
const ORDER_STATUS_STEPS = {
  PENDING: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  COMPLETED: 4,
  CANCELLED: 0,
};

// Get order progress percentage based on status
const getOrderProgress = (status: string) => {
  const uppercaseStatus = status.toUpperCase();
  switch (uppercaseStatus) {
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

      .dialog-content,
      .dialog-content * {
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

// ProgressStep component for order tracking
interface ProgressStepProps {
  step: number;
  label: string;
  status: string;
  requiredProgress: number;
}

const ProgressStep = ({
  step,
  label,
  status,
  requiredProgress,
}: ProgressStepProps) => {
  const currentProgress = getOrderProgress(status);
  const isCompleted = currentProgress >= requiredProgress;
  const isCancelled = status === "CANCELLED";

  const getColorClass = () => {
    if (isCancelled) return "text-red-600";
    if (isCompleted) {
      if (status === "COMPLETED") return "text-green-600";
      if (status === "SHIPPED") return "text-purple-600";
      return "text-blue-600";
    }
    return "text-gray-400";
  };

  const getBorderClass = () => {
    if (isCancelled) return "border-red-600 bg-red-50";
    if (isCompleted) {
      if (status === "COMPLETED") return "border-green-600 bg-green-50";
      if (status === "SHIPPED") return "border-purple-600 bg-purple-50";
      return "border-blue-600 bg-blue-50";
    }
    return "border-gray-300 bg-gray-100";
  };

  return (
    <div
      className={`flex flex-col items-center text-center ${getColorClass()}`}
    >
      <div
        className={`h-6 w-6 mb-1 rounded-full flex items-center justify-center border-2 ${getBorderClass()}`}
      >
        {isCompleted ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <span className="text-xs">{step}</span>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

export function OrderDetails({
  selectedOrder,
  showOrderDetails,
  setShowOrderDetails,
  updateOrderStatus,
  statusUpdating,
}: OrderDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean | null>(null);
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
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Function to send customer email notification
  const sendCustomerEmail = async (emailType: string) => {
    setEmailSending(true);
    setEmailSuccess(null);

    try {
      // Connect to the email API endpoint
      const response = await fetch(`/api/orders/${localOrder?.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          // Include additional data for specific email types
          ...(emailType === "shipping" && {
            trackingNumber: `TRK-${Math.floor(
              100000 + Math.random() * 900000
            )}`, // Example tracking number
            estimatedDeliveryDate: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("ro-MD", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            shippingMethod: "Livrare standard",
          }),
          ...(emailType === "credit" && {
            financingTerm: localOrder?.financingTerm || 12,
          }),
        }),
      });

      if (response.ok) {
        setEmailSuccess(true);
      } else {
        setEmailSuccess(false);
        console.error("Failed to send email:", await response.text());
      }
    } catch (error) {
      setEmailSuccess(false);
      console.error("Error sending email:", error);
    } finally {
      setEmailSending(false);
    }
  };

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  if (!localOrder) return null;

  // Make the credit check case-insensitive
  const isCreditOrder = localOrder.paymentMethod.toUpperCase() === "CREDIT";
  const isCashOrder = localOrder.paymentMethod.toUpperCase() === "CASH";
  const isPickupOrder = localOrder.paymentMethod.toUpperCase() === "PICKUP";

  return (
    <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
      <DialogContent
        className="w-[95vw] max-w-4xl overflow-hidden flex flex-col dialog-content"
        ref={printRef}
      >
        <PrintStyles />

        <DialogHeader className="border-b pb-3 border-gray-200">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {isCreditOrder && (
                <CreditCard className="h-5 w-5 text-purple-600" />
              )}
              {isCashOrder && <Banknote className="h-5 w-5 text-green-600" />}
              {isPickupOrder && <Building className="h-5 w-5 text-amber-600" />}
              Comanda #{localOrder.orderNumber}
            </DialogTitle>
            <Badge
              variant="outline"
              className={
                getStatusColor(localOrder.status) + " ml-2 text-sm px-3 py-1"
              }
            >
              {getTranslatedStatus(localOrder.status, localOrder.paymentMethod)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-between mt-1">
            <span>
              Plasată{" "}
              {format(new Date(localOrder.createdAt), "dd MMMM yyyy, HH:mm", {
                locale: ro,
              })}
            </span>
            <div className="flex items-center space-x-2 no-print">
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                Printează
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto py-4 justify-start">
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-2"
          >
            <TabsList className="grid grid-cols-2 w-full no-print bg-gray-100">
              <TabsTrigger
                value="details"
                className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Package className="h-4 w-4" />
                Detalii comandă
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Mail className="h-4 w-4" />
                Comunicare
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="details"
              className="space-y-6 mt-4 print-full-width"
            >
              <div className="bg-white rounded-lg">
                {/* Order Status Bar */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(localOrder.status)}
                      <div>
                        <h3 className="font-medium">Status comandă</h3>
                        <p className="text-sm text-gray-500">
                          Actualizat la{" "}
                          {format(
                            new Date(localOrder.updatedAt),
                            "dd MMM yyyy, HH:mm",
                            { locale: ro }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          getStatusColor(localOrder.status) + " text-sm"
                        }
                      >
                        {getTranslatedStatus(
                          localOrder.status,
                          localOrder.paymentMethod
                        )}
                      </Badge>

                      <Select
                        value={localOrder.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(localOrder.id, value)
                        }
                        disabled={statusUpdating}
                      >
                        <SelectTrigger className="w-[150px] bg-white">
                          <SelectValue placeholder="Schimbă status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">
                            {getTranslatedStatus(
                              "PENDING",
                              localOrder.paymentMethod
                            )}
                          </SelectItem>
                          <SelectItem value="PROCESSING">
                            {getTranslatedStatus(
                              "PROCESSING",
                              localOrder.paymentMethod
                            )}
                          </SelectItem>
                          <SelectItem value="SHIPPED">
                            {getTranslatedStatus(
                              "SHIPPED",
                              localOrder.paymentMethod
                            )}
                          </SelectItem>
                          <SelectItem value="COMPLETED">
                            {getTranslatedStatus(
                              "COMPLETED",
                              localOrder.paymentMethod
                            )}
                          </SelectItem>
                          <SelectItem value="CANCELLED">
                            {getTranslatedStatus(
                              "CANCELLED",
                              localOrder.paymentMethod
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Order Progress Tracker */}
                  <div className="mt-6">
                    <div className="relative pt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            localOrder.status === "CANCELLED"
                              ? "bg-red-500"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${getOrderProgress(localOrder.status)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Payment method-specific progress steps */}
                    <div className="flex text-xs justify-between mt-2">
                      {isCreditOrder ? (
                        <>
                          <ProgressStep
                            step={1}
                            label="Aprobare"
                            status={localOrder.status}
                            requiredProgress={25}
                          />
                          <ProgressStep
                            step={2}
                            label="Procesare"
                            status={localOrder.status}
                            requiredProgress={50}
                          />
                          <ProgressStep
                            step={3}
                            label="Activare"
                            status={localOrder.status}
                            requiredProgress={75}
                          />
                          <ProgressStep
                            step={4}
                            label="Finalizare"
                            status={localOrder.status}
                            requiredProgress={100}
                          />
                        </>
                      ) : isCashOrder ? (
                        <>
                          <ProgressStep
                            step={1}
                            label="Confirmare"
                            status={localOrder.status}
                            requiredProgress={25}
                          />
                          <ProgressStep
                            step={2}
                            label="Procesare"
                            status={localOrder.status}
                            requiredProgress={50}
                          />
                          <ProgressStep
                            step={3}
                            label="Expediere"
                            status={localOrder.status}
                            requiredProgress={75}
                          />
                          <ProgressStep
                            step={4}
                            label="Livrare/Plată"
                            status={localOrder.status}
                            requiredProgress={100}
                          />
                        </>
                      ) : isPickupOrder ? (
                        <>
                          <ProgressStep
                            step={1}
                            label="Confirmare"
                            status={localOrder.status}
                            requiredProgress={25}
                          />
                          <ProgressStep
                            step={2}
                            label="Procesare"
                            status={localOrder.status}
                            requiredProgress={50}
                          />
                          <ProgressStep
                            step={3}
                            label="Pregătire"
                            status={localOrder.status}
                            requiredProgress={75}
                          />
                          <ProgressStep
                            step={4}
                            label="Ridicare"
                            status={localOrder.status}
                            requiredProgress={100}
                          />
                        </>
                      ) : (
                        <>
                          <ProgressStep
                            step={1}
                            label="Confirmare"
                            status={localOrder.status}
                            requiredProgress={25}
                          />
                          <ProgressStep
                            step={2}
                            label="Procesare"
                            status={localOrder.status}
                            requiredProgress={50}
                          />
                          <ProgressStep
                            step={3}
                            label="Expediere"
                            status={localOrder.status}
                            requiredProgress={75}
                          />
                          <ProgressStep
                            step={4}
                            label="Finalizare"
                            status={localOrder.status}
                            requiredProgress={100}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Details */}
                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <UserRound className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Informații client</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {localOrder.customer.firstName}{" "}
                            {localOrder.customer.lastName}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              {localOrder.customer.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="h-3.5 w-3.5 mr-1" />
                              {localOrder.customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(localOrder.customer.address ||
                        localOrder.customer.city) && (
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">
                              Adresă livrare
                            </p>
                            <p className="text-sm text-gray-600">
                              {localOrder.customer.address}
                              {localOrder.customer.city &&
                                `, ${localOrder.customer.city}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCardIcon className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium">Informații plată</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Metodă plată:
                        </span>
                        <Badge
                          variant="outline"
                          className={getPaymentMethodColor(
                            localOrder.paymentMethod
                          )}
                        >
                          {getTranslatedPaymentMethod(localOrder.paymentMethod)}
                        </Badge>
                      </div>

                      {/* Credit specific info */}
                      {isCreditOrder && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Perioada creditare:
                            </span>
                            <span className="text-sm font-medium">
                              {localOrder.financingTerm || 12} luni
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Rata lunară:
                            </span>
                            <span className="text-sm font-medium text-primary">
                              {formatCurrency(
                                Math.round(
                                  localOrder.total /
                                    (localOrder.financingTerm || 12)
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Dobândă:
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              0%
                            </span>
                          </div>
                        </>
                      )}

                      {/* Cash specific info */}
                      {isCashOrder && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <Banknote className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <div className="text-sm text-green-700">
                                Plată la livrare
                              </div>
                              <div className="text-xs text-green-600">
                                Clientul va plăti la primirea coletului suma de{" "}
                                {formatCurrency(localOrder.total)}.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pickup specific info */}
                      {isPickupOrder && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <Building className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <div className="text-sm text-amber-700">
                                Ridicare din magazin
                              </div>
                              <div className="text-xs text-amber-600">
                                Clientul va ridica comanda din magazin și va
                                plăti suma de {formatCurrency(localOrder.total)}
                                .
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center font-medium mt-2 pt-2 border-t border-gray-100">
                        <span>Total:</span>
                        <span className="text-lg">
                          {formatCurrency(localOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="mb-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    Produse comandate
                  </h3>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produs</TableHead>
                          <TableHead>Cod</TableHead>
                          <TableHead className="text-right">
                            Cantitate
                          </TableHead>
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
                                <span className="font-medium truncate max-w-[200px]">
                                  {item.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{item.code}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-right font-medium"
                          >
                            Total comandă:
                          </TableCell>
                          <TableCell className="text-right font-medium text-lg">
                            {formatCurrency(localOrder.total)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Special Delivery Info for Cash or Shipped orders */}
                {(isCashOrder ||
                  localOrder.status === "SHIPPED" ||
                  localOrder.status === "COMPLETED") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-blue-700">
                        {localOrder.status === "COMPLETED"
                          ? "Comandă livrată"
                          : localOrder.status === "SHIPPED"
                          ? "Comandă în curs de livrare"
                          : "Informații livrare"}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {localOrder.status === "SHIPPED" && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <CalendarCheck className="h-4 w-4" />
                          <span>
                            Data estimată livrare:{" "}
                            {format(
                              new Date(
                                new Date().getTime() + 2 * 24 * 60 * 60 * 1000
                              ),
                              "dd MMMM yyyy",
                              { locale: ro }
                            )}
                          </span>
                        </div>
                      )}

                      {localOrder.status === "COMPLETED" && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            Livrată la{" "}
                            {format(
                              new Date(localOrder.updatedAt),
                              "dd MMMM yyyy",
                              { locale: ro }
                            )}
                          </span>
                        </div>
                      )}

                      {localOrder.customer.address && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {localOrder.customer.address}
                            {localOrder.customer.city &&
                              `, ${localOrder.customer.city}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Pickup Info */}
                {isPickupOrder && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium text-amber-700">
                        {localOrder.status === "COMPLETED"
                          ? "Comandă ridicată"
                          : localOrder.status === "SHIPPED"
                          ? "Comandă gata de ridicare"
                          : "Informații ridicare"}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <MapPin className="h-4 w-4" />
                        <span>Str. Independenței 42, Chișinău</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Luni-Vineri: 9:00-18:00, Sâmbăta: 10:00-15:00
                        </span>
                      </div>

                      {localOrder.status === "SHIPPED" && (
                        <div className="mt-2 p-2 bg-amber-100 rounded-md text-amber-800 text-sm">
                          Notă: Vă rugăm să prezentați un act de identitate la
                          ridicarea comenzii.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="communication" className="mt-4 no-print">
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
                        <div className="text-sm text-gray-600">
                          Email client:
                        </div>
                        <div className="font-medium">
                          {localOrder.customer.email}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Telefon client:
                        </div>
                        <div className="font-medium">
                          {localOrder.customer.phone}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        className="w-full bg-black hover:bg-gray-800 text-white justify-between"
                        onClick={() => sendCustomerEmail("confirmation")}
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
                        onClick={() => sendCustomerEmail("shipping")}
                        disabled={emailSending}
                      >
                        <span className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          Notificare expediere
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      {isCreditOrder && (
                        <Button
                          variant="outline"
                          className="w-full justify-between border-gray-300 hover:bg-gray-50"
                          onClick={() => sendCustomerEmail("credit")}
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
                      <div
                        className={`p-3 rounded-md ${
                          emailSuccess
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
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
                        <p className="text-lg font-medium">
                          {localOrder.customer.firstName}{" "}
                          {localOrder.customer.lastName}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <p className="text-sm text-gray-500">Detalii contact</p>
                        <div className="flex flex-col gap-1">
                          <a
                            href={`tel:${localOrder.customer.phone}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {localOrder.customer.phone}
                          </a>
                          <a
                            href={`mailto:${localOrder.customer.email}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {localOrder.customer.email}
                          </a>
                        </div>
                      </div>

                      {localOrder.customer.address && (
                        <div className="flex flex-col gap-2 mt-4">
                          <p className="text-sm text-gray-500">
                            Adresă livrare
                          </p>
                          <p className="text-gray-700">
                            {localOrder.customer.address}
                            {localOrder.customer.city &&
                              `, ${localOrder.customer.city}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Acțiuni rapide
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() =>
                            window.open(`tel:${localOrder.customer.phone}`)
                          }
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Apelare
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() =>
                            window.open(`mailto:${localOrder.customer.email}`)
                          }
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
  );
}
