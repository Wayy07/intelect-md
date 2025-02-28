import HeroGrid from "@/app/components/hero-grid"
import LatestProducts from "@/app/components/latest-products"
import SpecialOffers from "@/app/components/special-offers"
import Advantages from "@/app/components/advantages"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroGrid />
      <LatestProducts />
      <SpecialOffers />
      <Advantages />
    </main>
  )
}
