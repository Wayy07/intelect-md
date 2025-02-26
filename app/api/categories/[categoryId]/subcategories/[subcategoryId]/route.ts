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

export async function GET(
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

    const subcategory = await prisma.subcategorie.findUnique({
      where: {
        id: params.subcategoryId,
        categoriePrincipalaId: params.categoryId,
      },
      include: {
        categoriePrincipala: true,
        produse: {
          orderBy: {
            nume: "asc",
          },
        },
      },
    })

    if (!subcategory) {
      return new NextResponse("Subcategory not found", { status: 404 })
    }

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("[SUBCATEGORY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
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
    const validatedFields = subcategorySchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const { nume, descriere, imagine } = validatedFields.data

    const subcategory = await prisma.subcategorie.update({
      where: {
        id: params.subcategoryId,
        categoriePrincipalaId: params.categoryId,
      },
      data: {
        nume,
        descriere,
        imagine,
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("[SUBCATEGORY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
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

    const { categoryId, subcategoryId } = await Promise.resolve(params)

    await prisma.produs.deleteMany({
      where: {
        subcategorieId: subcategoryId
      }
    })

    await prisma.subcategorie.delete({
      where: {
        id: subcategoryId,
        categoriePrincipalaId: categoryId,
      },
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Subcategory and all related products deleted successfully"
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("[SUBCATEGORY_DELETE]", error.message)
    } else {
      console.error("[SUBCATEGORY_DELETE] Unknown error occurred")
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Subcategory not found"
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Failed to delete subcategory"
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
