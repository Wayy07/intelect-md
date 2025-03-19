"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import MobileHeader from "./mobile-header";
import { BackToTop } from "@/components/ui/back-to-top";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <MobileHeader />
      <Header />
      <BackToTop />
    </>
  );
}
