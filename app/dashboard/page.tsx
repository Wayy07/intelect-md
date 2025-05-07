"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import {
  formatDistanceToNow,
  format,
  isSameDay,
  subDays,
  subMonths,
} from "date-fns";
import { ro } from "date-fns/locale";
import { OrderManagement } from "./components/order-management";
import { CustomerManagement } from "./components/customer-management";
import { BannerManagement } from "./components/banner-management";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange as DayPickerDateRange } from "react-day-picker";

// Types for dashboard data
interface DashboardData {
  userStats: {
    total: number;
    newUsers: number;
  };
  orderStats: {
    total: number;
    pending: number;
    completed: number;
  };
  financialStats: {
    totalRevenue: number;
    monthlyRevenue: number;
  };
  recentOrders: any[];
  chartData: {
    salesTrend: {
      date: string;
      amount: number;
    }[];
    orderStatusDistribution: {
      name: string;
      value: number;
    }[];
  };
}

// Use the DayPickerDateRange type directly
type DateRange = DayPickerDateRange;

// Colors for chart elements
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Predefined date ranges
const DATE_RANGES = [
  { label: "Ultimele 7 zile", value: "7d" },
  { label: "Ultimele 30 zile", value: "30d" },
  { label: "Anul curent", value: "year" },
  { label: "Luna curentă", value: "month" },
];

// Status translations for Romanian
const STATUS_TRANSLATIONS: Record<string, string> = {
  PENDING: "În așteptare",
  PROCESSING: "În procesare",
  SHIPPED: "Expediat",
  DELIVERED: "Livrat",
  COMPLETED: "Finalizat",
  CANCELLED: "Anulat",
  RETURNED: "Returnat",
};

const STATUS_LABELS = {
  PLACED: "Plasată",
  PROCESSING: "În procesare",
  SHIPPED: "Expediată",
  DELIVERED: "Livrată",
  CANCELED: "Anulată",
  RETURNED: "Returnat",
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedRange, setSelectedRange] = useState<string>("30d");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Add a chart-specific loading state
  const [chartLoading, setChartLoading] = useState(false);

  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    const now = new Date();
    let from: Date | undefined = undefined;
    let to: Date | undefined = now;

    switch (preset) {
      case "7d":
        from = subDays(now, 7);
        break;
      case "30d":
        from = subDays(now, 30);
        break;
      case "year":
        from = subMonths(now, 12);
        break;
      case "month":
        from = subMonths(now, 1);
        break;
      case "custom":
        // Don't change the dates, just open the calendar
        setIsCalendarOpen(true);
        setSelectedRange(preset);
        return;
      default:
        from = subDays(now, 30);
    }

    setDateRange({ from, to });
    setSelectedRange(preset);

    // Don't close the calendar if it's open
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from) {
      return "Selectează o perioadă";
    }

    return `${format(dateRange.from, "dd MMM yyyy", { locale: ro })} - ${
      dateRange.to
        ? format(dateRange.to, "dd MMM yyyy", { locale: ro })
        : "Prezent"
    }`;
  };

  // Fetch dashboard data with date range
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!dateRange.from) return;

      try {
        // Only show full page loading on initial load
        if (!dashboardData) {
          setIsLoading(true);
        } else {
          // Use chart-specific loading for subsequent updates
          setChartLoading(true);
        }

        // Build query params with date range
        const params = new URLSearchParams();
        params.append("startDate", dateRange.from.toISOString().split("T")[0]);
        if (dateRange.to) {
          params.append("endDate", dateRange.to.toISOString().split("T")[0]);
        }

        const url = `/api/dashboard${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await fetch(url, {
          // Add cache: 'no-store' to prevent caching and ensure fresh data
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
        setChartLoading(false);
      }
    };

    // Only fetch data if the user is authenticated and is an admin
    if (
      status === "authenticated" &&
      session?.user?.role === "ADMIN" &&
      dateRange.from
    ) {
      // Add a small delay to prevent too many requests when selecting date ranges
      const timer = setTimeout(() => {
        fetchDashboardData();
      }, 200);

      return () => clearTimeout(timer);
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, session, dateRange]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ro-MD", {
      style: "currency",
      currency: "MDL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show loading state while session is being fetched
  if (isLoading || status === "loading") {
    return (
      <div className="container py-10">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated or doesn't have ADMIN role
  if (
    status === "unauthenticated" ||
    (session?.user && session.user.role !== "ADMIN")
  ) {
    return (
      <div className="container py-20">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Pagină indisponibilă</h2>
          <p className="text-muted-foreground mb-6">
            Pagina pe care încercați să o accesați nu există sau nu aveți
            permisiunile necesare.
          </p>
          <Button onClick={() => router.push("/")}>
            Înapoi la pagina principală
          </Button>
        </div>
      </div>
    );
  }

  // Display error message if data couldn't be loaded
  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Eroare</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Încearcă din nou
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated, has ADMIN role, and data is loaded
  return (
    <div className="container py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
          Panou de administrare
        </h1>

        {/* Tabs for different dashboard views */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4 flex flex-wrap md:flex-nowrap overflow-x-auto">
            <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
            <TabsTrigger value="orders">Comenzi</TabsTrigger>
            <TabsTrigger value="customers">Clienți</TabsTrigger>
            <TabsTrigger value="banners">Banere</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Date filter controls */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 bg-background rounded-lg p-4 shadow-sm border">
              <div className="font-medium flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                <span>Filtrare după dată:</span>
              </div>

              <div className="flex flex-1 flex-wrap gap-2">
                {DATE_RANGES.map((range: { label: string; value: string }) => (
                  <Button
                    key={range.value}
                    variant={
                      selectedRange === range.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePresetChange(range.value)}
                    className="h-8 text-xs rounded-full"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal h-9 min-w-[260px] text-sm border-dashed",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    {formatDateRange()}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  const now = new Date();
                  const from = dateRange.from
                    ? new Date(dateRange.from)
                    : subDays(now, 30);
                  const to = dateRange.to ? new Date(dateRange.to) : now;
                  setDateRange({ from, to });
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-medium">
                    Venituri totale
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData
                      ? formatCurrency(
                          dashboardData.financialStats.totalRevenue
                        )
                      : "0 MDL"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData &&
                    dashboardData.financialStats.totalRevenue > 0
                      ? `+${Math.round(
                          (dashboardData.financialStats.monthlyRevenue /
                            dashboardData.financialStats.totalRevenue) *
                            100
                        )}% față de luna trecută`
                      : "Nu există date pentru perioada selectată"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-medium">
                    Comenzi
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.orderStats.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.orderStats.pending || 0} comenzi în
                    așteptare
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-medium">
                    Clienți
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.userStats.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardData?.userStats.newUsers || 0} noi în ultima lună
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-medium">
                    Venituri luna curentă
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData
                      ? formatCurrency(
                          dashboardData.financialStats.monthlyRevenue
                        )
                      : "0 MDL"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.orderStats.completed || 0} comenzi
                    finalizate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Tendința vânzărilor</CardTitle>
                    <CardDescription>
                      {dateRange.from && dateRange.to
                        ? `Vânzări între ${format(
                            dateRange.from,
                            "dd MMM yyyy",
                            { locale: ro }
                          )} și ${format(dateRange.to, "dd MMM yyyy", {
                            locale: ro,
                          })}`
                        : "Vânzări în perioada selectată"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full relative">
                    {chartLoading && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[2px] transition-opacity duration-300">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-primary/80" />
                        </div>
                      </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dashboardData?.chartData.salesTrend || []}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(str) => {
                            try {
                              const date = new Date(str);
                              return date.toLocaleDateString("ro-MD", {
                                month: "short",
                                day: "2-digit",
                              });
                            } catch (e) {
                              return str;
                            }
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => {
                            try {
                              // In recharts, the value here is the actual dataKey value (the date string)
                              return `Vânzări: ${format(
                                new Date(value),
                                "dd MMM yyyy",
                                { locale: ro }
                              )}`;
                            } catch (error) {
                              return `Vânzări: ${value}`;
                            }
                          }}
                          formatter={(value) => [
                            `${formatCurrency(Number(value))}`,
                            "Sumă",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#8884D8"
                          fill="#8884D8"
                          strokeWidth={2}
                          fillOpacity={0.8}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Distribution Chart */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Distribuția comenzilor</CardTitle>
                    <CardDescription>
                      Vânzări în funcție de starea comenzii
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full relative">
                    {chartLoading && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[2px] transition-opacity duration-300">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-primary/80" />
                        </div>
                      </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {dashboardData &&
                        dashboardData.chartData &&
                        dashboardData.chartData.orderStatusDistribution &&
                        dashboardData.chartData.orderStatusDistribution.length >
                          0 ? (
                          <Pie
                            data={
                              dashboardData.chartData.orderStatusDistribution
                            }
                            cx="50%"
                            cy="45%"
                            labelLine={true}
                            outerRadius={140}
                            fill="#8884D8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${STATUS_TRANSLATIONS[name] || name}: ${(
                                percent * 100
                              ).toFixed(0)}%`
                            }
                            paddingAngle={2}
                          >
                            {dashboardData.chartData.orderStatusDistribution.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  stroke="#fff"
                                  strokeWidth={1}
                                />
                              )
                            )}
                          </Pie>
                        ) : (
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#888"
                          >
                            Nu există date pentru perioada selectată
                          </text>
                        )}

                        {dashboardData &&
                          dashboardData.chartData &&
                          dashboardData.chartData.orderStatusDistribution &&
                          dashboardData.chartData.orderStatusDistribution
                            .length > 0 && (
                            <>
                              <Tooltip
                                formatter={(value) => [
                                  `${value} comenzi`,
                                  "Cantitate",
                                ]}
                                labelFormatter={(name) =>
                                  STATUS_TRANSLATIONS[name] || name
                                }
                                contentStyle={{
                                  backgroundColor: "white",
                                  borderRadius: "8px",
                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                  border: "none",
                                }}
                              />
                              <Legend
                                formatter={(value) =>
                                  STATUS_TRANSLATIONS[value] || value
                                }
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ paddingTop: "20px" }}
                              />
                            </>
                          )}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab Content */}
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          {/* Customers Tab Content */}
          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          {/* Banners Tab Content */}
          <TabsContent value="banners">
            <BannerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
