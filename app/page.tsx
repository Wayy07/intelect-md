import { BentoGrid } from "@/components/bento-grid"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function Home() {
  const subcategories = await prisma.subcategorie.findMany({
    where: {
      activ: true,
      imagine: {
        not: null
      }
    },
    include: {
      categoriePrincipala: true,
      produse: {
        where: {
          activ: true
        }
      },
      _count: {
        select: {
          produse: true
        }
      }
    },
    take: 8,
    orderBy: [
      {
        produse: {
          _count: 'desc'
        }
      },
      {
        nume: 'asc'
      }
    ]
  })

  return (
    <main className="flex min-h-screen flex-col">
    </main>
  )
}
