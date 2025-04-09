"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Clock,
  Package,
  MapPin,
  Calculator,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/language-context";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MorphingText } from "@/components/magicui/morphing-text";
import { cn } from "@/lib/utils";

// Define shipping regions and their delivery times
const shippingRegions = [
  {
    name: "Chișinău",
    standard: "1-2 zile",
    express: "În aceeași zi*",
    price: 50,
    expressPrice: 100,
  },
  {
    name: "Bălți",
    standard: "1-3 zile",
    express: "A doua zi",
    price: 70,
    expressPrice: 150,
  },
  {
    name: "Cahul",
    standard: "2-3 zile",
    express: "A doua zi",
    price: 80,
    expressPrice: 160,
  },
  {
    name: "Alte localități urbane",
    standard: "2-4 zile",
    express: "2-3 zile",
    price: 100,
    expressPrice: 180,
  },
  {
    name: "Zone rurale",
    standard: "3-5 zile",
    express: "2-4 zile",
    price: 120,
    expressPrice: 200,
  },
];

// Free shipping threshold
const freeShippingThreshold = 0;

export default function ShippingPage() {
  // Get the translation function
  const { t } = useLanguage();

  // State for active tab (shipping method)
  const [activeTab, setActiveTab] = useState("standard");

  // State for shipping calculator
  const [cartTotal, setCartTotal] = useState<number>(3000);
  const [selectedRegion, setSelectedRegion] = useState<string>("Chișinău");

  // Calculate shipping cost based on region and cart total
  const calculateShippingCost = () => {
    // Free shipping for all
    return 0;
  };

  // Get the total price including shipping
  const getTotalPrice = () => {
    return cartTotal + calculateShippingCost();
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern for the entire page */}
      <div className="absolute inset-0">
        <GridPattern
          squares={[
            [1, 2],
            [3, 3],
            [6, 2],
            [10, 6],
            [15, 6],
            [19, 5],
            [7, 8],
            [5, 14],
            [8, 11],
            [12, 18],
            [18, 14],
            [9, 19],
            [15, 2],
          ]}
          className="opacity-40 [mask-image:radial-gradient(white,transparent)]"
        />
      </div>

      {/* Hero section */}
      <section className="relative pb-10 md:pb-16 pt-16 md:pt-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 md:mb-12">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("livrare_breadcrumb_home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {t("livrare_breadcrumb_delivery")}
            </span>
          </nav>

          {/* Main title */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("livrare_badge")}
            </Badge>
            <div className="mb-4 md:mb-6">
              {/* Mobile Morphing Text - shorter texts only */}
              <div className="md:hidden">
                <MorphingText
                  texts={[
                    t("livrare_breadcrumb_delivery"),
                    t("livrare_free"),
                  ]}
                  className="h-12 text-[30pt]"
                />
              </div>

              {/* Desktop Morphing Text - full text options */}
              <div className="hidden md:block">
                <MorphingText
                  texts={[
                    t("livrare_breadcrumb_delivery"),
                    t("livrare_page_title"),
                    t("livrare_delivery_options"),
                    t("livrare_free"),
                  ]}
                  className="h-16 text-[40pt] lg:text-[50pt]"
                />
              </div>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t("livrare_page_description")}
            </p>
          </div>
        </div>
      </section>

      {/* Shipping options section */}
      <section className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            {t("livrare_delivery_options")}
          </h2>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Truck className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle>{t("livrare_standard_delivery")}</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                    {t("livrare_free")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      {t("livrare_delivery_time")}
                    </h4>
                    <ul className="pl-5 space-y-1 text-sm list-disc">
                      <li className="group/item hover:text-primary transition-colors">
                        {t("livrare_chisinau")}
                      </li>
                      <li className="group/item hover:text-primary transition-colors">
                        {t("livrare_urban_areas")}
                      </li>
                      <li className="group/item hover:text-primary transition-colors">
                        {t("livrare_rural_areas")}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      {t("livrare_details")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("livrare_standard_description")}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <ShimmerButton
                  className="w-full"
                  shimmerColor="#00BFFF"
                  shimmerSize="0.05em"
                  shimmerDuration="3s"
                  borderRadius="8px"
                  background="rgba(0, 0, 0, 0.9)"
                  onClick={() =>
                    document
                      .getElementById("calculator")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {t("livrare_calculate_shipping")}
                </ShimmerButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Shipping calculator section */}
      <section id="calculator" className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              {t("livrare_calculator_title")}
            </h2>
            <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
              {t("livrare_calculator_description")}
            </p>

            <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-primary/10 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="region"
                      className="block mb-2 text-sm font-medium"
                    >
                      {t("livrare_select_location")}
                    </label>
                    <select
                      id="region"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                    >
                      {shippingRegions.map((region) => (
                        <option key={region.name} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cartValue"
                      className="block mb-2 text-sm font-medium"
                    >
                      {t("livrare_cart_value")}
                    </label>
                    <input
                      type="number"
                      id="cartValue"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                      value={cartTotal}
                      onChange={(e) => setCartTotal(Number(e.target.value))}
                      min="0"
                    />
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="font-medium mb-2">
                      {t("livrare_estimated_delivery_time")}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {selectedRegion === "Chișinău"
                        ? "1-2 zile lucrătoare"
                        : selectedRegion === "Zone rurale"
                        ? "3-5 zile lucrătoare"
                        : "2-4 zile lucrătoare"}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {t("livrare_processing_time")}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-lg border border-primary/10 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">
                    {t("livrare_order_summary")}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                      <span>{t("livrare_subtotal")}:</span>
                      <span>{cartTotal.toLocaleString("ro-RO")} MDL</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                      <span>{t("livrare_delivery_cost")}:</span>
                      <span className="text-green-600 font-medium">
                        {t("livrare_free")}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t("livrare_total")}:</span>
                      <span>{getTotalPrice().toLocaleString("ro-RO")} MDL</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <ShimmerButton
                      className="w-full"
                      shimmerColor="#00BFFF"
                      shimmerSize="0.05em"
                      shimmerDuration="3s"
                      borderRadius="8px"
                      background="rgba(0, 0, 0, 0.9)"
                      onClick={() => (window.location.href = "/catalog")}
                    >
                      {t("livrare_buy_now")}
                    </ShimmerButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {t("livrare_faq_title")}
          </h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            {t("livrare_faq_description")}
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion
              type="single"
              collapsible
              className="w-full bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-md overflow-hidden"
            >
              <AccordionItem
                value="item-1"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("livrare_faq_question_1")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("livrare_faq_answer_1")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("livrare_faq_question_2")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("livrare_faq_answer_2")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("livrare_faq_question_3")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("livrare_faq_answer_3")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("livrare_faq_question_4")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("livrare_faq_answer_4")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("livrare_faq_question_5")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("livrare_faq_answer_5")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="px-4">
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("livrare_faq_question_6")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("livrare_faq_answer_6")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden mb-16 md:mb-20">
        <div className="  mx-4 md:mx-auto max-w-5xl py-12 px-6 md:py-16 md:px-12 ">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Title - using regular heading instead of MorphingText for stability */}
            <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
              {t("livrare_cta_title")}
            </h2>

            <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg max-w-2xl text-center">
              {t("livrare_cta_description")}
            </p>

            <div className="inline-block">
              <ShimmerButton
                className="px-6 py-2.5 text-base font-medium"
                shimmerColor="#00BFFF"
                shimmerSize="0.05em"
                shimmerDuration="3s"
                borderRadius="8px"
                background="rgba(0, 0, 0, 0.9)"
                onClick={() => (window.location.href = "/catalog")}
              >
                {t("livrare_explore_products")}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
