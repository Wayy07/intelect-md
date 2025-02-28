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
  pret: z.coerce.number().min(0, "Prețul nu poate fi negativ"),
  pretRedus: z.coerce.number().min(0, "Prețul redus nu poate fi negativ").optional(),
  stoc: z.coerce.number().min(0, "Stocul nu poate fi negativ"),
  stare: z.enum(["NOU", "UTILIZAT"]),
  culoare: z.string().optional(),
  dimensiuni: z.object({
    lungime: z.coerce.number().min(0, "Lungimea nu poate fi negativă").optional(),
    latime: z.coerce.number().min(0, "Lățimea nu poate fi negativă").optional(),
    inaltime: z.coerce.number().min(0, "Înălțimea nu poate fi negativă").optional(),
  }).optional(),
  greutate: z.coerce.number().min(0, "Greutatea nu poate fi negativă").optional(),
  imagini: z.array(z.string().url("URL invalid")).min(1, "Adăugați cel puțin o imagine"),
  specificatii: z.record(z.string(), z.record(z.string(), z.string())).optional(),
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

    const { categoryId, subcategoryId } = await Promise.resolve(params)

    const products = await prisma.produs.findMany({
      where: {
        subcategorieId: subcategoryId,
        subcategorie: {
          categoriePrincipalaId: categoryId,
        },
      },
      orderBy: {
        nume: "asc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("[PRODUCTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

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

    const { categoryId, subcategoryId } = await Promise.resolve(params)

    const body = await req.json()
    const validatedFields = productSchema.safeParse(body)

    if (!validatedFields.success) {
      console.error("[PRODUCTS_POST] Validation error:", validatedFields.error.format())
      return new NextResponse("Invalid fields", { status: 400 })
    }

    const {
      cod, nume, descriere, pret, pretRedus,
      stoc, stare, dimensiuni, greutate, imagini, specificatii,
      culoare // Extract culoare field but don't use it in createData
    } = validatedFields.data

    const existingProduct = await prisma.produs.findFirst({
      where: {
        cod,
        subcategorieId: subcategoryId,
      },
    })

    if (existingProduct) {
      return new NextResponse("Product with this code already exists", { status: 409 })
    }

    const createData = {
      cod,
      nume,
      descriere,
      pret,
      stoc,
      imagini,
      subcategorieId: subcategoryId,
    } as any

    if (pretRedus !== undefined) {
      createData.pretRedus = pretRedus
    }

    if (stare === "NOU" || stare === "UTILIZAT") {
      createData.stare = stare
    }

    if (greutate !== undefined) {
      createData.greutate = greutate
    }

    if (culoare !== undefined) {
      createData.culoare = culoare
    }

    // Handle JSON fields correctly
    if (dimensiuni && Object.keys(dimensiuni).length > 0) {
      // Only include non-empty dimensiuni
      const hasDimensions = Object.values(dimensiuni).some(val => val !== undefined && val !== null && val !== 0);
      if (hasDimensions) {
        createData.dimensiuni = JSON.stringify(dimensiuni);
      }
    }

    if (specificatii && Object.keys(specificatii).length > 0) {
      createData.specificatii = JSON.stringify(specificatii);
    }

    console.log("[PRODUCTS_POST] Creating product:", {
      subcategoryId,
      createData: JSON.stringify(createData),
      rawBody: JSON.stringify(body),
      validatedFields: JSON.stringify(validatedFields.data)
    })

    try {
      const product = await prisma.produs.create({
        data: createData
      })

      return NextResponse.json(product)
    } catch (error) {
      console.error("[PRODUCTS_POST] Database create error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
        createData: JSON.stringify(createData)
      });
      return new NextResponse(`Database create error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 })
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PRODUCTS_POST]", {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    } else {
      console.error("[PRODUCTS_POST]", { error: "Unknown error occurred" })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}
