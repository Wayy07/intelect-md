import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.categoriePrincipala.findMany({
      where: {
        activ: true,
      },
      include: {
        subcategorii: {
          where: {
            activ: true,
          },
          include: {
            produse: {
              where: {
                activ: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        nume: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[CATALOG_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
