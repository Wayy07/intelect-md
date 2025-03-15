"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // We'll only do basic checks here since the page component handles the detailed auth checks
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If the user is definitely not authenticated, redirect immediately
    if (status === "unauthenticated") {
      // We're redirecting to homepage rather than showing 404 for security reasons
      // (prevents enumeration of admin pages)
      router.push("/")
    }
  }, [status, router])

  // Let the page component handle the actual rendering
  return <>{children}</>
}
