"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  MapPin,
  ExternalLink,
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
import { useLanguage } from "@/lib/language-context";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MorphingText } from "@/components/magicui/morphing-text";
import { cn } from "@/lib/utils";

// Define warranty periods for different product categories
const warrantyPeriods = [
  {
    category: "garantie_laptops_computers",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty",
  },
  {
    category: "garantie_phones_tablets",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty",
  },
  {
    category: "garantie_tvs",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty",
  },
  {
    category: "garantie_small_electronics",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty",
  },
  {
    category: "garantie_large_appliances",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty",
  },
];

export default function WarrantyPage() {
  // Get the translation function
  const { t } = useLanguage();

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
              {t("garantie_breadcrumb_home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {t("garantie_breadcrumb_warranty")}
            </span>
          </nav>

          {/* Main title */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("garantie_badge")}
            </Badge>

            <div className="mb-4 md:mb-6">
              {/* Mobile Morphing Text - shorter texts only */}
              <div className="md:hidden">
                <MorphingText
                  texts={[t("garantie_page_title"), t("garantie_badge")]}
                  className="h-12 text-[25pt]"
                />
              </div>

              {/* Desktop Morphing Text - full text options */}
              <div className="hidden md:flex">
                <MorphingText
                  texts={[
                    t("garantie_page_title"),
                    t("garantie_badge"),
                    t("garantie_authorized_service"),
                  ]}
                  className="h-16 text-[40pt] lg:text-[50pt] max-w-[2000px] mx-auto"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t("garantie_page_description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <ShimmerButton
                className="w-full sm:w-auto px-6 py-3"
                shimmerColor="#00BFFF"
                shimmerSize="0.05em"
                shimmerDuration="3s"
                borderRadius="8px"
                background="rgba(0, 0, 0, 0.9)"
                onClick={() => (window.location.href = "/catalog")}
              >
                {t("garantie_explore_products")}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty coverage section */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
              {t("garantie_warranty_periods")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("garantie_warranty_periods")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("garantie_periods_description")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg overflow-x-auto mb-6">
              <Table>
                <TableCaption className="text-xs md:text-sm">
                  {t("garantie_table_caption")}
                </TableCaption>
                <TableHeader>
                  <TableRow className="border-b border-primary/10">
                    <TableHead className="w-[40%] md:w-[300px] text-sm md:text-base">
                      {t("garantie_product_category")}
                    </TableHead>
                    <TableHead className="text-sm md:text-base">
                      {t("garantie_warranty_period")}
                    </TableHead>
                    <TableHead className="text-sm md:text-base">
                      {t("garantie_description")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warrantyPeriods.map((item, index) => (
                    <TableRow
                      key={item.category}
                      className={cn(
                        "border-b border-primary/5 transition-colors",
                        index % 2 === 0
                          ? "hover:bg-primary/5"
                          : "bg-primary/3 hover:bg-primary/7"
                      )}
                    >
                      <TableCell className="font-medium text-sm md:text-base">
                        {t(item.category)}
                      </TableCell>
                      <TableCell className="text-sm md:text-base">
                        {t(item.standard)}
                      </TableCell>
                      <TableCell className="text-sm md:text-base">
                        {t(item.standardDescription)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-gradient-to-r from-blue-50/80 to-white/80 p-5 rounded-xl flex gap-4 items-start border border-blue-200/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-70"></div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex-shrink-0 flex items-center justify-center text-blue-500 mt-1 relative border border-blue-200/50 shadow-sm">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="relative">
                <h4 className="font-semibold text-base mb-1.5 text-blue-700">
                  {t("garantie_about_warranty")}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("garantie_about_warranty_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is covered section */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                {t("garantie_coverage")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("garantie_what_covers")}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("garantie_covers_description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              <Card className="bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-green-500/30 transition-all hover:shadow-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                      {t("garantie_covered")}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_manufacturing_defects")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_defective_components")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_preinstalled_software")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_screen_defects")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_battery_issues")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5 group-hover/item:bg-green-500 group-hover/item:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_functional_errors")}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-red-500/30 transition-all hover:shadow-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-red-500 transition-colors">
                      {t("garantie_not_covered")}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center text-red-500 mt-0.5 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_physical_damage")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center text-red-500 mt-0.5 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_normal_wear")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center text-red-500 mt-0.5 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_incorrect_installation")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center text-red-500 mt-0.5 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_environmental_damage")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center text-red-500 mt-0.5 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_user_software")}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <div className="h-6 w-6 rounded-full bg-red-500/10 flex-shrink-0 flex items-center justify-center text-red-500 mt-0.5 group-hover/item:bg-red-500 group-hover/item:text-white transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm md:text-base">
                        {t("garantie_commercial_use")}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-blue-50/80 to-white/80 p-5 rounded-xl flex gap-4 items-start border border-blue-200/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-70"></div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex-shrink-0 flex items-center justify-center text-blue-500 mt-1 relative border border-blue-200/50 shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div className="relative">
                <h4 className="font-semibold text-base mb-1.5 text-blue-700">
                  {t("garantie_authorized_service")}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("garantie_service_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("garantie_faq")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("garantie_faq_title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("garantie_faq_description")}
            </p>
          </div>

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
                  {t("garantie_faq_question_1")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("garantie_faq_answer_1")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("garantie_faq_question_2")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("garantie_faq_answer_2")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("garantie_faq_question_3")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("garantie_faq_answer_3")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("garantie_faq_question_4")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("garantie_faq_answer_4")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("garantie_faq_question_5")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("garantie_faq_answer_5")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="px-4">
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("garantie_faq_question_6")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("garantie_faq_answer_6")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden mb-16 md:mb-20">
        <div className="mx-4 md:mx-auto max-w-5xl py-12 px-6 md:py-16 md:px-12">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">
              {t("garantie_cta_title")}
            </h2>

            <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg max-w-2xl text-center">
              {t("garantie_cta_description")}
            </p>

            <div className="inline-block">
              <ShimmerButton
                className="px-10 py-4 font-medium text-lg rounded-full group relative"
                shimmerColor="#00BFFF"
                shimmerSize="0.03em"
                shimmerDuration="2.5s"
                borderRadius="9999px"
                background="rgba(0, 0, 0, 0.9)"
                onClick={() => (window.location.href = "/catalog")}
              >
                <span className="flex items-center gap-2">
                  {t("garantie_explore_products")}
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
