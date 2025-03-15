import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { subDays, subMonths, startOfDay, endOfDay, parseISO } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract date filters from query parameters
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Parse dates or use defaults (last 30 days)
    const today = new Date()
    const startDate = startDateParam
      ? startOfDay(parseISO(startDateParam))
      : startOfDay(subDays(today, 30))

    const endDate = endDateParam
      ? endOfDay(parseISO(endDateParam))
      : endOfDay(today)

    // 1. Get all users (with pagination in the future)
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
      take: 100, // Limit to 100 users for performance
    })

    // 2. Get total user count
    const totalUsers = await db.user.count()

    // 3. Get new users count (users with orders created in the last 30 days)
    const newUsersLastMonth = await db.user.count({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: subMonths(today, 1),
            }
          }
        }
      },
    })

    // 4. Get active users count (users with verified email or admin role)
    const activeUsers = await db.user.count({
      where: {
        OR: [
          { emailVerified: { not: null } },
          { role: 'ADMIN' }
        ]
      },
    })

    // 5. Generate user stats by role
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    })

    const roleStats = usersByRole.map((item) => ({
      name: item.role || 'UNKNOWN',
      value: item._count.id,
    }))

    // 6. Process user data to include order counts and total spent
    const processedUsers = users.map((user: any) => {
      const orderCount = user.orders?.length || 0
      const totalSpent = user.orders?.reduce((total: number, order: any) => total + (order.total || 0), 0) || 0

      // Consider both email verification and admin role for determining active status
      const status = user.emailVerified || user.role === 'ADMIN' ? 'ACTIVE' : 'INACTIVE'

      // Find the earliest order date as a proxy for user creation date
      const earliestOrderDate = user.orders?.length
        ? user.orders.reduce((earliest: Date, order: any) => {
            const orderDate = new Date(order.createdAt);
            return orderDate < earliest ? orderDate : earliest;
          }, new Date())
        : new Date();

      return {
        id: user.id,
        name: user.name || 'Anonymous User',
        email: user.email || '',
        role: user.role || 'USER',
        status,
        // Use emailVerified date or earliest order date as a proxy for user creation
        createdAt: (user.emailVerified || earliestOrderDate).toISOString(),
        orderCount,
        totalSpent,
      }
    })

    // 7. Registration data by month (for chart)
    // Since User doesn't have createdAt, we'll use Order createdAt as a proxy
    const oneYearAgo = subMonths(today, 12)
    const usersRegistrationData = await db.$queryRaw`
      WITH FirstOrders AS (
        SELECT
          "userId",
          MIN("createdAt") as first_order_date
        FROM "Order"
        WHERE "userId" IS NOT NULL
        GROUP BY "userId"
      )
      SELECT
        TO_CHAR(first_order_date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM FirstOrders
      WHERE first_order_date >= ${oneYearAgo}
      GROUP BY TO_CHAR(first_order_date, 'YYYY-MM')
      ORDER BY month ASC
    `

    // 8. Activity data (active users per day for the past week)
    const activityData = []
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i)
      const startOfTheDay = startOfDay(date)
      const endOfTheDay = endOfDay(date)

      // Count users with orders created on this day
      const activeUsersCount = await db.user.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: startOfTheDay,
                lte: endOfTheDay
              }
            }
          }
        }
      })

      // Count users who verified their email on this day
      const newUsersCount = await db.user.count({
        where: {
          emailVerified: {
            gte: startOfTheDay,
            lte: endOfTheDay
          }
        }
      })

      activityData.push({
        date: date.toISOString().split('T')[0],
        activeUsers: activeUsersCount,
        newUsers: newUsersCount,
      })
    }

    // 9. Format data for response
    const statusStats = [
      { name: 'ACTIVE', value: activeUsers },
      { name: 'INACTIVE', value: totalUsers - activeUsers }
    ]

    // Helper function to convert BigInt to Number
    const convertBigIntToNumber = (value: any): any => {
      if (typeof value === 'bigint') {
        return Number(value);
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.map(convertBigIntToNumber);
        }
        const result: Record<string, any> = {};
        for (const key in value) {
          result[key] = convertBigIntToNumber(value[key]);
        }
        return result;
      }
      return value;
    };

    // Convert any BigInt values to regular numbers
    const response = {
      users: processedUsers,
      totalUsers: Number(totalUsers),
      newUsersLastMonth: Number(newUsersLastMonth),
      activeUsers: Number(activeUsers),
      roleStats: roleStats.map(item => ({
        name: item.name,
        value: Number(item.value)
      })),
      statusStats: statusStats.map(item => ({
        name: item.name,
        value: Number(item.value)
      })),
      registrationByDate: Array.isArray(usersRegistrationData)
        ? usersRegistrationData.map(item => ({
            month: item.month,
            count: Number(item.count)
          }))
        : [],
      activityData: activityData.map(item => ({
        date: item.date,
        activeUsers: Number(item.activeUsers),
        newUsers: Number(item.newUsers)
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
