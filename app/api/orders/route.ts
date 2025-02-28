import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { customer, items, total, paymentMethod } = data

    // Generate a unique order number
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

    // Map payment method from frontend to database enum string
    const dbPaymentMethod = paymentMethod === 'pickup'
      ? 'RIDICARE_MAGAZIN'
      : paymentMethod === 'cash' ? 'RAMBURS' : 'CARD'

    // Create the full address string
    const fullAddress = `${customer.address}, ${customer.city}${customer.postalCode ? ', ' + customer.postalCode : ''}`

    // Create order in the database with type assertion for new properties
    const createData = {
      numarComanda: orderNumber,
      adresaLivrare: fullAddress,
      telefon: customer.phone,
      email: customer.email,
      metodaPlata: dbPaymentMethod,
      totalComanda: total,
      // Add custom fields as JSON in note field
      note: JSON.stringify({
        firstName: customer.firstName,
        lastName: customer.lastName,
        city: customer.city,
        postalCode: customer.postalCode,
        customerNotes: customer.notes
      }),
      detaliiComenzi: {
        create: items.map((item: any) => ({
          produsId: item.product.id,
          cantitate: item.quantity,
          pretUnitar: item.product.pretRedus || item.product.pret,
          subtotal: (item.product.pretRedus || item.product.pret) * item.quantity,
        }))
      }
    } as any

    const order = await prisma.comanda.create({
      data: createData,
      include: {
        detaliiComenzi: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Comanda a fost creată cu succes',
      order: {
        id: order.id,
        orderNumber: order.numarComanda,
        total: order.totalComanda
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Eroare la crearea comenzii:', error)
    return NextResponse.json(
      { success: false, message: 'A apărut o eroare la procesarea comenzii' },
      { status: 500 }
    )
  }
}
