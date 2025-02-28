import HeroGrid from "@/app/components/hero-grid"
import LatestProducts from "@/app/components/latest-products"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroGrid />
      <LatestProducts />
    </main>
  )
}
