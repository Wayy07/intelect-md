import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const products = await prisma.produs.findMany({
      where: {
        OR: [
          { nume: { contains: query, mode: "insensitive" } },
          { descriere: { contains: query, mode: "insensitive" } },
          { cod: { contains: query, mode: "insensitive" } },
        ],
        activ: true,
      },
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
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
