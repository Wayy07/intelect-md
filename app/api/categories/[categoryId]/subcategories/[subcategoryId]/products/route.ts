import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import * as z from "zod"

const prisma = new PrismaClient()

const productSchema = z.object({
  cod: z.string().min(2, "Codul trebuie să aibă cel puțin 2 caractere"),
  nume: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  descriere: z.string().min(10, "Descrierea trebuie să aibă cel puțin 10 caractere"),
  pret: z.number().min(0, "Prețul nu poate fi negativ"),
  pretRedus: z.number().min(0, "Prețul redus nu poate fi negativ").optional(),
  stoc: z.number().min(0, "Stocul nu poate fi negativ"),
  stare: z.enum(["NOU", "UTILIZAT"]),
  imagini: z.array(z.string().url("URL invalid")).min(1, "Adăugați cel puțin o imagine"),
  specificatii: z.record(z.string(), z.string()).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { categoryId: string; subcategoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const validatedFields = productSchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const { cod, nume, descriere, pret, pretRedus, stoc, stare, imagini, specificatii } =
      validatedFields.data

    // Check if subcategory exists
    const subcategory = await prisma.subcategorie.findUnique({
      where: {
        id: params.subcategoryId,
        categoriePrincipalaId: params.categoryId,
      },
    })

    if (!subcategory) {
      return new NextResponse("Subcategory not found", { status: 404 })
    }

    // Check if product code is unique
    const existingProduct = await prisma.produs.findUnique({
      where: {
        cod,
      },
    })

    if (existingProduct) {
      return new NextResponse("Product code already exists", { status: 400 })
    }

    const product = await prisma.produs.create({
      data: {
        cod,
        nume,
        descriere,
        pret,
        pretRedus,
        stoc,
        stare,
        imagini,
        specificatii,
        subcategorieId: params.subcategoryId,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("[PRODUCTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
