"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "A apărut o eroare la configurarea autentificării.";
      case "AccessDenied":
        return "Acces refuzat. Nu ai permisiunea de a accesa această resursă.";
      case "Verification":
        return "Linkul de verificare a expirat sau a fost deja utilizat.";
      default:
        return "A apărut o eroare la autentificare. Te rugăm să încerci din nou.";
    }
  };

  return (
    <div className="container max-w-md py-24">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Eroare de autentificare</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/">Înapoi la pagina principală</Link>
        </Button>
      </div>
    </div>
  );
}
