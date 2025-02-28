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
  { params }: { params: { categoryId: string; subcategoryId: string; productId: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 2. Extract path parameters
    const { categoryId, subcategoryId, productId } = await Promise.resolve(params)

    // 3. Log the request
    console.log("[PRODUCT_GET] Fetching product:", { productId, subcategoryId, categoryId })

    // 4. Fetch the product
    const product = await prisma.produs.findUnique({
      where: {
        id: productId,
        subcategorieId: subcategoryId,
      },
    })

    // 5. Handle product not found
    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // 6. Return successful response
    return NextResponse.json(product)
  } catch (error) {
    // 7. Error handling
    if (error instanceof Error) {
      console.error("[PRODUCT_GET]", {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    } else {
      console.error("[PRODUCT_GET]", { error: "Unknown error occurred" })
    }

    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string; subcategoryId: string; productId: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 2. Extract path parameters
    const { categoryId, subcategoryId, productId } = await Promise.resolve(params)

    // 3. Validate request body
    const body = await req.json()
    const validatedFields = productSchema.safeParse(body)
    if (!validatedFields.success) {
      console.error("[PRODUCT_PATCH] Validation error:", validatedFields.error.format())
      return new NextResponse("Invalid fields", { status: 400 })
    }

    // 4. Extract validated data
    const {
      cod, nume, descriere, pret, pretRedus,
      stoc, stare, dimensiuni, greutate, imagini, specificatii,
      culoare // Extract culoare field but don't use it in updateData
    } = validatedFields.data

    // 5. Check for duplicate product code
    const existingProduct = await prisma.produs.findFirst({
      where: {
        cod,
        subcategorieId: subcategoryId,
        NOT: { id: productId },
      },
    })
    if (existingProduct) {
      return new NextResponse("Product with this code already exists", { status: 409 })
    }

    // 6. Prepare update data (only fields in Prisma schema)
    const updateData = {
      cod,
      nume,
      descriere,
      pret,
      stoc,
      imagini,
    } as any

    // Add optional fields if they exist
    if (pretRedus !== undefined) {
      updateData.pretRedus = pretRedus
    }
    if (stare === "NOU" || stare === "UTILIZAT") {
      updateData.stare = stare
    }
    if (greutate !== undefined) {
      updateData.greutate = greutate
    }
    if (culoare !== undefined) {
      updateData.culoare = culoare
    }

    // Handle JSON fields correctly
    if (dimensiuni && Object.keys(dimensiuni).length > 0) {
      // Only include non-empty dimensiuni
      const hasDimensions = Object.values(dimensiuni).some(val => val !== undefined && val !== null && val !== 0);
      if (hasDimensions) {
        updateData.dimensiuni = JSON.stringify(dimensiuni);
      }
    }

    if (specificatii && Object.keys(specificatii).length > 0) {
      updateData.specificatii = JSON.stringify(specificatii);
    }

    // 7. Log update operation
    console.log("[PRODUCT_PATCH] Updating product:", {
      productId,
      updateData: JSON.stringify(updateData),
      rawBody: JSON.stringify(body),
      prismaSchema: "Check if greutate is in the schema",
      validatedFields: JSON.stringify(validatedFields.data)
    })

    // 8. Update the product in database
    try {
      const product = await prisma.produs.update({
        where: {
          id: productId,
          subcategorieId: subcategoryId,
        },
        data: updateData,
      })

      // 9. Return success response
      return NextResponse.json(product)
    } catch (error) {
      console.error("[PRODUCT_PATCH] Database update error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
        updateData: JSON.stringify(updateData)
      });
      return new NextResponse(`Database update error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 })
    }
  } catch (error) {
    // 10. Error handling
    if (error instanceof Error) {
      console.error("[PRODUCT_PATCH]", {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    } else {
      console.error("[PRODUCT_PATCH]", { error: "Unknown error occurred" })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string; subcategoryId: string; productId: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 2. Extract path parameters
    const { categoryId, subcategoryId, productId } = await Promise.resolve(params)

    // 3. Log delete operation
    console.log("[PRODUCT_DELETE] Deleting product:", { productId, subcategoryId, categoryId })

    // 4. Delete the product
    const product = await prisma.produs.delete({
      where: {
        id: productId,
        subcategorieId: subcategoryId,
      },
    })

    // 5. Return successful response
    return NextResponse.json(product)
  } catch (error) {
    // 6. Error handling
    if (error instanceof Error) {
      console.error("[PRODUCT_DELETE]", {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    } else {
      console.error("[PRODUCT_DELETE]", { error: "Unknown error occurred" })
    }

    return new NextResponse("Internal error", { status: 500 })
  }
}
