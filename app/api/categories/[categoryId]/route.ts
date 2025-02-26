import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import * as z from "zod"

const prisma = new PrismaClient()

const categorySchema = z.object({
  nume: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  descriere: z.string().optional(),
  imagine: z.string().url("URL-ul imaginii nu este valid").optional(),
})

export async function GET(
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

    const category = await prisma.categoriePrincipala.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        subcategorii: {
          orderBy: {
            nume: "asc",
          },
        },
      },
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("[CATEGORY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
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
    const validatedFields = categorySchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const { nume, descriere, imagine } = validatedFields.data

    const category = await prisma.categoriePrincipala.update({
      where: {
        id: params.categoryId,
      },
      data: {
        nume,
        descriere,
        imagine,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
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

    // Get the category ID from params and await it properly
    const { categoryId } = await Promise.resolve(params)

    // First, delete all products in all subcategories
    await prisma.produs.deleteMany({
      where: {
        subcategorie: {
          categoriePrincipalaId: categoryId
        }
      }
    })

    // Then delete all subcategories
    await prisma.subcategorie.deleteMany({
      where: {
        categoriePrincipalaId: categoryId
      }
    })

    // Finally delete the main category
    await prisma.categoriePrincipala.delete({
      where: {
        id: categoryId
      }
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Category and all related items deleted successfully"
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    // Safe error logging
    if (error instanceof Error) {
      console.error("[CATEGORY_DELETE]", error.message)
    } else {
      console.error("[CATEGORY_DELETE] Unknown error occurred")
    }

    // If the category doesn't exist, Prisma will throw a specific error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Category not found"
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
        message: "Failed to delete category"
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
