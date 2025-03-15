import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Define types for timeline events
interface TimelineEvent {
  id: string;
  type: string;
  createdAt: Date;
  status: string | null;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  metadata: Record<string, any>;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await the params object to ensure it's resolved
    const params = await context.params;
    const orderId = params.id;
    console.log(`[History API] Processing request for order ID: ${orderId}`);

    if (!orderId) {
      console.log('[History API] Missing order ID');
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch the order to verify it exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.log(`[History API] Order not found: ${orderId}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log(`[History API] Successfully retrieved order #${order.orderNumber}`);

    // Since there's no auditLog model, create a simple mock timeline with just order creation
    const timeline: TimelineEvent[] = [
      {
        id: "order-created",
        type: "ORDER_CREATED",
        createdAt: order.createdAt,
        status: "PENDING",
        user: null,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      }
    ];

    // If the order status changed from PENDING, add a status change event
    if (order.status !== "PENDING") {
      timeline.push({
        id: "status-changed",
        type: "ORDER_STATUS_UPDATED",
        createdAt: order.updatedAt,
        status: order.status,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          previousStatus: "PENDING",
          newStatus: order.status,
        },
      });
    }

    return NextResponse.json({
      timeline,
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}
