import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email și parola sunt necesare")
        }

        const user = await prisma.utilizator.findUnique({
          where: {
            email: credentials.email,
            tipAuth: "EMAIL_PAROLA",
            rol: "ADMIN"
          }
        })

        if (!user || !user.parola) {
          throw new Error("Utilizator inexistent")
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.parola)

        if (!passwordMatch) {
          throw new Error("Parolă incorectă")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nume,
          role: user.rol,
          image: user.imagine
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to login page after sign out
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/admin/inventar`
      }
      return url
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
