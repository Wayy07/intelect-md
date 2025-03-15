"use client"

import { usePathname } from "next/navigation"
import Footer from "@/app/components/ui/footer"

export default function FooterWrapper() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) {
    return null
  }

  return <Footer />
}
