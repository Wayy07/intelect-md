import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import LoginForm from "./login-form"
import PatternBackground from "./pattern-background"
import Image from "next/image"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === "ADMIN") {
    redirect("/admin/inventar")
  }

  return (
    <>
      <PatternBackground />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-white/50 p-2 shadow-md backdrop-blur">
              <Image
                src="/logo.jpg"
                alt="Logo"
                fill
                className="object-contain p-1 rounded-xl"
                priority
              />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Panou de administrare
              </h1>
              <p className="text-sm text-muted-foreground">
                Autentificați-vă pentru a gestiona magazinul
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Autentificare administrator
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-white/50 p-6 shadow backdrop-blur-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  )
}
