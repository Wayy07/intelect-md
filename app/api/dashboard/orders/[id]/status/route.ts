import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
    console.log(`[Status API] Processing request for order ID: ${orderId}`);

    if (!orderId) {
      console.log('[Status API] Missing order ID');
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body to get the new status
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get the current order to record previous status
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // AuditLog creation removed as the model doesn't exist in the schema
    // Log the action for debugging instead
    console.log("Order status updated:", {
      action: "ORDER_STATUS_UPDATED",
      entity: "ORDER",
      entityId: orderId,
      userId: session.user.id,
      previousStatus: currentOrder.status,
      newStatus: status,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
