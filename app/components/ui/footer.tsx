"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Facebook,
  Instagram,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "../../../components/ui/separator"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

// Static links for support and company info
const getStaticLinks = (t: (key: string) => string) => [
  {
    title: t("support"),
    links: [
      { name: t("deliveryHeader"), href: "/livrare" },
      { name: t("installmentPurchase"), href: "/credit" },
      { name: t("warranty"), href: "/garantie" },
      { name: t("return"), href: "/returnare" },
    ],
  },
]

interface Subcategory {
  id: string
  nume: string
}

interface Category {
  id: string
  nume: string
  subcategorii: Subcategory[]
}

interface LinkItem {
  name: string
  href: string
}

interface LinkCategory {
  title: string
  links: LinkItem[]
}

export default function Footer() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [footerLinks, setFooterLinks] = useState<LinkCategory[]>(getStaticLinks(t))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Mock data instead of API call
        // This would be replaced with a call to your custom API
        const mockCategories: Category[] = [
          {
            id: "cat1",
            nume: "Computere",
            subcategorii: [
              {
                id: "sub1",
                nume: "Laptopuri"
              },
              {
                id: "sub2",
                nume: "Desktop PC"
              }
            ]
          },
          {
            id: "cat2",
            nume: "Telefoane",
            subcategorii: [
              {
                id: "sub3",
                nume: "Smartphone-uri"
              },
              {
                id: "sub4",
                nume: "Accesorii"
              }
            ]
          },
          {
            id: "cat3",
            nume: "Electronice",
            subcategorii: [
              {
                id: "sub5",
                nume: "Televizoare"
              },
              {
                id: "sub6",
                nume: "Audio"
              }
            ]
          }
        ];

        setCategories(mockCategories);

        // Create category links for the footer
        if (mockCategories && mockCategories.length > 0) {
          // Extract subcategories from all categories, flatten the array, and take 5 items
          const allSubcategories = mockCategories.flatMap((category: Category) =>
            category.subcategorii.map((sub: Subcategory) => ({
              name: sub.nume,
              href: `/catalog/${category.id}/${sub.id}`
            }))
          ).slice(0, 5);

          // Add to footer links
          setFooterLinks([
            {
              title: t("categories"),
              links: allSubcategories
            },
            ...getStaticLinks(t)
          ]);
        }
      } catch (error) {
        console.error("Error with mock categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Simulate loading delay
    setTimeout(fetchCategories, 300);
  }, [t]);

  return (
    <footer className="bg-gray-50 pt-12 pb-16 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Link href="/" className="inline-block">
                <div className="relative h-14 w-14 overflow-hidden">
                  <Image
                    src="/logo.jpg"
                    alt="Intelect MD"
                    fill
                    className="object-cover rounded-full border-2 border-gray-100 shadow-sm"
                    priority
                  />
                </div>
              </Link>
              <div>
                <h3 className="font-semibold text-xl text-gray-900">Intelect MD</h3>
                <p className="text-sm text-muted-foreground">{t("techStoreHeader")}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              {t("storeDescription")}
            </p>
            <div className="flex items-center space-x-4 mb-6">
              <a
                href="https://www.instagram.com/intelect.md/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="hidden md:grid md:grid-cols-3 md:col-span-2 lg:col-span-2 gap-8">
            {!isLoading && footerLinks.map((category) => (
              <div key={category.title}>
                <h4 className="font-semibold text-gray-900 mb-4">
                  {category.title}
                </h4>
                <ul className="space-y-2">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-primary transition-colors flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile accordion links - more compact design */}
          <div className="md:hidden space-y-2">
            {!isLoading && footerLinks.map((category) => (
              <div key={category.title} className="border-b border-gray-200 pb-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {category.title}
                </h4>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-primary transition-colors flex items-center text-xs"
                      >
                        <ChevronRight className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("subscribeToNewsletter")}
            </h4>
            <p className="text-gray-600 mb-4 text-sm">
              {t("receiveOffersAndNews")}
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder={t("yourEmail")}
                className="bg-white border-gray-200"
              />
              <Button className="w-full gap-2">
                {t("subscribe")} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact information - more compact for mobile */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 border-t border-gray-200 pt-6">
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900 mb-1 text-sm">{t("phone")}</h5>
              <a href="tel:+37360175111" className="text-gray-600 hover:text-primary transition-colors">
                +373 601 75 111
              </a>
            </div>
          </div>
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900 mb-1 text-sm">{t("email")}</h5>
              <a href="mailto:info@intelectmd.com" className="text-gray-600 hover:text-primary transition-colors">
                intelectmd@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900 mb-1 text-sm">{t("address")}</h5>
              <p className="text-gray-600">
                Strada Calea Orheiului 37, MD-2059, Chișinău
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 pt-5 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Intelect MD. {t("allRightsReserved")}
            </p>

          </div>
        </div>

        {/* Extra space for mobile to prevent overlap with bottom navigation */}
        <div className="h-16 md:hidden"></div>
      </div>
    </footer>
  )
}
