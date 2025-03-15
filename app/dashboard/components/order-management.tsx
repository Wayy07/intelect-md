"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Loader2,
  MoreHorizontal,
  Package,
  RefreshCcw,
  Search,
  Trash,
  XCircle,
  CreditCard,
  Banknote,
  Calendar,
  CalendarDays,
  CalendarIcon,
  Eye
} from "lucide-react"
import { formatDistanceToNow, format, startOfDay, startOfMonth, startOfYear, endOfDay, isToday, subMonths } from "date-fns"
import { ro } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderDetails } from "./order-details"
import { useToast } from "@/app/components/ui/use-toast"

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

interface Pagination {
  page: number
  pageSize: number
  totalOrders: number
  totalPages: number
}

interface ApiResponse {
  orders: Order[]
  pagination: Pagination
  filters: {
    statuses: string[]
    paymentMethods: string[]
  }
}

// Time range options with nicer labels and descriptions
const TIME_RANGES = [
  {
    value: "ALL",
    label: "Toate comenzile",
    description: "Afișează toate comenzile din toate perioadele",
    icon: <Filter className="h-4 w-4 mr-2" />
  },
  {
    value: "TODAY",
    label: "Comenzi azi",
    description: "Afișează doar comenzile plasate astăzi",
    icon: <Clock className="h-4 w-4 mr-2" />
  },
  {
    value: "YESTERDAY",
    label: "Comenzi ieri",
    description: "Afișează doar comenzile plasate ieri",
    icon: <Clock className="h-4 w-4 mr-2" />
  },
  {
    value: "WEEK",
    label: "Săptămâna curentă",
    description: "Afișează comenzile din săptămâna curentă",
    icon: <CalendarDays className="h-4 w-4 mr-2" />
  },
  {
    value: "MONTH",
    label: "Luna curentă",
    description: "Afișează comenzile din luna curentă",
    icon: <CalendarDays className="h-4 w-4 mr-2" />
  },
  {
    value: "LAST_MONTH",
    label: "Luna trecută",
    description: "Afișează comenzile din luna precedentă",
    icon: <CalendarDays className="h-4 w-4 mr-2" />
  },
  {
    value: "YEAR",
    label: "Anul curent",
    description: "Afișează comenzile din anul curent",
    icon: <Calendar className="h-4 w-4 mr-2" />
  }
];

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    totalOrders: 0,
    totalPages: 0
  })
  const [orderStatuses, setOrderStatuses] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Filter and sort states
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("ALL")
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("ALL")
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  const { toast } = useToast()

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

  // Get translated payment method
  const getTranslatedPaymentMethod = (method: string) => {
    // Convert to uppercase for consistency in lookup
    const lookupKey = method.toUpperCase();
    return PAYMENT_METHOD_TRANSLATIONS[lookupKey as keyof typeof PAYMENT_METHOD_TRANSLATIONS] ||
           PAYMENT_METHOD_TRANSLATIONS[method as keyof typeof PAYMENT_METHOD_TRANSLATIONS] ||
           method;
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

  // Fetch orders with current filters and pagination
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortField,
        sortOrder,
      });

      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      if (paymentMethodFilter !== "ALL") {
        params.append("paymentMethod", paymentMethodFilter);
      }

      if (search) {
        params.append("search", search);
      }

      // Add date range filters
      if (timeRangeFilter !== "ALL") {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = endOfDay(now);

        switch (timeRangeFilter) {
          case "TODAY":
            startDate = startOfDay(now);
            break;
          case "YESTERDAY": {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate = startOfDay(yesterday);
            endDate = endOfDay(yesterday);
            break;
          }
          case "WEEK": {
            const currentDay = now.getDay() || 7; // Get current day (0-6, Sunday is 0)
            const diff = currentDay - 1; // Difference to Monday (1)
            startDate = startOfDay(new Date(now.setDate(now.getDate() - diff)));
            break;
          }
          case "MONTH":
            startDate = startOfMonth(now);
            break;
          case "LAST_MONTH": {
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate = new Date(firstDayOfMonth);
            startDate.setMonth(startDate.getMonth() - 1);
            endDate = new Date(firstDayOfMonth);
            endDate.setDate(endDate.getDate() - 1);
            endDate = endOfDay(endDate);
            break;
          }
          case "YEAR":
            startDate = startOfYear(now);
            break;
          default:
            startDate = new Date(0); // Default to all time
        }

        // Send dates as formatted strings in ISO format
        params.append("startDate", startDate.toISOString());
        params.append("endDate", endDate.toISOString());

        // Debug info to help track any issues with date filtering
        console.log(`Filtering by date range: ${timeRangeFilter}`);
        console.log(`Start date: ${startDate.toISOString()}`);
        console.log(`End date: ${endDate.toISOString()}`);
      }

      const response = await fetch(`/api/dashboard/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: ApiResponse = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
      setOrderStatuses(data.filters.statuses);
      setPaymentMethods(data.filters.paymentMethods || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const order: Order = await response.json();
      setSelectedOrder(order);
      setShowOrderDetails(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update the orders list with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );

      // Log action in audit log
      await fetch(`/api/audit-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "ORDER_STATUS_UPDATED",
          entity: "ORDER",
          entityId: orderId,
          metadata: {
            status: newStatus,
            previousStatus: orders.find(order => order.id === orderId)?.status
          }
        }),
      });

      toast({
        title: "Status actualizat",
        description: "Statusul comenzii a fost actualizat cu succes.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la actualizarea statusului comenzii.",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Load orders on initial load and when filters/pagination change
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.pageSize, sortField, sortOrder, statusFilter, paymentMethodFilter, timeRangeFilter]);

  // Handle search (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination({...pagination, page: 1}); // Reset to first page on search
      } else {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination({...pagination, page: newPage});
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination({...pagination, page: 1}); // Reset to first page on filter change
  };

  const handlePaymentMethodFilterChange = (value: string) => {
    setPaymentMethodFilter(value);
    setPagination({...pagination, page: 1}); // Reset to first page on filter change
  };

  const handleTimeRangeFilterChange = (value: string) => {
    setTimeRangeFilter(value);
    setPagination({...pagination, page: 1}); // Reset to first page on filter change
  };

  // Handle sort toggle
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get sort indicator
  const getSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Eroare</CardTitle>
          <CardDescription>A apărut o eroare la încărcarea comenzilor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchOrders}>Încearcă din nou</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestionare Comenzi</h2>
          <p className="text-muted-foreground">
            Administrează comenzile și actualizează statusul acestora
          </p>
        </div>
        <Button onClick={fetchOrders} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          Reîmprospătează
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col gap-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după număr comandă, nume client sau email"
            className="pl-8"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrează după status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toate statusurile</SelectItem>
              {orderStatuses.map(status => (
                <SelectItem key={status} value={status}>{getTranslatedStatus(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentMethodFilter} onValueChange={handlePaymentMethodFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrează după plată" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toate metodele</SelectItem>
              {paymentMethods.map(method => (
                <SelectItem key={method} value={method}>{getTranslatedPaymentMethod(method)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Enhanced time range filter */}
          <Select value={timeRangeFilter} onValueChange={handleTimeRangeFilterChange}>
            <SelectTrigger className="flex items-center bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
              <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
              <SelectValue placeholder="Filtrează după perioadă" className="text-blue-700" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {TIME_RANGES.map((timeRange) => (
                <SelectItem key={timeRange.value} value={timeRange.value} className={timeRange.value === timeRangeFilter ? "bg-blue-50" : ""}>
                  <div className="flex items-center">
                    {timeRange.icon}
                    <div>
                      <p className="font-medium">{timeRange.label}</p>
                      <p className="text-xs text-muted-foreground">{timeRange.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Credit orders highlight */}
      {paymentMethodFilter === "CREDIT" && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-medium text-purple-700">Comenzi cu credit</h3>
          </div>
          <p className="text-sm text-purple-600 mt-1">
            Vizualizați toate comenzile plătite prin credit. Aceste comenzi necesită o monitorizare specială a plăților.
          </p>
        </div>
      )}

      {/* Enhanced time filter indicator with prettier UI */}
      {timeRangeFilter !== "ALL" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            {TIME_RANGES.find(tr => tr.value === timeRangeFilter)?.icon}
            <h3 className="font-medium text-blue-700">
              {TIME_RANGES.find(tr => tr.value === timeRangeFilter)?.label}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              onClick={() => {
                setTimeRangeFilter("ALL");
                setPagination({...pagination, page: 1});
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Resetează
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            {TIME_RANGES.find(tr => tr.value === timeRangeFilter)?.description}
          </p>
        </div>
      )}

      {/* Orders table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button
                  className="font-medium flex items-center"
                  onClick={() => handleSortChange("orderNumber")}
                >
                  Nr. comandă{getSortIndicator("orderNumber")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="font-medium flex items-center"
                  onClick={() => handleSortChange("customer.firstName")}
                >
                  Client{getSortIndicator("customer.firstName")}
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plată</TableHead>
              <TableHead>
                <button
                  className="font-medium flex items-center"
                  onClick={() => handleSortChange("total")}
                >
                  Total{getSortIndicator("total")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="font-medium flex items-center"
                  onClick={() => handleSortChange("createdAt")}
                >
                  Data{getSortIndicator("createdAt")}
                </button>
              </TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nu au fost găsite comenzi.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className={order.paymentMethod.toUpperCase() === "CREDIT" ? "bg-purple-50" : ""}>
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="p-0 h-auto leading-none underline"
                      onClick={() => fetchOrderDetails(order.id)}
                    >
                      {order.orderNumber}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {getTranslatedStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={getPaymentMethodColor(order.paymentMethod)}>
                      {getTranslatedPaymentMethod(order.paymentMethod)}
                    </Badge>

                      {/* Add months indicator for credit payment */}
                      {order.paymentMethod.toUpperCase() === 'CREDIT' && order.financingTerm && (
                        <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          {order.financingTerm} luni
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{format(new Date(order.createdAt), 'dd/MM/yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ro })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Meniu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acțiuni</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => fetchOrderDetails(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Vizualizează</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "COMPLETED")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Marchează finalizată
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "PROCESSING")}>
                          <Clock className="mr-2 h-4 w-4" /> Marchează în procesare
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "CANCELLED")}>
                          <XCircle className="mr-2 h-4 w-4" /> Anulează comanda
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Afișare {orders.length} din {pagination.totalOrders} comenzi
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterioara
            </Button>
            <div className="text-sm">
              Pagina {pagination.page} din {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Următoarea
            </Button>
          </div>
        </div>
      )}

      {/* Order details dialog - using the new component */}
      <OrderDetails
        selectedOrder={selectedOrder}
        showOrderDetails={showOrderDetails}
        setShowOrderDetails={setShowOrderDetails}
        updateOrderStatus={updateOrderStatus}
        statusUpdating={statusUpdating}
      />
    </div>
  )
}
