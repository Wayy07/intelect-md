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

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string; subcategoryId: string; productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { categoryId, subcategoryId, productId } = params;

    if (!categoryId || !subcategoryId || !productId) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const body = await req.json();
    console.log("Received request body:", body);

    const validatedFields = productSchema.safeParse(body);
    console.log("Validation result:", validatedFields);

    if (!validatedFields.success) {
      return new NextResponse("Invalid fields", { status: 400 });
    }

    // First check if the product exists and belongs to the correct subcategory
    const existingProduct = await prisma.produs.findFirst({
      where: {
        id: productId,
        subcategorieId: subcategoryId,
        subcategorie: {
          categoriePrincipalaId: categoryId,
        },
      },
    });

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check if the new code is unique (if it's being changed)
    if (validatedFields.data.cod !== existingProduct.cod) {
      const duplicateProduct = await prisma.produs.findFirst({
        where: {
          cod: validatedFields.data.cod,
          id: {
            not: productId,
          },
        },
      });

      if (duplicateProduct) {
        return new NextResponse("Product code already exists", { status: 400 });
      }
    }

    // Update the product using the validated data directly
    const product = await prisma.produs.update({
      where: {
        id: productId,
      },
      data: validatedFields.data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", { error });
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string; subcategoryId: string; productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if product exists and belongs to the correct subcategory
    const existingProduct = await prisma.produs.findFirst({
      where: {
        id: params.productId,
        subcategorieId: params.subcategoryId,
        subcategorie: {
          categoriePrincipalaId: params.categoryId,
        },
      },
    })

    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 })
    }

    const product = await prisma.produs.delete({
      where: {
        id: params.productId,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
