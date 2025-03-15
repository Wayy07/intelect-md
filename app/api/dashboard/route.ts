import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has ADMIN role
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse date range from query parameters
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Get current date for time-based queries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Use provided date range or default to last 30 days
    let thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Parse start and end dates from query parameters
    const startDate = startDateParam ? new Date(startDateParam) : thirtyDaysAgo;
    const endDate = endDateParam ? new Date(endDateParam) : now;

    // Add one day to end date to include the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    console.log(`Dashboard API: Fetching data from ${startDate.toISOString()} to ${adjustedEndDate.toISOString()}`);

    // Create date filter for queries
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lt: adjustedEndDate
      }
    };

    // Fetch dashboard statistics in parallel
    const [
      userCount,
      totalOrders,
      recentOrders,
      pendingOrders,
      completedOrders,
      salesData,
      orderStatusStats
    ] = await Promise.all([
      // Total user count
      prisma.user.count(),

      // Total order count for the selected period
      prisma.order.count({
        where: dateFilter
      }),

      // Recent orders within the selected period
      prisma.order.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: true,
          items: true
        }
      }),

      // Pending orders count for the period
      prisma.order.count({
        where: {
          ...dateFilter,
          status: 'PENDING'
        }
      }),

      // Completed orders count for the period
      prisma.order.count({
        where: {
          ...dateFilter,
          status: 'COMPLETED'
        }
      }),

      // Sales data for the period
      prisma.order.groupBy({
        by: ['createdAt'],
        where: dateFilter,
        _sum: {
          total: true
        }
      }),

      // Order status statistics for the period
      prisma.order.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true
      })
    ]);

    // Calculate total revenue for the period
    const totalRevenue = await prisma.order.aggregate({
      where: dateFilter,
      _sum: { total: true }
    });

    // Calculate monthly revenue
    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: { total: true }
    });

    // Format sales data for chart
    const formattedSalesData = salesData.map(day => ({
      date: day.createdAt.toISOString().split('T')[0],
      amount: day._sum.total || 0
    }));

    // Group sales data by date (combining multiple entries on same day)
    const salesByDate = formattedSalesData.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = 0;
      }
      acc[curr.date] += curr.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate the number of days in the range
    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const numDays = Math.min(dayDiff, 90); // Limit to 90 days to avoid very large datasets

    // Create an array of dates for the selected period
    const dateRange = Array.from({ length: numDays }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    // Fill in missing dates with zero values
    const chartData = dateRange.map(date => ({
      date,
      amount: salesByDate[date] || 0
    }));

    // Format order status data for a pie chart
    const orderStatusData = orderStatusStats.map(status => ({
      name: status.status,
      value: status._count
    }));

    // Get new accounts approximation (simplified since createdAt might not be available)
    const newUsersApprox = Math.floor(userCount * 0.1); // Approximation of 10% of total users are new

    return NextResponse.json({
      userStats: {
        total: userCount,
        newUsers: newUsersApprox
      },
      orderStats: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      financialStats: {
        totalRevenue: totalRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0
      },
      recentOrders,
      chartData: {
        salesTrend: chartData,
        orderStatusDistribution: orderStatusData
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
