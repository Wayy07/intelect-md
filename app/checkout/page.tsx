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
  Home
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
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"

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
    city: ""
  })

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
      <div className="container max-w-7xl py-10">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-muted-foreground">
            <ShoppingCart className="h-12 w-12" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{t('cart_empty')}</h2>
          <p className="mb-8 max-w-md text-center text-muted-foreground">
            {t('checkout_empty_cart_message')}
          </p>
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/catalog">
              {t('cart_explore_catalog')}
            </Link>
          </Button>
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

  // Order completed view
  if (orderCompleted) {
    // Get payment method from order details or fallback to state
    const currentPaymentMethod = orderDetails?.paymentMethod || paymentMethod;
    console.log("Rendering confirmation with payment method:", currentPaymentMethod);

    return (
      <div className="container max-w-3xl px-4 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
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

            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {currentPaymentMethod === 'credit'
                ? t('checkout_credit_contact')
                : `${t('confirmation_order_registered')} ${t('confirmation_notification')}`}
            </p>
          </div>

          {orderDetails ? (
            <div className="p-4 sm:p-6">
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

              {/* Order summary card - Optimized for mobile */}
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 mb-4">
                <h2 className="text-base font-semibold flex items-center mb-3">
                  <ShoppingCart className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  {t('confirmation_order_registered_title')}
                </h2>

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
                    <span className="font-bold text-base">{formatCurrency(orderDetails?.total || 0)}</span>
                  </div>
                </div>

                {/* Customer information - mobile-friendly */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-sm flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    {t('confirmation_customer_info')}
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-100">
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

                {/* Order items - mobile optimized */}
                <div>
                  <h3 className="font-medium mb-2 text-sm flex items-center">
                    <Package className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    {t('confirmation_ordered_products')}
                    <span className="text-xs text-muted-foreground ml-1.5">({orderDetails.items.length})</span>
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-auto pr-2 -mr-2 mb-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{item.name}</p>
                          <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                            <span>{item.quantity} x {formatCurrency(item.price)}</span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="font-medium text-sm">Total produse:</span>
                    <span className="font-bold">{formatCurrency(orderDetails?.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Payment method specific info cards - mobile optimized */}
              {/* Credit payment info */}
              {currentPaymentMethod === 'credit' && (
                <div className="mb-4 bg-primary/5 rounded-lg border border-primary/20 overflow-hidden">
                  <div className="bg-primary/10 p-3 border-b border-primary/10 flex items-center">
                    <CreditCard className="h-4 w-4 text-primary mr-2" />
                    <h4 className="font-medium text-sm">{t('confirmation_about_credit')}</h4>
                  </div>
                  <div className="p-3">
                    <p className="text-xs mb-3">
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

                    {/* Learn more link for credit */}
                    <div className="mt-3 text-center">
                      <Button variant="link" asChild className="text-xs text-primary h-auto p-0">
                        <Link href="/credit" className="flex items-center justify-center">
                          <span>{t('confirmation_credit_info')}</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pickup info - mobile optimized */}
              {currentPaymentMethod === 'pickup' && (
                <div className="mb-4 bg-primary/5 rounded-lg border border-primary/20 overflow-hidden">
                  <div className="bg-primary/10 p-3 border-b border-primary/10 flex items-center">
                    <Store className="h-4 w-4 text-primary mr-2" />
                    <h4 className="font-medium text-sm">{t('confirmation_delivery_pickup')}</h4>
                  </div>
                  <div className="p-3">
                    <p className="text-xs mb-3">
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
                  </div>
                </div>
              )}

              {/* Cash delivery info - mobile optimized */}
              {currentPaymentMethod === 'cash' && (
                <div className="mb-4 bg-primary/5 rounded-lg border border-primary/20 overflow-hidden">
                  <div className="bg-primary/10 p-3 border-b border-primary/10 flex items-center">
                    <Truck className="h-4 w-4 text-primary mr-2" />
                    <h4 className="font-medium text-sm">{t('confirmation_delivery_address')}</h4>
                  </div>
                  <div className="p-3">
                    <p className="text-xs mb-3">
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
                  </div>
                </div>
              )}

              {/* Email notification - more compact for mobile */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4 flex items-start gap-2 border border-gray-200">
                <Mail className="h-4 w-4 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-700">
                  <p className="font-medium mb-1">
                    {t('confirmation_email_notification')}
                  </p>
                  <p>
                    Un email cu detaliile {t('confirmation_order_registered')} a fost trimis la adresa <strong>{orderDetails.customer.email}</strong>.
                  </p>
                </div>
              </div>

              {/* Actions - mobile optimized */}
              <div className="flex flex-col gap-3 pb-1">
                <Button asChild className="bg-black hover:bg-gray-800 text-white w-full h-12 rounded-lg">
                  <Link href="/catalog" className="flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {t('confirmation_continue_shopping')}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full h-10 rounded-lg">
                  <Link href="/" className="flex items-center justify-center">
                    <Home className="h-4 w-4 mr-2" />
                    {t('confirmation_back_to_home')}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Simplified fallback view when orderDetails is not available */
            <div className="p-4">
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 mb-4">
                <h3 className="text-base font-medium mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  {t('confirmation_order_registered_title')}
                </h3>

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

                <Separator className="my-3" />

                <div className="flex items-start gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    {t('confirmation_email_notification')}
                  </p>
                </div>
              </div>

              {/* Payment method specific simplified cards */}
              {currentPaymentMethod === 'credit' && (
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/20">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-4 w-4 text-primary mr-2" />
                    <h4 className="text-sm font-medium">{t('confirmation_about_credit')}</h4>
                  </div>
                  <p className="text-xs mb-2">
                    {t('confirmation_credit_contact')}
                  </p>
                  <Button variant="link" asChild className="text-xs text-primary h-auto p-0">
                    <Link href="/credit" className="flex items-center">
                      <span>{t('confirmation_credit_info')}</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}

              {currentPaymentMethod === 'pickup' && (
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/20">
                  <div className="flex items-center mb-2">
                    <Store className="h-4 w-4 text-primary mr-2" />
                    <h4 className="text-sm font-medium">{t('confirmation_delivery_pickup')}</h4>
                  </div>
                  <p className="text-xs mb-2">
                    {t('confirmation_order_registered')}
                    {t('confirmation_notification')}
                  </p>
                  <p className="text-xs bg-white p-2 rounded border border-gray-200">
                    {t('checkout_store_address').split(': ')[1]}
                  </p>
                </div>
              )}

              {currentPaymentMethod === 'cash' && (
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/20">
                  <div className="flex items-center mb-2">
                    <Truck className="h-4 w-4 text-primary mr-2" />
                    <h4 className="text-sm font-medium">{t('confirmation_delivery_address')}</h4>
                  </div>
                  <p className="text-xs">
                    {t('confirmation_delivery_info')}
                  </p>
                </div>
              )}

              {/* Actions - simplified */}
              <div className="flex flex-col gap-3 pb-1">
                <Button asChild className="bg-black hover:bg-gray-800 text-white w-full h-12 rounded-lg">
                  <Link href="/catalog" className="flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {t('confirmation_continue_shopping')}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full h-10 rounded-lg">
                  <Link href="/" className="flex items-center justify-center">
                    <Home className="h-4 w-4 mr-2" />
                    {t('confirmation_back_to_home')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{t('checkout_title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('checkout_instructions')}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Checkout form - Left side */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmitOrder}>
              {/* Personal information */}
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold">{t('checkout_personal_info')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName" className="mb-1.5 block">
                      {t('checkout_first_name')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={cn(formErrors.firstName && "border-red-300")}
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="mb-1.5 block">
                      {t('checkout_last_name')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={cn(formErrors.lastName && "border-red-300")}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-1.5 block">
                      {t('checkout_email')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(formErrors.email && "border-red-300")}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="mb-1.5 block">
                      {t('checkout_phone')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={cn(formErrors.phone && "border-red-300")}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping information */}
              {paymentMethod === "cash" ? (
                <div className="mb-6">
                  <h2 className="mb-4 text-lg font-semibold">{t('checkout_delivery_address')}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="mb-1.5 block">
                        {t('checkout_address')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={cn(formErrors.address && "border-red-300")}
                      />
                      {formErrors.address && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city" className="mb-1.5 block">
                        {t('checkout_city')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={cn(formErrors.city && "border-red-300")}
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h2 className="mb-4 text-lg font-semibold">
                    {paymentMethod === "pickup" ? t('checkout_pickup') : t('checkout_credit')}
                  </h2>
                  <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      {paymentMethod === "pickup" ? (
                        <Store className="h-5 w-5 mr-2 text-primary" />
                      ) : (
                        <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      )}
                      <p className="font-medium">
                        {paymentMethod === "pickup" ? t('checkout_pickup_info') : t('checkout_credit_info')}
                      </p>
                    </div>
                    {paymentMethod === "pickup" ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {t('checkout_pickup_address')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('checkout_pickup_hours')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t('checkout_credit_info')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold">{t('checkout_payment_method')}</h2>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {/* Pickup option */}
                  <div className={cn(
                    "flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50",
                    paymentMethod === "pickup" && "border-primary bg-primary/5"
                  )}>
                    <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                    <Label
                      htmlFor="pickup"
                      className="flex flex-1 cursor-pointer items-center"
                    >
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{t('checkout_pickup')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('checkout_pickup_description')}
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* Cash on delivery option */}
                  <div className={cn(
                    "flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50",
                    paymentMethod === "cash" && "border-primary bg-primary/5"
                  )}>
                    <RadioGroupItem value="cash" id="cash" className="sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-1 cursor-pointer items-center"
                    >
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{t('checkout_cash')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('checkout_cash_description')}
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* Credit option - Improved for mobile */}
                  <div className={cn(
                    "flex items-start rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50",
                    paymentMethod === "credit" && "border-primary border-2 bg-primary/5 shadow-sm"
                  )}>
                    <RadioGroupItem value="credit" id="credit" className="sr-only" />
                    <Label
                      htmlFor="credit"
                      className="flex flex-1 cursor-pointer items-start"
                    >
                      <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <p className="font-medium">{t('checkout_credit')}</p>
                          <Badge variant="outline" className="bg-primary/5 text-xs border-primary/20 hidden sm:inline-flex">
                            <BadgePercent className="h-3 w-3 mr-1" />
                            <span>{t('checkout_credit_info')}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('checkout_credit_contact')}
                        </p>

                        {/* Show credit info when credit is selected */}
                        {paymentMethod === "credit" && (
                          <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                            {/* Only show credit terms selector if no credit option was selected in cart */}
                            {!items.some(item => item.product.creditOption) && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-xs font-medium">{t('checkout_select_period')}</Label>
                                  <span className="text-xs text-muted-foreground md:hidden">← Swipe →</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-2 pb-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                  {[4, 6, 8, 12, 24, 36].map((term) => (
                                    <Button
                                      key={term}
                                      type="button"
                                      onClick={() => setFinancingTerm(term)}
                                      variant={financingTerm === term ? "default" : "outline"}
                                      className={`rounded-full h-8 px-2 sm:px-3 py-1 w-full md:w-auto touch-manipulation ${
                                        financingTerm === term ? "border-2 shadow-sm" : ""
                                      }`}
                                      size="sm"
                                    >
                                      {t('checkout_term_months').replace('{term}', term.toString())}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center text-xs gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span><strong>{t('checkout_period')}:</strong> {t('checkout_term_months').replace('{term}', financingTerm.toString())}</span>
                            </div>
                            <div className="flex items-center text-xs gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-primary" />
                              <span><strong>{t('checkout_monthly_rate')}:</strong> {formatCurrency(calculateMonthlyPayment(totalPrice, financingTerm))}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {t('checkout_credit_description')}
                            </p>
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional notes */}
              <div className="mb-6">
                <Label htmlFor="notes" className="mb-1.5 block">
                  {t('checkout_notes')}
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder={t('checkout_notes_placeholder')}
                  className="min-h-[80px]"
                />
              </div>

              {/* Mobile order summary */}
              <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('checkout_total_order')}</h3>
                    <p className="text-muted-foreground">{totalItems} {t('checkout_products')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{totalPrice.toLocaleString()} MDL</p>
                    <Link href="/cart" className="text-sm text-primary hover:underline">
                      {t('checkout_view_details')}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="outline" type="button">
                  <Link href="/cart">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('checkout_back_to_cart')}
                  </Link>
                </Button>

                <Button
                  type="submit"
                  className="ml-auto flex-1 sm:flex-none sm:min-w-[200px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      {t('checkout_processing')}
                    </div>
                  ) : (
                    t('checkout_complete')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Order summary - Right side */}
        <div className="mt-8 lg:col-span-5 lg:mt-0">
          <div className="sticky top-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">{t('checkout_order_summary')}</h2>

              {/* Products summary */}
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-accent/50">
                      {item.product.imagini[0] ? (
                        <Image
                          src={item.product.imagini[0]}
                          alt={item.product.nume}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.product.nume}</h4>
                      <p className="text-xs text-muted-foreground">{t('checkout_quantity')}: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">
                        {((item.product.pretRedus || item.product.pret) * item.quantity).toLocaleString()} MDL
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout_subtotal')}</span>
                  <span>{totalPrice.toLocaleString()} MDL</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout_shipping')}</span>
                  <span>{t('cart_free')}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>{t('checkout_total')}</span>
                  <span>{totalPrice.toLocaleString()} MDL</span>
                </div>

                {/* Credit payment info */}
                {paymentMethod === "credit" && (
                  <div className="mt-3 pt-3 border-t border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{t('checkout_credit_info')}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{t('checkout_period')}:</span>
                      <span className="text-sm font-medium">{t('checkout_term_months').replace('{term}', financingTerm.toString())}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{t('checkout_monthly_rate')}:</span>
                      <span className="text-sm font-medium text-primary">{formatCurrency(calculateMonthlyPayment(totalPrice, financingTerm))}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 py-1 px-2 bg-primary/5 rounded">
                      {t('checkout_credit_contact')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t bg-gray-50 p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Truck className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('checkout_free_shipping')}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('checkout_quality_guarantee')}</span>
                </div>
                {paymentMethod === "credit" && (
                  <div className="flex items-start gap-2 text-sm">
                    <CreditCard className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                    <span>{t('checkout_credit_info')}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('checkout_contact_info')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
