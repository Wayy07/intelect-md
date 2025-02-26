import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import * as z from "zod"

const prisma = new PrismaClient()

const subcategorySchema = z.object({
  nume: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  descriere: z.string().optional(),
  imagine: z.string().url("URL-ul imaginii nu este valid").optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { categoryId: string } }
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
    const validatedFields = subcategorySchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const { nume, descriere, imagine } = validatedFields.data

    const subcategory = await prisma.subcategorie.create({
      data: {
        nume,
        descriere,
        imagine,
        categoriePrincipalaId: params.categoryId,
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("[SUBCATEGORIES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
