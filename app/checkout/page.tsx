"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  ChevronLeft,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Store,
  Mail,
  Calendar,
  BadgePercent,
  ChevronRight,
  FileText,
  User,
  MapPin,
  Phone,
  Clock,
  ShoppingBag,
  Home,
  Info,
  NotebookPen,
  Banknote,
  ShieldCheck,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/app/components/ui/use-toast"
import { useCart } from "@/app/contexts/cart-context"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { MorphingText } from "@/components/magicui/morphing-text"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

// Define order item interface
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// Extended order details interface
interface OrderDetails {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string; // Make city optional
  };
  paymentMethod: string;
  financingTerm?: number; // Added for credit payment
}

// DeliveryOptionCard component
const DeliveryOptionCard = ({
  selected,
  onClick,
  title,
  description,
  value,
  icon
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
        selected
          ? "border-primary/70 bg-primary/5 shadow-sm"
          : "border-muted hover:border-primary/30 hover:bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
        selected ? "border-primary" : "border-muted-foreground/30"
      )}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
    </div>
  )
}

// PaymentOptionCard component
const PaymentOptionCard = ({
  selected,
  onClick,
  title,
  description,
  value,
  icon,
  children
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
        selected
          ? "border-primary/70 bg-primary/5 shadow-sm"
          : "border-muted hover:border-primary/30 hover:bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {children}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
        selected ? "border-primary" : "border-muted-foreground/30"
      )}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, clearCart, totalItems, totalPrice } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("pickup")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: ""
  })

  // Added for T&C checkboxes
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)

  // Added for delivery fee
  const deliveryFee = 50 // Fixed delivery fee of 50 MDL

  // Added for credit payment
  const [financingTerm, setFinancingTerm] = useState<number>(12)

  const { t } = useLanguage()

  // Get credit term from cart items
  useEffect(() => {
    if (items.length > 0) {
      // Find the first item with credit option
      const creditItem = items.find(item => item.product.creditOption);
      if (creditItem?.product.creditOption) {
        setFinancingTerm(creditItem.product.creditOption.months);
      }
    }
  }, [items]);

  // Calculate monthly payment for credit option
  const calculateMonthlyPayment = (total: number, months: number) => {
    return Math.round(total / months)
  }

  // Add this useEffect at the top level, outside of any conditionals
  useEffect(() => {
    // Only execute this logic when orderCompleted is true
    if (orderCompleted) {
      const storedOrderNumber = sessionStorage.getItem('lastOrderNumber')
      setOrderNumber(storedOrderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`)
    }
  }, [orderCompleted]) // Add orderCompleted as a dependency

  // Add this useEffect to ensure we have a payment method
  useEffect(() => {
    if (orderCompleted && orderDetails) {
      // Check if orderDetails has a payment method, if not use the one from session storage or the state
      if (!orderDetails.paymentMethod) {
        const storedPaymentMethod = sessionStorage.getItem('lastPaymentMethod');
        const updatedOrderDetails = {
          ...orderDetails,
          paymentMethod: storedPaymentMethod || paymentMethod
        };
        setOrderDetails(updatedOrderDetails);
      }
    }
  }, [orderCompleted, orderDetails, paymentMethod]);

  // Redirect to cart if cart is empty
  if (items.length === 0 && !orderCompleted) {
    return (
      <div className="min-h-screen relative">
        {/* Background Pattern */}
        <div className="absolute inset-0">
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
            className="opacity-40 [mask-image:radial-gradient(white,transparent)]"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 container max-w-7xl py-10 md:py-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 md:mb-12">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/cart" className="hover:text-primary transition-colors">
              {t("cart_title")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {t("checkout_title")}
            </span>
          </nav>

          {/* Page title */}
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("cart_empty")}
            </Badge>

            <div className="mb-4 md:mb-6">
              {/* Mobile title */}
              <div className="md:hidden">
                <MorphingText
                  texts={[ t("cart_empty")]}
                  className="h-12 text-[30pt]"
                />
              </div>

              {/* Desktop title */}
              <div className="hidden md:block">
                <MorphingText
                  texts={[t("checkout_title"), t("cart_empty")]}
                  className="h-16 text-[40pt] lg:text-[50pt]"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("checkout_empty_cart_message")}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-10 md:py-16">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="h-12 w-12" />
            </div>

            <ShimmerButton
              className="px-6 py-2.5 text-base font-medium"
              shimmerColor="#00BFFF"
              shimmerSize="0.05em"
              shimmerDuration="3s"
              borderRadius="8px"
              background="rgba(0, 0, 0, 0.9)"
              onClick={() => window.location.href = "/catalog"}
            >
              {t('cart_explore_catalog')}
            </ShimmerButton>
          </div>
        </div>
      </div>
    )
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName) errors.firstName = t('checkout_error_firstname_required')
    if (!formData.lastName) errors.lastName = t('checkout_error_lastname_required')
    if (!formData.email) errors.email = t('checkout_error_email_required')
    if (!formData.phone) errors.phone = t('checkout_error_phone_required')

    // Only validate address fields if payment method requires delivery
    if (paymentMethod === "cash") {
      if (!formData.address) errors.address = t('checkout_error_address_required')
      if (!formData.city) errors.city = t('checkout_error_city_required')
    }

    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = t('checkout_error_email_invalid')
    }

    // Phone validation
    if (formData.phone && !/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      errors.phone = t('checkout_error_phone_invalid')
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Format currency for display
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '0 MDL';
    return amount.toLocaleString() + ' MDL';
  }

  // Handle order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: t('checkout_error_incomplete_form'),
        description: t('checkout_error_complete_required_fields'),
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // For pickup orders or credit, set a placeholder for the address
      const customerData = { ...formData };
      if (paymentMethod === "pickup" || paymentMethod === "credit") {
        customerData.address = t('checkout_pickup_placeholder');
        customerData.city = t('checkout_city_chisinau');
      }

      // Store the current payment method before sending the request
      const selectedPaymentMethod = paymentMethod;

      // Send order data to backend
      const response = await fetch('/api/orders-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData,
          items: items,
          total: totalPrice,
          paymentMethod: selectedPaymentMethod, // Use the stored payment method
          // Include financing term if credit method is selected
          ...(selectedPaymentMethod === "credit" && { financingTerm })
        })
      })

      try {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Eroare la procesarea comenzii')
        }

        // Log what payment method is coming back from API
        console.log("API Response Payment Method:", data.order?.paymentMethod);
        console.log("Selected Payment Method:", selectedPaymentMethod);
        console.log("Selected Financing Term:", financingTerm);

        // Store complete order details for the confirmation page
        // Ensure payment method is set correctly
        if (data.order) {
          // If API doesn't return payment method, use the one selected by user
          if (!data.order.paymentMethod) {
            data.order.paymentMethod = selectedPaymentMethod;
          }

          // Make sure financing term is passed correctly
          if (selectedPaymentMethod === "credit" && !data.order.financingTerm) {
            data.order.financingTerm = financingTerm;
          }

          // Ensure customer name is properly formatted
          if (!data.order.customer.name) {
            data.order.customer.name = `${formData.firstName} ${formData.lastName}`;
          }

          setOrderDetails(data.order);
        }

        // Show success state
        setOrderCompleted(true)
        clearCart()

        // Store order number for confirmation page
        const orderNumber = data.order?.orderNumber || ('ORD-' + Math.floor(100000 + Math.random() * 900000))
        sessionStorage.setItem('lastOrderNumber', orderNumber)
        // Also store payment method as a backup
        sessionStorage.setItem('lastPaymentMethod', selectedPaymentMethod)

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        console.error('Order processing error:', error);
        toast({
          title: "Eroare",
          description: error instanceof Error ? error.message : "A apărut o eroare la procesarea comenzii. Te rugăm să încerci din nou.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "A apărut o eroare la procesarea comenzii. Te rugăm să încerci din nou.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get payment method display text
  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'pickup': return 'Ridicare din magazin';
      case 'cash': return 'Numerar la livrare';
      case 'credit': return 'Solicitare credit';
      default: return method;
    }
  }

  // Handle payment method change
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method)
  }

  // Form validation function
  const formIsValid = () => {
    return (
      formData.firstName !== "" &&
      formData.lastName !== "" &&
      formData.email !== "" &&
      formData.phone !== "" &&
      (paymentMethod !== "cash" || (formData.address !== "" && formData.city !== ""))
    )
  }

  // Order completed view
  if (orderCompleted) {
    // Get payment method from order details or fallback to state
    const currentPaymentMethod = orderDetails?.paymentMethod || paymentMethod;
    console.log("Rendering confirmation with payment method:", currentPaymentMethod);

    return (
      <div className="min-h-screen relative">
        {/* Background Pattern */}
        <div className="absolute inset-0">
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
            className="opacity-40 [mask-image:radial-gradient(white,transparent)]"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 container max-w-3xl px-4 py-10 md:py-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 md:mb-12">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/cart" className="hover:text-primary transition-colors">
              {t("cart_title")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {t("checkout_success")}
            </span>
          </nav>

          {/* Page title */}
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {currentPaymentMethod === 'credit'
                ? t('confirmation_credit_request_registered')
                : t('order_success')}
            </Badge>

            <div className="mb-4 md:mb-6">
              {/* Mobile title */}
              <div className="md:hidden">
                <MorphingText
                  texts={[t("confirmation_order_registered_title"), t("thank_you_for_order")]}
                  className="h-12 text-[20pt]"
                />
              </div>

              {/* Desktop title */}
              <div className="hidden md:block">
                <MorphingText
                  texts={[
                    t("confirmation_order_registered_title"),
                    t("thank_you_for_order"),
                    currentPaymentMethod === 'credit'
                      ? t('confirmation_credit_request_registered')
                      : t('confirmation_order_registered')
                  ]}
                  className="h-16 text-[35pt] lg:text-[35pt]"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {currentPaymentMethod === 'credit'
                ? t('checkout_credit_contact')
                : `${t('confirmation_order_registered')} ${t('confirmation_notification')}`}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-lg overflow-hidden"
          >
            {/* Success header section */}
            <div className="bg-white p-6 text-center border-b border-gray-100">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>

              <h1 className="mb-2 text-xl font-bold text-gray-900">
                {currentPaymentMethod === 'credit'
                  ? t('confirmation_credit_request_registered')
                  : t('confirmation_order_registered_title')}
              </h1>
            </div>

            {orderDetails ? (
              <div className="p-6">
                {/* Order reference number - prominent display */}
                <div className="bg-primary/5 rounded-lg p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">{t('confirmation_order_number_label')}:</span>
                  </div>
                  <span className="font-bold text-sm bg-black text-white rounded-full px-2.5 py-1">
                    {orderDetails.orderNumber}
                  </span>
                </div>

                {/* Order summary card */}
                <Card className="mb-4 border-primary/10 bg-white/80 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      {t('confirmation_order_summary')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="grid gap-2.5 mb-4 text-sm border-b border-gray-100 pb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('confirmation_order_date')}:</span>
                        <span className="font-medium">{orderDetails.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('confirmation_payment_method')}:</span>
                        <div className="font-medium flex items-center">
                          {currentPaymentMethod === 'credit' && <CreditCard className="h-3.5 w-3.5 mr-1 text-primary" />}
                          {currentPaymentMethod === 'pickup' && <Store className="h-3.5 w-3.5 mr-1 text-primary" />}
                          {currentPaymentMethod === 'cash' && <Truck className="h-3.5 w-3.5 mr-1 text-primary" />}
                          {getPaymentMethodText(currentPaymentMethod)}
                          {currentPaymentMethod === 'credit' && (
                            <Badge className="ml-1.5 text-xs bg-primary/10 text-primary h-5">0%</Badge>
                          )}
                        </div>
                      </div>
                      {currentPaymentMethod === 'credit' && orderDetails?.financingTerm && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('checkout_period')}:</span>
                            <span className="font-medium">{t('checkout_term_months').replace('{term}', orderDetails?.financingTerm.toString())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('checkout_monthly_rate')}:</span>
                            <span className="font-medium text-primary">
                              {formatCurrency(Math.round((orderDetails?.total || 0) / (orderDetails?.financingTerm || 12)))}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-900 font-medium">Total:</span>
                        <span className="font-bold text-primary text-base">{formatCurrency(orderDetails?.total || 0)}</span>
                      </div>
                    </div>

                    {/* Customer information */}
                    <div className="mb-4">
                      <h3 className="font-medium mb-2 text-sm flex items-center">
                        <User className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        {t('confirmation_customer_info')}
                      </h3>
                      <div className="bg-primary/5 p-3 rounded-md text-sm border border-primary/20">
                        <p className="font-medium flex items-center">
                          <User className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          {orderDetails.customer.name || `${(orderDetails.customer as any).firstName || ''} ${(orderDetails.customer as any).lastName || ''}`}
                        </p>
                        {currentPaymentMethod === 'cash' && (
                          <p className="mt-1.5 flex items-start">
                            <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{orderDetails.customer.address}</span>
                          </p>
                        )}
                        <p className="mt-1.5 flex items-center">
                          <Phone className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          {orderDetails.customer.phone}
                        </p>
                        <p className="mt-1.5 flex items-center">
                          <Mail className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          <span className="truncate">{orderDetails.customer.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Order items */}
                    <div>
                      <h3 className="font-medium mb-2 text-sm flex items-center">
                        <Package className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        {t('confirmation_ordered_products')}
                        <span className="text-xs text-muted-foreground ml-1.5">({orderDetails.items.length})</span>
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-auto pr-2 -mr-2 mb-3">
                        {orderDetails.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 border-b border-gray-100 pb-3 group hover:bg-primary/5 rounded-lg p-2 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm group-hover:text-primary transition-colors">{item.name}</p>
                              <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                                <span className="font-medium">{formatCurrency(item.total)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="font-medium text-sm">{t('confirmation_total_products')}:</span>
                        <span className="font-bold text-primary">{formatCurrency(orderDetails?.total || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment method specific info cards */}
                <div className="space-y-4 mb-6">
                  {/* Credit payment info */}
                  {currentPaymentMethod === 'credit' && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          {t('confirmation_about_credit')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          {t('confirmation_credit_contact')}
                        </p>

                        <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-3">
                          <div className="flex items-center text-xs gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span><strong>{t('checkout_period')}:</strong> {t('checkout_term_months').replace('{term}', (orderDetails?.financingTerm || financingTerm || 12).toString())}</span>
                          </div>

                          <div className="flex items-center text-xs gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-primary" />
                            <span><strong>{t('checkout_monthly_rate')}:</strong> {formatCurrency(Math.round((orderDetails?.total || 0) / (orderDetails?.financingTerm || financingTerm || 12)))}</span>
                          </div>

                          <Separator className="my-2" />

                          <h5 className="text-xs font-medium flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            {t('checkout_next_steps')}:
                          </h5>
                          <ol className="list-decimal pl-4 text-xs space-y-1.5 text-muted-foreground">
                            <li>{t('confirmation_after_credit_approval')}</li>
                            <li>{t('confirmation_credit_contract')}</li>
                          </ol>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <ShimmerButton
                          className="w-full py-2 text-sm"
                          shimmerColor="#00BFFF"
                          shimmerSize="0.05em"
                          shimmerDuration="3s"
                          borderRadius="8px"
                          background="rgba(0, 0, 0, 0.9)"
                          onClick={() => window.location.href = "/credit"}
                        >
                          <span>{t('confirmation_credit_info')}</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </ShimmerButton>
                      </CardFooter>
                    </Card>
                  )}

                  {/* Pickup info */}
                  {currentPaymentMethod === 'pickup' && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          {t('confirmation_delivery_pickup')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          {t('confirmation_order_registered')}
                          {t('confirmation_notification')}
                        </p>

                        <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-3">
                          <div className="flex items-start text-xs gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                            <div>
                              <strong>{t('confirmation_store_address')}</strong><br />
                              {t('checkout_store_address').split(': ')[1]}
                            </div>
                          </div>

                          <div className="flex items-center text-xs gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <div>
                              <strong>{t('confirmation_store_hours')}</strong><br />
                              {t('confirmation_monday_friday')}<br />
                              {t('confirmation_saturday')}<br />
                              {t('confirmation_sunday')}
                            </div>
                          </div>

                          <Separator className="my-2" />

                          <div className="flex items-center text-xs gap-1.5 bg-primary/5 p-2 rounded">
                            <AlertCircle className="h-3.5 w-3.5 text-primary" />
                            <span>{t('confirmation_order_number')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cash delivery info */}
                  {currentPaymentMethod === 'cash' && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary" />
                          {t('confirmation_delivery_address')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          {t('confirmation_delivery_info')}
                        </p>

                        <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-3">
                          <div className="flex items-start text-xs gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                            <div>
                              <strong>{t('confirmation_delivery_address_label')}</strong><br />
                              {orderDetails.customer.address}
                              {orderDetails.customer.city ? `, ${orderDetails.customer.city}` : ''}
                            </div>
                          </div>

                          <div className="flex items-center text-xs gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <div>
                              <strong>{t('confirmation_delivery_time')}</strong><br />
                              {t('confirmation_working_days')}
                            </div>
                          </div>

                          <Separator className="my-2" />

                          <div className="flex items-center text-xs gap-1.5 bg-primary/5 p-2 rounded">
                            <Package className="h-3.5 w-3.5 text-primary" />
                            <span>{t('confirmation_cash_payment')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Email notification */}
                <div className="bg-primary/5 rounded-lg p-4 mb-6 flex items-start gap-2 border border-primary/20">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      {t('confirmation_email_notification')}
                    </p>
                    <p className="text-muted-foreground">
                      {t('confirmation_email_sent')} <strong>{orderDetails.customer.email}</strong>.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center">
                  <ShimmerButton
                    className="flex-1 py-3"
                    shimmerColor="#00BFFF"
                    shimmerSize="0.05em"
                    shimmerDuration="3s"
                    borderRadius="8px"
                    background="rgba(0, 0, 0, 0.9)"
                    onClick={() => window.location.href = "/catalog"}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {t('confirmation_continue_shopping')}
                  </ShimmerButton>


                </div>
              </div>
            ) : (
              /* Simplified fallback view when orderDetails is not available */
              <div className="p-6">
                <Card className="border-primary/10 bg-white/80 shadow-md mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {t('confirmation_order_registered_title')}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('confirmation_order_number_label')}:</span>
                        <span className="font-medium">{orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('cart_total')}:</span>
                        <span className="font-medium">{totalPrice.toLocaleString()} MDL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('confirmation_payment_method')}:</span>
                        <span className="font-medium flex items-center">
                          {getPaymentMethodText(currentPaymentMethod)}
                          {currentPaymentMethod === 'credit' && (
                            <Badge className="ml-1.5 text-xs bg-primary/10 text-primary">0%</Badge>
                          )}
                        </span>
                      </div>

                      {currentPaymentMethod === 'credit' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('checkout_period')}:</span>
                            <span className="font-medium">{t('checkout_term_months').replace('{term}', financingTerm.toString())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('checkout_monthly_rate')}:</span>
                            <span className="font-medium text-primary">{formatCurrency(calculateMonthlyPayment(totalPrice, financingTerm))}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment method specific simplified cards */}
                {currentPaymentMethod === 'credit' && (
                  <Card className="border-primary/20 bg-primary/5 mb-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        {t('confirmation_about_credit')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="mb-2">
                        {t('confirmation_credit_contact')}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <ShimmerButton
                        className="w-full py-2 text-sm"
                        shimmerColor="#00BFFF"
                        shimmerSize="0.05em"
                        shimmerDuration="3s"
                        borderRadius="8px"
                        background="rgba(0, 0, 0, 0.9)"
                        onClick={() => window.location.href = "/credit"}
                      >
                        <span>{t('confirmation_credit_info')}</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </ShimmerButton>
                    </CardFooter>
                  </Card>
                )}

                {currentPaymentMethod === 'pickup' && (
                  <Card className="border-primary/20 bg-primary/5 mb-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {t('confirmation_delivery_pickup')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="mb-2">
                        {t('confirmation_order_registered')}
                        {t('confirmation_notification')}
                      </p>
                      <p className="bg-white p-2 rounded border border-gray-200 text-xs">
                        {t('checkout_store_address').split(': ')[1]}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {currentPaymentMethod === 'cash' && (
                  <Card className="border-primary/20 bg-primary/5 mb-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        {t('confirmation_delivery_address')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>
                        {t('confirmation_delivery_info')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions - simplified */}
                <div className="flex justify-center">
                  <ShimmerButton
                    className="flex-1 py-3"
                    shimmerColor="#00BFFF"
                    shimmerSize="0.05em"
                    shimmerDuration="3s"
                    borderRadius="8px"
                    background="rgba(0, 0, 0, 0.9)"
                    onClick={() => window.location.href = "/catalog"}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {t('confirmation_continue_shopping')}
                  </ShimmerButton>

                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div className="absolute inset-0">
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
          className="opacity-40 [mask-image:radial-gradient(white,transparent)]"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container py-10 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            {t("home")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/cart" className="hover:text-primary transition-colors">
            {t("cart_title")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            {t("checkout_title")}
          </span>
        </nav>

        {/* Page title */}
        <div className="mb-8 md:mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {items.length === 1
              ? t("product_count_singular")
              : t("product_count").replace("{count}", items.length.toString())}
          </Badge>

          <div className="mb-4">
            {/* Mobile title */}
            <div className="md:hidden">
              <MorphingText
                texts={[t("checkout_title")]}
                className="h-12 text-[30pt]"
              />
            </div>

            {/* Desktop title */}
            <div className="hidden md:block">
              <MorphingText
                texts={[t("checkout_title"), t("checkout_complete_order")]}
                className="h-16 text-[40pt] lg:text-[50pt]"
              />
            </div>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            {t("checkout_intro")}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left column - form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handleSubmitOrder} className="space-y-8">
              <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t("checkout_personal_info")}
                  </CardTitle>
                  <CardDescription>
                    {t("checkout_required_fields")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t("checkout_first_name")} *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        className="mt-1"
                        placeholder={t("checkout_first_name_placeholder")}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("checkout_last_name")} *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        className="mt-1"
                        placeholder={t("checkout_last_name_placeholder")}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{t("checkout_email")} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="mt-1"
                        placeholder={t("checkout_email_placeholder")}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("checkout_phone")} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        className="mt-1"
                        placeholder={t("checkout_phone_placeholder")}
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t("checkout_payment")}
                  </CardTitle>
                  <CardDescription>
                    {t("checkout_select_payment")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Credit Payment Option */}
                    <div
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                        paymentMethod === 'credit'
                          ? "border-primary/70 bg-primary/5 shadow-sm"
                          : "border-muted hover:border-primary/30 hover:bg-primary/5"
                      )}
                      onClick={() => setPaymentMethod('credit')}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        paymentMethod === 'credit' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{t("checkout_payment_credit")}</p>
                          <Badge className="bg-primary/10 text-primary font-normal ml-2">0%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{t("checkout_payment_credit_description")}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        paymentMethod === 'credit' ? "border-primary" : "border-muted-foreground/30"
                      )}>
                        {paymentMethod === 'credit' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>

                    {/* Pickup Payment Option */}
                    <div
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                        paymentMethod === 'pickup'
                          ? "border-primary/70 bg-primary/5 shadow-sm"
                          : "border-muted hover:border-primary/30 hover:bg-primary/5"
                      )}
                      onClick={() => setPaymentMethod('pickup')}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        paymentMethod === 'pickup' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Store className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{t("checkout_payment_pickup")}</p>
                        <p className="text-sm text-muted-foreground">{t("checkout_store_address")}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        paymentMethod === 'pickup' ? "border-primary" : "border-muted-foreground/30"
                      )}>
                        {paymentMethod === 'pickup' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>

                    {/* Cash delivery Payment Option */}
                    <div
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
                        paymentMethod === 'cash'
                          ? "border-primary/70 bg-primary/5 shadow-sm"
                          : "border-muted hover:border-primary/30 hover:bg-primary/5"
                      )}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        paymentMethod === 'cash' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{t("checkout_delivery_cash")}</p>
                        <p className="text-sm text-muted-foreground">{t("checkout_delivery_cash_description")}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        paymentMethod === 'cash' ? "border-primary" : "border-muted-foreground/30"
                      )}>
                        {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>

                    {/* Delivery Address Fields - Only shown for Cash option */}
                    {paymentMethod === 'cash' && (
                      <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5 mt-4 animate-in fade-in-50 duration-300">
                        <div>
                          <Label htmlFor="address">{t("checkout_address")} *</Label>
                          <Input
                            id="address"
                            name="address"
                            className="mt-1"
                            placeholder={t("checkout_address_placeholder")}
                            value={formData.address}
                            onChange={handleInputChange}
                            required={paymentMethod === 'cash'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">{t("checkout_city")} *</Label>
                          <Input
                            id="city"
                            name="city"
                            className="mt-1"
                            placeholder={t("checkout_city_placeholder")}
                            value={formData.city}
                            onChange={handleInputChange}
                            required={paymentMethod === 'cash'}
                          />
                        </div>
                      </div>
                    )}

                    {/* Credit payment additional options */}
                    {paymentMethod === 'credit' && (
                      <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 mt-4 space-y-4 animate-in fade-in-50 duration-300">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="financingTerm">{t("checkout_financing_term")}</Label>
                            <span className="text-sm font-medium text-primary">{financingTerm} {t("checkout_months")}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">12</span>
                            <Slider
                              id="financingTerm"
                              defaultValue={[financingTerm]}
                              min={12}
                              max={36}
                              step={6}
                              className="flex-1"
                              onValueChange={(value) => setFinancingTerm(value[0])}
                            />
                            <span className="text-xs text-muted-foreground">36</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-primary/10 flex flex-wrap gap-3">
                          {[12, 18, 24, 30, 36].map((months) => (
                            <Button
                              key={months}
                              type="button"
                              variant={financingTerm === months ? "default" : "outline"}
                              className={cn(
                                "h-auto py-2 px-3 text-xs",
                                financingTerm === months
                                  ? "bg-primary text-white"
                                  : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                              )}
                              onClick={() => setFinancingTerm(months)}
                            >
                              {months} {t("checkout_months")}
                            </Button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-white border border-primary/10">
                            <p className="text-xs text-muted-foreground mb-1">{t("checkout_monthly_payment")}</p>
                            <p className="text-lg font-semibold text-primary">
                              {formatCurrency(calculateMonthlyPayment(totalPrice, financingTerm))}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-primary/10">
                            <p className="text-xs text-muted-foreground mb-1">{t("checkout_total_credit")}</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(totalPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-xs text-muted-foreground">
                            <p>{t("checkout_credit_more_info")}</p>
                            <Link href="/credit" className="text-primary hover:underline mt-1 inline-block">
                              {t("checkout_credit_learn_more")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <NotebookPen className="h-5 w-5 text-primary" />
                    {t("checkout_additional_notes")}
                  </CardTitle>
                  <CardDescription>
                    {t("checkout_notes_optional")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder={t("checkout_notes_placeholder")}
                    className="min-h-[100px]"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <ShimmerButton
                    type="submit"
                    className="px-6 py-3 text-base"
                    shimmerColor="#00BFFF"
                    shimmerSize="0.05em"
                    shimmerDuration="3s"
                    borderRadius="8px"
                    background="rgba(0, 0, 0, 0.9)"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("checkout_processing")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        {t("checkout_place_order")}
                      </div>
                    )}
                  </ShimmerButton>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Right column - cart summary */}
          <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-6">
              <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    {t("checkout_order_summary")}
                  </CardTitle>
                  <CardDescription>
                    {items.length === 1
                      ? t("product_count_singular")
                      : t("product_count").replace("{count}", items.length.toString())}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-auto pr-2 -mr-2 mb-4">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 group hover:bg-primary/5 rounded-lg p-2 transition-colors"
                      >
                        {item.product.imagini[0] && (
                          <Image
                            src={item.product.imagini[0]}
                            alt={item.product.nume}
                            width={60}
                            height={60}
                            className="rounded-md object-cover border border-gray-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {item.product.nume}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-muted-foreground text-sm">
                              {item.quantity} x {formatCurrency(item.product.pretRedus || item.product.pret)}
                            </span>
                            <span className="font-medium text-primary">{formatCurrency((item.product.pretRedus || item.product.pret) * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t("cart_subtotal")}</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t("cart_delivery")}</span>
                      <span>{paymentMethod === 'cash' ? formatCurrency(deliveryFee) : t("cart_free")}</span>
                    </div>
                    {paymentMethod === 'credit' && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t("checkout_term")}</span>
                          <span>{financingTerm} {t("checkout_months")}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t("checkout_monthly_rate")}</span>
                          <span className="text-primary font-medium">
                            {formatCurrency(calculateMonthlyPayment(totalPrice, financingTerm))}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center text-base font-semibold pt-2 border-t border-dashed border-gray-200 mt-2">
                      <span>{t("cart_total")}</span>
                      <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      {t("checkout_help")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>+373 601 75 111</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>intelectmd@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{t("checkout_support_hours")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
