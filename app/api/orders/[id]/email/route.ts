import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmation, sendOrderNotification, sendShippingNotification, sendCreditInfo } from "@/lib/email";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object to ensure it's resolved
    const params = await context.params;
    const orderId = params.id;
    console.log(`[Email API] Processing request for order ID: ${orderId}`);

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('[Email API] Unauthorized request');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate order ID
    if (!orderId) {
      console.log('[Email API] Missing order ID');
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body to get email type
    const body = await req.json();
    const { type } = body;

    if (!type) {
      console.log('[Email API] Missing email type');
      return NextResponse.json(
        { error: "Email type is required" },
        { status: 400 }
      );
    }

    console.log(`[Email API] Fetching order data for ID: ${orderId}, type: ${type}`);

    // Fetch the order with customer details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      console.log(`[Email API] Order not found: ${orderId}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log(`[Email API] Successfully retrieved order #${order.orderNumber}`);

    // Send the appropriate email based on type
    let result;
    try {
      switch (type) {
        case "confirmation":
          console.log(`[Email API] Sending confirmation email for order #${order.orderNumber}`);
          result = await sendOrderConfirmation(order);
          break;
        case "notification":
          console.log(`[Email API] Sending general notification for order #${order.orderNumber}`);
          result = await sendOrderNotification(order);
          break;
        case "shipping":
          console.log(`[Email API] Sending shipping notification for order #${order.orderNumber}`);
          // Extract shipping data from request
          const { trackingNumber, estimatedDeliveryDate, shippingMethod } = body;
          result = await sendShippingNotification({
            ...order,
            trackingNumber: trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
            trackingUrl: `https://intelect.md/tracking/${trackingNumber || ''}`,
            estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            shippingMethod: shippingMethod || 'Livrare standard'
          });
          break;
        case "credit":
          console.log(`[Email API] Sending credit information for order #${order.orderNumber}`);
          const { financingTerm } = body;
          result = await sendCreditInfo({
            ...order,
            financingTerm: financingTerm || 12
          });
          break;
        default:
          console.log(`[Email API] Invalid email type: ${type}`);
          return NextResponse.json(
            { error: "Invalid email type" },
            { status: 400 }
          );
      }

      console.log(`[Email API] Email sent successfully:`, result);

      // Log email activity to the console only
      console.log(`[Email API] Email activity: TYPE=${type}, ORDER=${order.id}, USER=${session.user.id}`);

    } catch (emailError) {
      console.error(`[Email API] Error sending email:`, emailError);
      return NextResponse.json(
        { error: `Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email ${type} sent successfully`,
    });
  } catch (error) {
    console.error("[Email API] Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
