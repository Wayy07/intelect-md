import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendOrderNotification } from "@/app/lib/email";

interface OrderItem {
  productId: string;
  name: string;
  code: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the session (if user is logged in)
    const session = await getServerSession(getAuthOptions());

    // Parse request body
    const body = await request.json();
    const { customer, items, total, paymentMethod, financingTerm } = body;

    console.log("Received order request:", JSON.stringify({
      customer,
      total,
      paymentMethod,
      financingTerm,
      itemsCount: items?.length || 0
    }, null, 2));

    // Log the first item to debug
    if (items && items.length > 0) {
      console.log("First item data:", JSON.stringify(items[0], null, 2));
    }

    if (!customer || !items || !total || !paymentMethod) {
      return NextResponse.json(
        { message: "Lipsesc date obligatorii pentru comandă" },
        { status: 400 }
      );
    }

    // Validate item fields
    for (const item of items) {
      if (!item.product) {
        return NextResponse.json(
          { message: "Date lipsă pentru produse. Fiecare articol trebuie să conțină detalii despre produs." },
          { status: 400 }
        );
      }
    }

    // Generate a unique order number
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Create the order in the database
    const order = await prisma.$transaction(async (tx) => {
      // Create customer info
      const customerInfo = await tx.customerInfo.create({
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city
        }
      });

      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          total,
          paymentMethod,
          status: "PENDING",
          userId: session?.user?.id || null,
          customerInfoId: customerInfo.id,
          // Add financing term if payment method is credit
          ...(paymentMethod === 'credit' && { financingTerm: financingTerm || 12 }),
          items: {
            create: items.map((item: any) => ({
              quantity: item.quantity,
              price: item.product.pretRedus || item.product.pret,
              productId: item.product.id,
              name: item.product.nume,
              code: item.product.cod,
              imageUrl: item.product.imagini && item.product.imagini.length > 0 ? item.product.imagini[0] : null
            }))
          }
        },
        include: {
          customer: true,
          items: true
        }
      });

      return order;
    });

    // Format the date
    const formattedDate = new Date(order.createdAt).toLocaleDateString('ro-MD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format customer name
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`;

    // Format payment method for display
    let displayPaymentMethod;
    let isCredit = false;
    let orderFinancingTerm = null;

    switch(order.paymentMethod) {
      case 'pickup':
        displayPaymentMethod = 'Ridicare din magazin';
        break;
      case 'cash':
        displayPaymentMethod = 'Numerar la livrare';
        break;
      case 'credit':
        displayPaymentMethod = 'Solicitare credit';
        isCredit = true;
        orderFinancingTerm = (order as any).financingTerm || body.financingTerm || 12; // Use type assertion
        break;
      default:
        displayPaymentMethod = order.paymentMethod;
    }

    // Send order confirmation email
    try {
      const emailResult = await sendOrderConfirmation(
        {
          orderNumber: order.orderNumber,
          date: formattedDate,
          total: order.total,
          shippingFee: 0,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          customer: {
            name: customerName,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address || '',
            city: order.customer.city || ''
          },
          paymentMethod: displayPaymentMethod,
          paymentMethodType: order.paymentMethod,
          isCredit,
          financingTerm: orderFinancingTerm,
        }
      );

      if ((emailResult as any).success) {
        console.log("Order confirmation email sent to customer");
      } else {
        console.error("Failed to send order confirmation email to customer");
      }

      // Send notification email to admin
      const adminEmailResult = await sendOrderNotification(
        {
          orderNumber: order.orderNumber,
          date: formattedDate,
          total: order.total,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          customer: {
            name: customerName,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address || '',
            city: order.customer.city || ''
          },
          paymentMethod: displayPaymentMethod,
          paymentMethodType: order.paymentMethod,
          isCredit,
          financingTerm: orderFinancingTerm,
        }
      );

      if ((adminEmailResult as any).success) {
        console.log("Order notification email sent to admin");
      } else {
        console.error("Failed to send order notification email to admin");
      }

    } catch (error) {
      console.error("Error sending emails:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Comanda a fost plasată cu succes",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        customer: order.customer,
        items: order.items
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);

    // Return a properly formatted error response
    return new NextResponse(
      JSON.stringify({ message: "A apărut o eroare la procesarea comenzii" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
