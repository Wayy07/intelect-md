"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ChevronUp,
  Facebook,
  Linkedin,
  Send,
  Clock,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";

// Support links
const getSupportLinks = (t: (key: string) => string) => [
  { name: t("deliveryHeader") || "Delivery", href: "/livrare" },
  { name: t("installmentPurchase") || "Installment Purchase", href: "/credit" },
  { name: t("warranty") || "Warranty", href: "/garantie" },
  { name: t("return") || "Returns", href: "/returnare" },
  { name: t("contact") || "Contact", href: "/contact" },
];

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const supportLinks = getSupportLinks(t);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement newsletter subscription logic
    console.log("Subscribing email:", email);
    setEmail("");
    // Show success message
  };

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Logo and company info - 4 columns on large screens */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <Link href="/" className="inline-block">
                <div className="relative h-12 w-12 overflow-hidden">
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
                <h3 className="font-semibold text-xl text-gray-900">
                  Intelect MD
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("techStoreHeader") || "Technology Store"}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-5 max-w-md">
              {t("storeDescription") ||
                "Your trusted source for quality technology products. We offer the best selection of computers, smartphones, and electronics at competitive prices."}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {t("workingHours") || "Mon-Fri: 9:00-18:00, Sat: 10:00-15:00"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="tel:+37360175111"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  +373 601 75 111
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="mailto:intelectmd@gmail.com"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  intelectmd@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Strada Calea Orheiului 37, MD-2059, Chișinău
                </span>
              </div>
            </div>
          </div>

          {/* Middle column with support links - 3 columns on large screens */}
          <div className="lg:col-span-3 lg:col-start-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("support") || "Support"}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-primary transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-3 w-0 text-primary opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all duration-200 mr-0 group-hover:mr-1" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter section - 5 columns on large screens */}
          <div className="lg:col-span-4 lg:col-start-9">
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("subscribeToNewsletter") || "Newsletter"}
            </h4>
            <p className="text-gray-600 mb-4 text-sm">
              {t("receiveOffersAndNews") ||
                "Subscribe to receive updates, access to exclusive deals, and more."}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("yourEmail") || "Your email"}
                  className="pr-10 bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" className="w-full">
                {t("subscribe") || "Subscribe"}
              </Button>
            </form>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                {t("followUs") || "Follow Us"}
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/intelect.md/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-2 rounded-full text-gray-600 hover:text-primary hover:bg-gray-200 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gray-100 py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            © {currentYear} Intelect MD.{" "}
            {t("allRightsReserved") || "All rights reserved"}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-gray-200"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              {t("backToTop") || "Back to top"}
            </Button>
            <Link href="/" className="flex items-center">
              <div className="text-xs text-gray-500 flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="h-3 w-3" />
                <span>Intelect MD</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Extra space for mobile to prevent overlap with bottom navigation */}
      <div className="h-16 md:hidden"></div>
    </footer>
  );
}
