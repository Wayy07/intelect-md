import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import InventoryClient from "./inventory-client"

export default async function InventoryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/inventar/login")
  }

  return <InventoryClient />
}
