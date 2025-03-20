"use client";

import { useState } from "react";
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  HelpCircle,
  CalendarCheck,
  RefreshCw,
  Clock,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/lib/language-context";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MorphingText } from "@/components/magicui/morphing-text";

// Define return scenarios
const returnScenarios = [
  {
    type: "returnare_new_products",
    period: "returnare_30_days",
    options: "returnare_full_refund_exchange",
    conditions: "returnare_new_condition",
  },
  {
    type: "returnare_refurbished_products",
    period: "returnare_30_days",
    options: "returnare_full_refund_exchange",
    conditions: "returnare_used_condition",
  },
  {
    type: "returnare_used_products",
    period: "returnare_30_days",
    options: "returnare_full_refund_exchange",
    conditions: "returnare_used_condition",
  },
];

export default function ReturnPolicy() {
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
              {t("returnare_breadcrumb_home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {t("returnare_breadcrumb_return")}
            </span>
          </nav>

          {/* Main title */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("returnare_badge")}
            </Badge>

            <div className="mb-4 md:mb-6">
              {/* Mobile Morphing Text - shorter texts only */}
              <div className="md:hidden">
                <MorphingText
                  texts={[t("returnare_page_title"), t("returnare_badge")]}
                  className="h-12 text-[25pt]"
                />
              </div>

              {/* Desktop Morphing Text - full text options */}
              <div className="hidden md:flex">
                <MorphingText
                  texts={[
                    t("returnare_page_title"),
                    t("returnare_badge"),
                    t("returnare_process_title"),
                  ]}
                  className="h-16 text-[40pt] lg:text-[50pt] max-w-[2000px] mx-auto"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t("returnare_page_description")}
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
                {t("returnare_explore_products")}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>

      {/* Table section - add responsive styles for mobile */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
              {t("returnare_conditions")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("returnare_conditions_title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("returnare_conditions_description")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10 shadow-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-primary/10">
                    <TableHead className="w-[25%] text-sm md:text-base">
                      {t("returnare_product_type")}
                    </TableHead>
                    <TableHead className="w-[20%] text-sm md:text-base">
                      {t("returnare_period")}
                    </TableHead>
                    <TableHead className="w-[25%] text-sm md:text-base">
                      {t("returnare_options")}
                    </TableHead>
                    <TableHead className="w-[30%] text-sm md:text-base">
                      {t("returnare_conditions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnScenarios.map((scenario, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        "border-b border-primary/5 transition-colors",
                        index % 2 === 0
                          ? "hover:bg-primary/5"
                          : "bg-primary/3 hover:bg-primary/7"
                      )}
                    >
                      <TableCell className="font-medium text-sm md:text-base">
                        {t(scenario.type)}
                      </TableCell>
                      <TableCell className="text-sm md:text-base">
                        {t(scenario.period)}
                      </TableCell>
                      <TableCell className="text-sm md:text-base">
                        {t(scenario.options)}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {t(scenario.conditions)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile-only expanded information */}
          <div className="sm:hidden mt-6 space-y-4 px-4 max-w-4xl mx-auto">
            {returnScenarios.map((scenario, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-md overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t(scenario.type)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between border-b border-dashed border-primary/10 pb-2">
                      <span className="text-muted-foreground">
                        {t("returnare_period")}:
                      </span>
                      <span className="font-medium">{t(scenario.period)}</span>
                    </p>
                    <p className="flex justify-between border-b border-dashed border-primary/10 pb-2">
                      <span className="text-muted-foreground">
                        {t("returnare_options")}:
                      </span>
                      <span className="font-medium">{t(scenario.options)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("returnare_conditions")}:
                      </span>
                      <span className="font-medium">
                        {t(scenario.conditions)}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 md:mt-10 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="bg-gradient-to-r from-blue-50/80 to-white/80 p-5 rounded-xl flex gap-4 items-start border border-blue-200/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-70"></div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex-shrink-0 flex items-center justify-center text-blue-500 mt-1 relative border border-blue-200/50 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="relative">
                <h4 className="font-semibold text-base mb-1.5 text-blue-700">
                  {t("returnare_note_important")}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("returnare_note_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return process section */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
              {t("returnare_process")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("returnare_process_title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("returnare_process_description")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <Card
                key={step}
                className="bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="text-base font-bold">{step}</span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {t(`returnare_step${step}_title`)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-2">
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t(`returnare_step${step}_description`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange process for used products */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors">
                {t("returnare_exchange")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("returnare_exchange_title")}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("returnare_exchange_description")}
              </p>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-amber-500/30 transition-all hover:shadow-xl p-2 md:p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="space-y-6 md:space-y-8 relative z-10 p-4 md:p-6">
                {[
                  "evaluation",
                  "new_product",
                  "price_diff",
                  "exchange_completion",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 group/item"
                  >
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex-shrink-0 flex items-center justify-center text-amber-600 mt-1 group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium text-amber-700 group-hover/item:text-amber-600 transition-colors">
                        {t(`returnare_${item}_title`)}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {t(`returnare_${item}_description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("returnare_faq")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("returnare_faq_title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("returnare_faq_description")}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion
              type="single"
              collapsible
              className="w-full bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-md overflow-hidden"
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <AccordionItem
                  key={item}
                  value={`item-${item}`}
                  className={
                    item < 5 ? "border-b border-primary/10 px-4" : "px-4"
                  }
                >
                  <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                    {t(`returnare_faq_question_${item}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base pb-4">
                    {t(`returnare_faq_answer_${item}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden mb-16 md:mb-20">
        <div className="mx-4 md:mx-auto max-w-5xl py-12 px-6 md:py-16 md:px-12">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">
              {t("returnare_cta_title")}
            </h2>

            <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg max-w-2xl text-center">
              {t("returnare_cta_description")}
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
                  {t("returnare_explore_products")}
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
