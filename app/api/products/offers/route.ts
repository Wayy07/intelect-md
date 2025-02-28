import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch special offers (products with a reduced price)
    const offers = await prisma.produs.findMany({
      where: {
        activ: true,
        pretRedus: {
          not: null,
        },
        AND: [
          {
            pretRedus: {
              gt: 0
            }
          }
        ]
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
      include: {
        subcategorie: {
          include: {
            categoriePrincipala: true,
          },
        },
      },
    })

    // Filter offers where pretRedus < pret in JavaScript
    const validOffers = offers.filter(offer =>
      offer.pretRedus !== null &&
      offer.pretRedus < offer.pret
    )

    return NextResponse.json(validOffers)
  } catch (error) {
    console.log("[OFFERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
