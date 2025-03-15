import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has ADMIN role
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse URL parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search") || "";
    // Add date range parameters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build filters
    const filters: any = {};

    if (status && status !== "ALL") {
      filters.status = status;
    }

    if (paymentMethod && paymentMethod !== "ALL") {
      filters.paymentMethod = paymentMethod;
    }

    // Add date range filter
    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
      console.log('Filtering orders by date range:', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    }

    if (search) {
      filters.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Fetch orders with filtering, sorting and pagination
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: filters,
        include: {
          customer: true,
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [sortField]: sortOrder
        },
        skip,
        take: pageSize
      }),
      prisma.order.count({ where: filters })
    ]);

    // Get order statuses for filter dropdown
    const orderStatuses = await prisma.order.findMany({
      select: {
        status: true
      },
      distinct: ['status']
    });

    // Get payment methods for filter dropdown
    const paymentMethods = await prisma.order.findMany({
      select: {
        paymentMethod: true
      },
      distinct: ['paymentMethod']
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / pageSize);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        pageSize,
        totalOrders,
        totalPages
      },
      filters: {
        statuses: orderStatuses.map(s => s.status),
        paymentMethods: paymentMethods.map(p => p.paymentMethod)
      }
    });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
