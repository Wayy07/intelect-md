import { NextResponse } from 'next/server'
import { PrismaClient, MetodaPlata } from '@prisma/client'
import { sendOrderConfirmation } from '@/app/lib/email'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { customer, items, total, paymentMethod } = data

    // Generate a unique order number
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

    // Map payment method from frontend to database enum string
    let dbPaymentMethod: MetodaPlata = MetodaPlata.CARD
    if (paymentMethod === 'pickup') {
      dbPaymentMethod = MetodaPlata.RIDICARE_MAGAZIN
    } else if (paymentMethod === 'cash') {
      dbPaymentMethod = MetodaPlata.RAMBURS
    }

    // Create the full address string - for pickup orders, this will be the store address
    const fullAddress = paymentMethod === 'pickup'
      ? 'Ridicare din magazin - Str. Ștefan cel Mare 1, Chișinău, Moldova'
      : `${customer.address}, ${customer.city}${customer.postalCode ? ', ' + customer.postalCode : ''}`;

    // Create order in the database
    const order = await prisma.comanda.create({
      data: {
        numarComanda: orderNumber,
        adresaLivrare: fullAddress,
        telefon: customer.phone,
        email: customer.email,
        metodaPlata: dbPaymentMethod,
        totalComanda: total,
        numeClient: customer.firstName,
        prenumeClient: customer.lastName,
        orasClient: customer.city || 'Chișinău', // Default to Chișinău for pickup orders
        codPostal: customer.postalCode || '',
        note: customer.notes,
        detaliiComenzi: {
          create: items.map((item: any) => ({
            produsId: item.product.id,
            cantitate: item.quantity,
            pretUnitar: item.product.pretRedus || item.product.pret,
            subtotal: (item.product.pretRedus || item.product.pret) * item.quantity,
          }))
        }
      },
      include: {
        detaliiComenzi: {
          include: {
            produs: true
          }
        }
      }
    })

    // Format date for email
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ro-MD', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }

    // Map payment method to human-readable text
    const getPaymentMethodText = (method: MetodaPlata) => {
      switch(method) {
        case MetodaPlata.RIDICARE_MAGAZIN:
          return 'Ridicare din magazin';
        case MetodaPlata.RAMBURS:
          return 'Numerar la livrare';
        case MetodaPlata.CARD:
          return 'Card bancar';
        default:
          return 'Altă metodă';
      }
    }

    // Send confirmation email
    try {
      await sendOrderConfirmation({
        orderNumber: order.numarComanda,
        date: formatDate(order.createdAt),
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          address: fullAddress
        },
        paymentMethod: getPaymentMethodText(order.metodaPlata),
        items: order.detaliiComenzi.map(item => ({
          name: item.produs.nume,
          quantity: item.cantitate,
          price: item.pretUnitar,
          total: item.subtotal
        })),
        total: order.totalComanda
      });
    } catch (emailError) {
      // Log email error but don't fail the order creation
      console.error('Error sending confirmation email:', emailError);
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Comanda a fost creată cu succes',
      order: {
        id: order.id,
        orderNumber: order.numarComanda,
        total: order.totalComanda,
        items: order.detaliiComenzi.map(item => ({
          name: item.produs.nume,
          quantity: item.cantitate,
          price: item.pretUnitar,
          total: item.subtotal
        })),
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          address: fullAddress
        },
        date: formatDate(order.createdAt),
        paymentMethod: getPaymentMethodText(order.metodaPlata)
      }
    })

  } catch (error) {
    console.error('Eroare la crearea comenzii:', error)

    // Return error response with a simpler structure
    return NextResponse.json({
      success: false,
      message: 'A apărut o eroare la procesarea comenzii'
    }, { status: 500 })
  }
}
