import { create } from "zustand";
import { persist } from "zustand/middleware";

// Banner Types
export interface MainBanner {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  title: string;
  subtitle?: string;
  linkUrl: string;
  buttonText?: string;
}

export interface PromotionalBanner {
  id: number | string;
  imageSrc: string;
  alt: string;
}

// Initial banner data
const initialMainBanners: MainBanner[] = [
  {
    id: "banner1",
    desktopImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/March/b6f06df3-07aa-4e0e-8338-7b837c62fb60.webp",
    mobileImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/March/6f9ced87-4706-4817-9f96-c9b0f12c9b7b.webp",
    title: "Banner 1",
    linkUrl: "/catalog",
  },
  {
    id: "banner2",
    desktopImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/Banners_Q1/b6231404-cfbc-437b-95d3-e055d80d9fc6.webp",
    mobileImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/Offer_Of_The_Week/442a5f04-62bc-4e53-8480-9d1aee964b83.webp",
    title: "Banner 2",
    linkUrl: "/catalog?category=cat1",
  },
  {
    id: "banner3",
    desktopImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/Alla/Apple/2025/iPad_14.03/d9b4d225-5513-49a1-869a-785ac9ce0bce.webp",
    mobileImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/Alla/Apple/2025/iPad_14.03/6400cd8c-ff67-4ab7-8afb-bfc310137675.webp",
    title: "Banner 3",
    linkUrl: "/catalog?category=cat6",
  },
  {
    id: "banner4",
    desktopImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/Alla/Apple/2025/MacBook_14.03/c81f5a7b-a9fc-4564-bbac-82c2502a624d.webp",
    mobileImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/Alla/Apple/2025/MacBook_14.03/31f244c3-d74b-4486-a8d5-03aadd99be3f.webp",
    title: "Banner 4",
    linkUrl: "/catalog?category=cat6",
  },
  {
    id: "banner5",
    desktopImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/March/dd8e8eab-a69b-45b8-8218-f8161767a19d.webp",
    mobileImageUrl:
      "https://cdn-ultra.esempla.com/new_storage/banners/March/680358c0-c212-44f0-9d06-6ab2e2cc7486.webp",
    title: "Banner 5",
    linkUrl: "/catalog?category=cat6",
  },
];

const initialPromoBanners: PromotionalBanner[] = [
  {
    id: 1,
    imageSrc:
      "https://cdn-ultra.esempla.com/new_storage/banners/ro/lm94z2R4e2dqLINbXQjIuLjyjtvZbr.webp",
    alt: "Fashion collection banner",
  },
  {
    id: 2,
    imageSrc:
      "https://cdn-ultra.esempla.com/new_storage/files/Main3/ccd989e6-59f9-4583-8f1a-508d49e84d8a.webp",
    alt: "Smart devices banner",
  },
];

// Create a Zustand store with persistence
interface BannerStore {
  mainBanners: MainBanner[];
  promoBanners: PromotionalBanner[];
  setMainBanners: (banners: MainBanner[]) => void;
  setPromoBanners: (banners: PromotionalBanner[]) => void;
  resetToDefault: () => void;
}

export const useBannerStore = create<BannerStore>()(
  persist(
    (set: any) => ({
      mainBanners: initialMainBanners,
      promoBanners: initialPromoBanners,
      setMainBanners: (banners: MainBanner[]) => set({ mainBanners: banners }),
      setPromoBanners: (banners: PromotionalBanner[]) =>
        set({ promoBanners: banners }),
      resetToDefault: () =>
        set({
          mainBanners: initialMainBanners,
          promoBanners: initialPromoBanners,
        }),
    }),
    {
      name: "banner-storage",
    }
  )
);
