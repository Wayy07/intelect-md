"use client"

import React from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignOutButton() {
  return (
    <Button
      onClick={() => {
        signOut({
          callbackUrl: "/admin/inventar",
          redirect: true
        })
      }}
      variant="destructive"
    >
      Deconectare
    </Button>
  )
}
