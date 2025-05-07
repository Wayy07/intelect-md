"use client"

import { useState, useEffect } from "react"
import { format, parseISO, subDays } from "date-fns"
import { ro } from "date-fns/locale"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  Activity,
  Filter,
  RefreshCw,
  Search,
  UserCheck,
  CalendarClock,
  DollarSign,
  ShoppingBag,
  ChevronDown,
  AlertCircle
} from "lucide-react"

// Colors for chart elements
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function CustomerManagement() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [error, setError] = useState<string | null>(null);

  // Fetch data function - updated to use real API
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get API endpoint with date range if needed
      const response = await fetch('/api/dashboard/users');

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Nu s-au putut încărca datele utilizatorilor. Încercați din nou mai târziu.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort users
  const filteredUsers = data?.users
    ? data.users
      .filter((user: any) => {
        const matchesSearch =
          (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          user.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        } else if (sortBy === 'orderCount') {
          return b.orderCount - a.orderCount;
        } else if (sortBy === 'totalSpent') {
          return b.totalSpent - a.totalSpent;
        }
        return 0;
      })
    : [];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ro-MD', {
      style: 'currency',
      currency: 'MDL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-semibold">Eroare la încărcarea datelor</h3>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Încearcă din nou
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Total utilizatori</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{data?.newUsersLastMonth || 0} noi în ultima lună
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Utilizatori activi</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.totalUsers > 0
                ? Math.round((data?.activeUsers / data?.totalUsers) * 100)
                : 0}% din total utilizatori
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              *Utilizatori cu email verificat sau rol de admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Activitate recentă</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.activityData && data.activityData.length > 0
                ? data.activityData[0].activeUsers
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              utilizatori activi astăzi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
          <TabsTrigger value="activity">Activitate</TabsTrigger>
          <TabsTrigger value="analytics">Analiză detaliată</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">


          {/* User distribution charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuția după rol</CardTitle>
                <CardDescription>
                  Utilizatori grupați după rolul lor în sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.roleStats || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {data?.roleStats?.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} utilizatori`, 'Număr']}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          border: 'none'
                        }}
                      />
                      <Legend formatter={(value) => value} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuția după status</CardTitle>
                <CardDescription>
                  Utilizatori grupați după statusul lor actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.statusStats || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name === 'ACTIVE' ? 'Activ' : 'Inactiv'}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {data?.statusStats?.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name === 'ACTIVE' ? '#00C49F' : '#FF8042'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} utilizatori`, 'Număr']}
                        labelFormatter={(name) => name === 'ACTIVE' ? 'Activ' : 'Inactiv'}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          border: 'none'
                        }}
                      />
                      <Legend
                        formatter={(value) => value === 'ACTIVE' ? 'Activ' : 'Inactiv'}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activitatea zilnică a utilizatorilor</CardTitle>
              <CardDescription>
                Utilizatori activi și noi înregistrați în ultimele 7 zile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.activityData
                      ?.map((item: any) => ({
                        ...item,
                        date: format(new Date(item.date), 'dd MMM', { locale: ro })
                      }))
                      ?.slice()
                      ?.reverse() || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const label = name === 'activeUsers' ? 'Utilizatori activi' : 'Utilizatori noi';
                        return [`${value} utilizatori`, label];
                      }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        border: 'none'
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        if (value === 'activeUsers') return 'Utilizatori activi';
                        if (value === 'newUsers') return 'Utilizatori noi';
                        return value;
                      }}
                    />
                    <Bar
                      dataKey="activeUsers"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="newUsers"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Indicatori-cheie de performanță</CardTitle>
              <CardDescription>
                Metrici importante legate de utilizatori
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg border">
                <UserPlus className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-muted-foreground text-sm">Rata de conversie</span>
                <span className="text-xl font-bold">24.8%</span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg border">
                <CalendarClock className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-muted-foreground text-sm">Retenție 30 zile</span>
                <span className="text-xl font-bold">68.2%</span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg border">
                <ShoppingBag className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-muted-foreground text-sm">Comenzi/utilizator</span>
                <span className="text-xl font-bold">3.7</span>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg border">
                <DollarSign className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-muted-foreground text-sm">Valoare medie</span>
                <span className="text-xl font-bold">1,250 MDL</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Users Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Lista utilizatorilor</CardTitle>
              <CardDescription>
                {filteredUsers.length} utilizatori găsiți
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-1">
                Statutul activ se acordă utilizatorilor cu email verificat sau rol de admin
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Caută utilizatori..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtru status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate statusurile</SelectItem>
                  <SelectItem value="active">Activ</SelectItem>
                  <SelectItem value="inactive">Inactiv</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sortează după" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Data înregistrării</SelectItem>
                  <SelectItem value="name">Nume</SelectItem>
                  <SelectItem value="orderCount">Număr comenzi</SelectItem>
                  <SelectItem value="totalSpent">Total cheltuieli</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={fetchData}
                title="Reîmprospătează"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Data înregistrării</TableHead>
                  <TableHead>Comenzi</TableHead>
                  <TableHead className="text-right">Total cheltuieli</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'Utilizator anonim'}</TableCell>
                    <TableCell>{user.email || '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={
                          user.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                        title={user.status === 'ACTIVE'
                          ? 'Utilizator cu email verificat sau rol de admin'
                          : 'Utilizator fără email verificat'}
                      >
                        {user.status === 'ACTIVE' ? 'Activ' : 'Inactiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}
                        className={
                          user.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : ''
                        }
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Utilizator'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(user.createdAt), 'dd MMM yyyy', { locale: ro })}</TableCell>
                    <TableCell>{user.orderCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(user.totalSpent)}</TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nu s-au găsit utilizatori care să corespundă criteriilor.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
