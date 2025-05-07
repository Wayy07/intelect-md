"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  ExternalLink,
  MapIcon,
  Send,
  Calendar,
  Truck,
  Package,
  Calculator,
  Info,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { HyperText } from "@/components/magicui/hyper-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { GridPattern } from "@/components/magicui/grid-pattern";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

export default function ContactPage() {
  const { t } = useLanguage();
  const [cartTotal, setCartTotal] = useState<number>(3000);
  const [selectedRegion, setSelectedRegion] = useState<string>("Chișinău");

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

  const calculateShippingCost = () => {
    return 0;
  };

  const getTotalPrice = () => {
    return cartTotal + calculateShippingCost();
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
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

      <div className="container max-w-screen-xl">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 -z-10">
            <GridPattern
              width={40}
              height={40}
              x={-1}
              y={-1}
              className="absolute inset-0 h-full w-full fill-gray-100 stroke-gray-950/5 dark:fill-gray-950 dark:stroke-gray-200/5 [mask-image:radial-gradient(black,transparent_70%)]"
            />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("contact_page_title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("contact_subtitle")}
            </p>

            {/* About our smart store section */}
            {/* <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-md border border-primary/10">
              <h2 className="text-2xl font-semibold mb-4 text-primary"> {t("contact_about_us_title")}
</h2>
                <p className="text-muted-foreground mb-4">
                    {t("contact_about_us")}

              </p>
            <p className="text-muted-foreground">
                {t("contact_about_us_1")}

              </p>
            </div> */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShimmerButton
                className="w-full sm:w-auto"
                shimmerColor="#00BFFF"
                onClick={() => (window.location.href = "/#catalog")}
              >
                {t("contact_explore_catalog")}
              </ShimmerButton>
              <ShimmerButton
                className="w-full sm:w-auto"
                shimmerColor="#FFBF00"
                onClick={() =>
                  (window.location.href = `tel:${t("company_phone")}`)
                }
              >
                <Phone className="w-4 h-4 mr-2" />
                {t("contact_call_us")}
              </ShimmerButton>
            </div>
          </div>
        </section>

        {/* Map and Address section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-primary/10 shadow-xl overflow-hidden h-full relative group">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>

              <div className="absolute -inset-0.5 -z-10 opacity-30 group-hover:opacity-40 transition-opacity rounded-xl bg-gradient-to-br from-primary/30 via-primary/5 to-primary/30"></div>

              <CardContent className="p-0 overflow-hidden h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21755.92352553237!2d28.8385912939509!3d47.03060630310927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97bfb76497e13%3A0x33477dcd2ecce7c1!2sIntelect!5e0!3m2!1sen!2s!4v1742441626689!5m2!1sen!2s"
                  width="600"
                  height="450"
                  style={{ border: "0" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="border-0 w-full h-full group-hover:scale-[1.01] transition-transform"
                ></iframe>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col">
            <Card className="flex-1 bg-gradient-to-br from-primary/5 via-primary/8 to-primary/5 border-none shadow-lg overflow-hidden group relative">
              <div className="absolute inset-0 -z-10 opacity-50">
                <GridPattern
                  width={20}
                  height={20}
                  className="absolute inset-0 h-full w-full fill-primary/5 stroke-primary/10 [mask-image:radial-gradient(black_30%,transparent_70%)]"
                />
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {t("contact_location_title")}
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  {t("contact_location_subtitle")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pb-6">
                <div className="flex items-start gap-4 group/item hover:bg-primary/5 p-3 rounded-lg transition-colors">
                  <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 mt-1 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                    <MapPin className="h-5 w-5 text-primary group-hover/item:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1 group-hover/item:text-primary transition-colors">
                      {t("contact_address_label")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("contact_address")
                        .split("\n")
                        .map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index === 0 && <br />}
                          </React.Fragment>
                        ))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/item hover:bg-primary/5 p-3 rounded-lg transition-colors">
                  <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 mt-1 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                    <Calendar className="h-5 w-5 text-primary group-hover/item:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1 group-hover/item:text-primary transition-colors">
                      {t("contact_schedule_label")}
                    </h3>
                    <div className="text-muted-foreground text-sm space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <span className="min-w-[100px] font-medium">
                          {t("contact_monday_friday")}
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                          9:00 - 18:00
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="min-w-[100px] font-medium">
                          {t("contact_saturday")}
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                          10:00 - 16:00
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="min-w-[100px] font-medium">
                          {t("contact_sunday")}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 text-muted-foreground px-2 py-0.5 rounded-md">
                          {t("contact_closed")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/item hover:bg-primary/5 p-3 rounded-lg transition-colors">
                  <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 mt-1 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                    <Send className="h-5 w-5 text-primary group-hover/item:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1 group-hover/item:text-primary transition-colors">
                      {t("contact_us_label")}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center group/contact hover:translate-x-1 transition-transform">
                        <Phone className="h-4 w-4 text-primary mr-2" />
                        <a
                          href="tel:+37360175111"
                          className="text-primary hover:underline font-medium"
                        >
                          +373 601 75 111
                        </a>
                      </div>
                      <div className="flex items-center group/contact hover:translate-x-1 transition-transform">
                        <Mail className="h-4 w-4 text-primary mr-2" />
                        <a
                          href="mailto:info@intelect.md"
                          className="text-primary hover:underline font-medium"
                        >
                          intelect@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <ShimmerButton
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  shimmerColor="#00BFFF"
                  onClick={() =>
                    window.open(
                      "https://maps.google.com/maps?q=intelect+chisinau",
                      "_blank"
                    )
                  }
                >
                  <MapIcon className="mr-2 h-4 w-4" />
                  {t("contact_open_google_maps")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </ShimmerButton>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Delivery Information Section - New section from Livrare page */}
        <section className="py-16 relative" id="delivery">
          <div className="max-w-5xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {t("livrare_badge") || "Livrare"}
              </Badge>
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                {t("livrare_page_title") || "Informații despre livrare"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("livrare_page_description") || "Vă oferim livrare gratuită în toată țara. Află detalii despre modalitățile de livrare și timpul estimat de livrare."}
              </p>
            </div>

            {/* Standard Delivery Card */}
            <div className="max-w-2xl mx-auto mb-12">
              <Card className="bg-white/80 backdrop-blur-sm border border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative group">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Truck className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle>{t("livrare_standard_delivery") || "Livrare standard"}</CardTitle>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                      {t("livrare_free") || "Gratuită"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">
                        {t("livrare_delivery_time") || "Timp de livrare"}
                      </h4>
                      <ul className="pl-5 space-y-1 text-sm list-disc">
                        <li className="group/item hover:text-primary transition-colors">
                          {t("livrare_chisinau") || "Chișinău: 1-2 zile lucrătoare"}
                        </li>
                        <li className="group/item hover:text-primary transition-colors">
                          {t("livrare_urban_areas") || "Localități urbane: 2-4 zile lucrătoare"}
                        </li>
                        <li className="group/item hover:text-primary transition-colors">
                          {t("livrare_rural_areas") || "Zone rurale: 3-5 zile lucrătoare"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Calculator */}
            <div id="calculator" className="max-w-4xl mx-auto mb-12 bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-center">
                {t("livrare_calculator_title") || "Calculator de livrare"}
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                {t("livrare_calculator_description") || "Calculează costul și timpul estimat de livrare pentru comanda ta"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="region"
                      className="block mb-2 text-sm font-medium"
                    >
                      {t("livrare_select_location") || "Selectează locația"}
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
                      {t("livrare_cart_value") || "Valoarea coșului"}
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
                      {t("livrare_estimated_delivery_time") || "Timp estimat de livrare"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {selectedRegion === "Chișinău"
                        ? "1-2 zile lucrătoare"
                        : selectedRegion === "Zone rurale"
                        ? "3-5 zile lucrătoare"
                        : "2-4 zile lucrătoare"}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {t("livrare_processing_time") || "Procesarea comenzii poate dura 1-2 zile lucrătoare adiționale"}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-primary/10 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">
                    {t("livrare_order_summary") || "Sumar comandă"}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                      <span>{t("livrare_subtotal") || "Subtotal"}:</span>
                      <span>{cartTotal.toLocaleString("ro-RO")} MDL</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                      <span>{t("livrare_delivery_cost") || "Cost livrare"}:</span>
                      <span className="text-green-600 font-medium">
                        {t("livrare_free") || "Gratuită"}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t("livrare_total") || "Total"}:</span>
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
                      {t("livrare_buy_now") || "Cumpără acum"}
                    </ShimmerButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery FAQs */}
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-center">
                {t("livrare_faq_title") || "Întrebări frecvente despre livrare"}
              </h3>

              <Accordion
                type="single"
                collapsible
                className="w-full bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-md overflow-hidden mb-10"
              >
                <AccordionItem
                  value="item-1"
                  className="border-b border-primary/10 px-4"
                >
                  <AccordionTrigger className="text-base text-left hover:text-primary transition-colors py-4">
                    {t("livrare_faq_question_1") || "Cât durează livrarea?"}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm pb-4">
                    {t("livrare_faq_answer_1") || "Timpul de livrare depinde de locația ta. Pentru Chișinău: 1-2 zile, zone urbane: 2-4 zile, zone rurale: 3-5 zile lucrătoare."}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="border-b border-primary/10 px-4"
                >
                  <AccordionTrigger className="text-base text-left hover:text-primary transition-colors py-4">
                    {t("livrare_faq_question_2") || "Cât costă livrarea?"}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm pb-4">
                    {t("livrare_faq_answer_2") || "Livrarea este gratuită pentru toate comenzile în Moldova, indiferent de valoarea comenzii."}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="border-b border-primary/10 px-4"
                >
                  <AccordionTrigger className="text-base text-left hover:text-primary transition-colors py-4">
                    {t("livrare_faq_question_3") || "Pot urmări comanda mea?"}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm pb-4">
                    {t("livrare_faq_answer_3") || "Da, după plasarea comenzii vei primi un email cu un link de urmărire pentru a verifica statusul comenzii tale."}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="px-4"
                >
                  <AccordionTrigger className="text-base text-left hover:text-primary transition-colors py-4">
                    {t("livrare_faq_question_6") || "Ce se întâmplă dacă nu sunt acasă la livrare?"}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm pb-4">
                    {t("livrare_faq_answer_6") || "Curierul va încerca să te contacteze pentru a stabili un nou interval orar de livrare. Dacă nu te poate contacta, va lăsa un aviz și va reîncerca livrarea în următoarea zi lucrătoare."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>



        {/* Support section */}
        {/* ... existing support section ... */}
      </div>
    </div>
  );
}
