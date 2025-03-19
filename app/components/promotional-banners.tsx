"use client";

import Image from "next/image";
import { useBannerStore } from "../lib/banner-data";

interface BannerProps {
  imageSrc: string;
  alt: string;
}

const Banner = ({ imageSrc, alt }: BannerProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl shadow-md h-44 md:h-72 lg:h-80">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover object-center"
        priority
      />
    </div>
  );
};

export default function PromotionalBanners() {
  // Get banners from the store
  const { promoBanners } = useBannerStore();

  return (
    <section className="container mx-auto py-8 px-4 sm:px-6 3xl:px-16 3xl:max-w-[80%]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promoBanners.map((banner: any) => (
          <Banner key={banner.id} imageSrc={banner.imageSrc} alt={banner.alt} />
        ))}
      </div>
    </section>
  );
}
