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
  Mail
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
  };
  paymentMethod: string;
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

  // Add this useEffect at the top level, outside of any conditionals
  useEffect(() => {
    // Only execute this logic when orderCompleted is true
    if (orderCompleted) {
      const storedOrderNumber = sessionStorage.getItem('lastOrderNumber')
      setOrderNumber(storedOrderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`)
    }
  }, [orderCompleted]) // Add orderCompleted as a dependency

  // Redirect to cart if cart is empty
  if (items.length === 0 && !orderCompleted) {
    return (
      <div className="container max-w-7xl py-10">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-muted-foreground">
            <ShoppingCart className="h-12 w-12" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Coșul tău este gol</h2>
          <p className="mb-8 max-w-md text-center text-muted-foreground">
            Nu poți finaliza comanda fără produse în coș. Te rugăm să adaugi produse înainte de a continua.
          </p>
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/catalog">
              Explorează catalogul
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
    if (!formData.firstName) errors.firstName = "Prenumele este obligatoriu"
    if (!formData.lastName) errors.lastName = "Numele este obligatoriu"
    if (!formData.email) errors.email = "Email-ul este obligatoriu"
    if (!formData.phone) errors.phone = "Telefonul este obligatoriu"

    // Only validate address fields if not pickup
    if (paymentMethod !== "pickup") {
      if (!formData.address) errors.address = "Adresa este obligatorie"
      if (!formData.city) errors.city = "Orașul este obligatoriu"
    }

    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Adresa de email nu este validă"
    }

    // Phone validation
    if (formData.phone && !/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      errors.phone = "Numărul de telefon nu este valid"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' MDL'
  }

  // Handle order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Formular incomplet",
        description: "Te rugăm să completezi toate câmpurile obligatorii",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // For pickup orders, set a placeholder for the address
      const customerData = { ...formData };
      if (paymentMethod === "pickup") {
        customerData.address = "Ridicare din magazin";
        customerData.city = "Chișinău";
        if (!customerData.postalCode) customerData.postalCode = "";
      }

      // Send order data to backend
      const response = await fetch('/api/orders-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData,
          items: items,
          total: totalPrice,
          paymentMethod
        })
      })

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error('Răspunsul de la server nu este valid. Vă rugăm încercați din nou.');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Eroare la procesarea comenzii')
      }

      // Store complete order details for the confirmation page
      setOrderDetails(data.order)

      // Show success state
      setOrderCompleted(true)
      clearCart()

      // Store order number for confirmation page
      const orderNumber = data.order?.orderNumber || ('ORD-' + Math.floor(100000 + Math.random() * 900000))
      sessionStorage.setItem('lastOrderNumber', orderNumber)

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })

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

  // Order completed view
  if (orderCompleted) {
    return (
      <div className="container max-w-3xl py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-gray-200 bg-gray-50 p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">Comanda a fost plasată cu succes!</h1>

            <p className="mb-6 text-gray-600">
              Îți mulțumim pentru comandă. Vei primi în curând un email de confirmare cu detaliile comenzii.
            </p>
          </div>

          {orderDetails ? (
            <div className="space-y-6">
              {/* Order summary card */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Detalii comandă</h2>
                  <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium">
                    {orderDetails.orderNumber}
                  </span>
                </div>

                <div className="grid gap-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{orderDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metoda de plată:</span>
                    <span className="font-medium">{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="mb-6">
                  <h3 className="font-medium mb-3">Detalii livrare</h3>
                  <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-100">
                    <p className="font-medium">{orderDetails.customer.name}</p>
                    <p>{orderDetails.customer.address}</p>
                    <p>Tel: {orderDetails.customer.phone}</p>
                    <p>Email: {orderDetails.customer.email}</p>
                  </div>
                </div>

                {/* Order items */}
                <div>
                  <h3 className="font-medium mb-3">Produse comandate</h3>
                  <div className="space-y-3 max-h-60 overflow-auto pr-2">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                            <span>{item.quantity} x {formatCurrency(item.price)}</span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="font-medium">Total comandă:</span>
                    <span className="font-bold text-lg">{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>
              </div>

              {/* Email sent notification */}
              <div className="bg-gray-100 rounded-md p-4 flex items-start gap-3 border border-gray-200">
                <Mail className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Un email de confirmare a fost trimis la adresa <strong>{orderDetails.customer.email}</strong>.
                  Verifică și folderul de spam dacă nu găsești emailul în inbox.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-4">
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Înapoi la pagina principală
                  </Link>
                </Button>

                <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white">
                  <Link href="/catalog">
                    Continuă cumpărăturile
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 text-left shadow-sm border border-gray-100">
              <h3 className="mb-2 font-medium">Detalii comandă:</h3>
              <p className="text-sm text-gray-600">Număr comandă: <span className="font-medium text-gray-900">{orderNumber}</span></p>
              <p className="text-sm text-gray-600">Total: <span className="font-medium text-gray-900">{totalPrice.toLocaleString()} MDL</span></p>
              <p className="text-sm text-gray-600">Metoda de plată: <span className="font-medium text-gray-900">{paymentMethod === 'pickup' ? 'Ridicare din magazin' : 'Numerar la livrare'}</span></p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mt-6">
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Înapoi la pagina principală
                  </Link>
                </Button>

                <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white">
                  <Link href="/catalog">
                    Continuă cumpărăturile
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
        <h1 className="text-2xl font-bold md:text-3xl">Finalizare comandă</h1>
        <p className="mt-2 text-muted-foreground">
          Completează datele de mai jos pentru a finaliza comanda
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Checkout form - Left side */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmitOrder}>
              {/* Personal information */}
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold">Informații personale</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName" className="mb-1.5 block">
                      Prenume <span className="text-red-500">*</span>
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
                      Nume <span className="text-red-500">*</span>
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
                      Email <span className="text-red-500">*</span>
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
                      Telefon <span className="text-red-500">*</span>
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
              {paymentMethod !== "pickup" ? (
                <div className="mb-6">
                  <h2 className="mb-4 text-lg font-semibold">Adresa de livrare</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="mb-1.5 block">
                        Adresa <span className="text-red-500">*</span>
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
                        Orașul <span className="text-red-500">*</span>
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

                    <div>
                      <Label htmlFor="postalCode" className="mb-1.5 block">
                        Cod poștal
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h2 className="mb-4 text-lg font-semibold">Ridicare din magazin</h2>
                  <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      <Store className="h-5 w-5 mr-2 text-primary" />
                      <p className="font-medium">Intelect Store</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adresa: Str. Ștefan cel Mare 1, Chișinău, Moldova
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Program: Luni-Vineri 9:00-18:00, Sâmbătă 10:00-16:00
                    </p>
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold">Metodă de plată</h2>
                <RadioGroup
                  defaultValue="pickup"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div className={cn(
                    "flex items-center rounded-lg border border-gray-200 p-4 transition-colors",
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
                        <p className="font-medium">Ridicare din magazin</p>
                        <p className="text-sm text-muted-foreground">
                          Ridică comanda direct din magazinul nostru
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center rounded-lg border border-gray-200 p-4 transition-colors",
                    paymentMethod === "cash" && "border-primary bg-primary/5"
                  )}>
                    <RadioGroupItem value="cash" id="cash" className="sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-1 cursor-pointer items-center"
                    >
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Plata la livrare</p>
                        <p className="text-sm text-muted-foreground">
                          Plătești când primești comanda
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional notes */}
              <div className="mb-6">
                <Label htmlFor="notes" className="mb-1.5 block">
                  Note / Comentarii (opțional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                />
              </div>

              {/* Mobile order summary */}
              <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Total comandă</h3>
                    <p className="text-muted-foreground">{totalItems} produse</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{totalPrice.toLocaleString()} MDL</p>
                    <Link href="/cart" className="text-sm text-primary hover:underline">
                      Vezi detalii
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="outline" type="button">
                  <Link href="/cart">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Înapoi la coș
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
                      Procesare comandă...
                    </div>
                  ) : (
                    "Finalizează comanda"
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
              <h2 className="mb-4 text-lg font-semibold">Sumarul comenzii</h2>

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
                      <p className="text-xs text-muted-foreground">Cantitate: {item.quantity}</p>
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{totalPrice.toLocaleString()} MDL</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livrare</span>
                  <span>Gratuită</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString()} MDL</span>
                </div>
              </div>
            </div>

            <div className="border-t bg-gray-50 p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Truck className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                  <span>Livrare gratuită pentru toate comenzile</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                  <span>Garanție de calitate pentru toate produsele</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                  <span>Dacă ai întrebări sau nelămuriri, contactează-ne la <Link href="tel:+37378123456" className="font-medium text-primary hover:underline">+373 78 123 456</Link></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
