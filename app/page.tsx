import HeroGrid from "@/app/components/hero-grid";
import LatestProducts from "@/app/components/latest-products";
import SpecialOffers from "@/app/components/special-offers";
import Advantages from "@/app/components/advantages";
import { Suspense } from "react";
import PromotionalBanners from "./components/promotional-banners";

export default function Home() {
  return (
    <main className="min-h-screen">
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
    </main>
  );
}
