import HeroGrid from "@/app/components/hero-grid";
import LatestProducts from "@/app/components/latest-products";
import SpecialOffers from "@/app/components/special-offers";
import Advantages from "@/app/components/advantages";
import { Suspense } from "react";
import PromotionalBanners from "./components/promotional-banners";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <GridPattern
          squares={[
            [4, 4], // 1
            [5, 1], // 2
            [8, 2], // 3
            [5, 3], // 4
            [5, 5], // 5
            [10, 10], // 6
            [12, 15], // 7
            [15, 10], // 8
            [10, 15], // 9
            [16, 9], // 10
            [9, 16], // 11
            [17, 8], // 12
          ]}
          className={cn(
            "opacity-30 sm:opacity-30 md:opacity-30",
            "[mask-image:radial-gradient(white,transparent)]",

            "scale-60 sm:scale-60 md:scale-80 lg:scale-100",
            "inset-x-0 inset-y-[-20%] sm:inset-y-[-25%] md:inset-y-[-30%] h-[180%] sm:h-[190%] md:h-[200%]",
            "skew-y-6 sm:skew-y-8 md:skew-y-12"
          )}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <HeroGrid />
        <Suspense fallback={<div>Loading special offers...</div>}>
          <LatestProducts />
        </Suspense>
        <Suspense fallback={<div>Loading promotional banners...</div>}>
          <PromotionalBanners />
        </Suspense>
        <Suspense fallback={<div>Loading latest products...</div>}>
          <SpecialOffers />
        </Suspense>
        <Advantages />
      </div>
    </main>
  );
}
