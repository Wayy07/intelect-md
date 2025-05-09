"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

// Sign-in content component that uses useSearchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      switch(error) {
        case "OAuthCallback":
          setErrorMessage("There was a problem with the authentication. Please try again.");
          break;
        case "OAuthSignin":
          setErrorMessage("Failed to initiate sign-in. Please try again.");
          break;
        default:
          setErrorMessage(`Authentication error: ${error}`);
      }
    } else if (!isRedirecting) {
      // Don't automatically redirect if there was an error or we're already redirecting
      // (Removed auto-redirect to Google to allow users to choose between Google and Facebook)
    }
  }, [callbackUrl, error, isRedirecting]);

  const handleGoogleSignIn = async () => {
    setIsRedirecting(true);
    await signIn("google", { callbackUrl, redirect: true });
  };

  const handleFacebookSignIn = async () => {
    setIsRedirecting(true);
    await signIn("facebook", { callbackUrl, redirect: true });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Conectare la cont</h1>
        <p className="text-gray-600">
          Conectează-te pentru a continua la Intelect.md
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6">
          {errorMessage}
        </div>
      )}

      <Button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 mb-4"
        variant="outline"
        size="lg"
        disabled={isRedirecting}
      >
        <div className="bg-white rounded-full p-1">
          <GoogleIcon className="h-5 w-5" />
        </div>
        <span>{isRedirecting ? "Se conectează..." : "Continuă cu Google"}</span>
      </Button>

      <Button
        onClick={handleFacebookSignIn}
        className="w-full flex items-center justify-center gap-2 mb-2"
        variant="outline"
        size="lg"
        disabled={isRedirecting}
      >
        <div className="bg-white rounded-full p-1">
          <FacebookIcon className="h-5 w-5" />
        </div>
        <span>{isRedirecting ? "Se conectează..." : "Continuă cu Facebook"}</span>
      </Button>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Prin conectare, accepți <a href="/termeni" className="text-primary hover:underline">Termenii și Condițiile</a> și <a href="/confidentialitate" className="text-primary hover:underline">Politica de Confidențialitate</a>.
        </p>
      </div>
    </div>
  );
}

// Loading fallback component for Suspense
function SignInLoading() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8">
      <div className="text-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
      </div>

      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <div className="text-center mt-6">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SignInPage() {
  return (
    <div className="container max-w-md py-24">
      <Suspense fallback={<SignInLoading />}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
