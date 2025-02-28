import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.produs.findMany({
      where: {
        activ: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 8,
      select: {
        id: true,
        nume: true,
        cod: true,
        pret: true,
        pretRedus: true,
        imagini: true,
        stoc: true,
        subcategorie: {
          select: {
            id: true,
            nume: true,
            categoriePrincipala: {
              select: {
                id: true,
                nume: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching latest products:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
