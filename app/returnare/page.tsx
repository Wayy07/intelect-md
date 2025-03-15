"use client"

import { useState } from "react"
import { ChevronRight, ArrowLeft, CheckCircle2, FileText, HelpCircle, CalendarCheck, RefreshCw, Clock, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/lib/language-context"

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
]

export default function ReturnPolicy() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero section */}
      <section className="relative pb-10 md:pb-16 pt-16 md:pt-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4"></div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-primary/10 rounded-full"></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 border border-primary/10 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border border-primary/10 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 md:mb-12">
            <Link href="/" className="hover:text-primary transition-colors">
              {t('returnare_breadcrumb_home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{t('returnare_breadcrumb_return')}</span>
          </nav>

          {/* Main title */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t('returnare_badge')}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6">
              {t('returnare_page_title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t('returnare_page_description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
                <Link href="/catalog">
                  {t('returnare_explore_products')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Table section - add responsive styles for mobile */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('returnare_conditions_title')}</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            {t('returnare_conditions_description')}
          </p>

          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%] text-sm md:text-base">{t('returnare_product_type')}</TableHead>
                    <TableHead className="w-[20%] text-sm md:text-base">{t('returnare_period')}</TableHead>
                    <TableHead className="w-[25%] text-sm md:text-base">{t('returnare_options')}</TableHead>
                    <TableHead className="w-[30%] text-sm md:text-base">{t('returnare_conditions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnScenarios.map((scenario, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm md:text-base">{t(scenario.type)}</TableCell>
                      <TableCell className="text-sm md:text-base">{t(scenario.period)}</TableCell>
                      <TableCell className="text-sm md:text-base">{t(scenario.options)}</TableCell>
                      <TableCell className="text-xs md:text-sm">{t(scenario.conditions)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile-only expanded information */}
          <div className="sm:hidden mt-4 space-y-4 px-4 max-w-4xl mx-auto">
            {returnScenarios.map((scenario, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-base mb-2">{t(scenario.type)}</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">{t('returnare_options')}:</span> {t(scenario.options)}</p>
                  <p><span className="text-muted-foreground">{t('returnare_conditions')}:</span> {t(scenario.conditions)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 md:mt-10 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 items-start">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium mb-1">{t('returnare_note_important')}</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t('returnare_note_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return process section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('returnare_process_title')}</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            {t('returnare_process_description')}
          </p>

          <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-base md:text-lg font-bold">1</span>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold">{t('returnare_step1_title')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('returnare_step1_description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-base md:text-lg font-bold">2</span>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold">{t('returnare_step2_title')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('returnare_step2_description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-base md:text-lg font-bold">3</span>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold">{t('returnare_step3_title')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('returnare_step3_description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-base md:text-lg font-bold">4</span>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold">{t('returnare_step4_title')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('returnare_step4_description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-base md:text-lg font-bold">5</span>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold">{t('returnare_step5_title')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('returnare_step5_description')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 md:mb-4 flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-base md:text-lg font-bold">6</span>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold">{t('returnare_step6_title')}</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('returnare_step6_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange process for used products */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('returnare_exchange_title')}</h2>
            <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
              {t('returnare_exchange_description')}
            </p>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="space-y-5 md:space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="mt-1 flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base md:text-lg font-medium">{t('returnare_evaluation_title')}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t('returnare_evaluation_description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="mt-1 flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base md:text-lg font-medium">{t('returnare_new_product_title')}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t('returnare_new_product_description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="mt-1 flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base md:text-lg font-medium">{t('returnare_price_diff_title')}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t('returnare_price_diff_description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="mt-1 flex h-7 w-7 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base md:text-lg font-medium">{t('returnare_exchange_completion_title')}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t('returnare_exchange_completion_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('returnare_faq_title')}</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            {t('returnare_faq_description')}
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('returnare_faq_question_1')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('returnare_faq_answer_1')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('returnare_faq_question_2')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('returnare_faq_answer_2')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('returnare_faq_question_3')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('returnare_faq_answer_3')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('returnare_faq_question_4')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('returnare_faq_answer_4')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('returnare_faq_question_5')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('returnare_faq_answer_5')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('returnare_cta_title')}</h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
              {t('returnare_cta_description')}
            </p>
            <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
              <Link href="/catalog">
                {t('returnare_explore_products')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
