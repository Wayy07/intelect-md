import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/orders/[id] - Get a specific order by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;

    // Fetch order with related data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format the order data to match the frontend expected structure
    const formattedOrder = {
      ...order,
      customerDetails: {
        name: `${order.customer.firstName} ${order.customer.lastName}`,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address || "",
      },
      // Calculate subtotal from items
      subtotal: order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      // Assuming shipping cost is part of the total
      shipping: 0, // You could store this in your order model in the future
      // Set default values for tracking if not available
      trackingNumber: undefined,
      trackingUrl: undefined,
      // Default isPaid to true for now - you could add this to your schema later
      isPaid: true,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
