"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Shield, Clock, CheckCircle2, AlertTriangle, FileText, HelpCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLanguage } from "@/lib/language-context"

// Define warranty periods for different product categories
const warrantyPeriods = [
  {
    category: "garantie_laptops_computers",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty"
  },
  {
    category: "garantie_phones_tablets",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty"
  },
  {
    category: "garantie_tvs",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty"
  },
  {
    category: "garantie_small_electronics",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty"
  },
  {
    category: "garantie_large_appliances",
    standard: "garantie_standard_warranty",
    standardDescription: "garantie_manufacturer_warranty"
  }
]

export default function WarrantyPage() {
  // Get the translation function
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
              {t('garantie_breadcrumb_home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{t('garantie_breadcrumb_warranty')}</span>
          </nav>

          {/* Main title */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t('garantie_badge')}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6">
              {t('garantie_page_title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t('garantie_page_description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
                <Link href="/catalog">
                  {t('garantie_explore_products')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* Warranty coverage section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('garantie_warranty_periods')}</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            {t('garantie_periods_description')}
          </p>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <Table>
              <TableCaption className="text-xs md:text-sm">
                {t('garantie_table_caption')}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] md:w-[300px] text-sm md:text-base">{t('garantie_product_category')}</TableHead>
                  <TableHead className="text-sm md:text-base">{t('garantie_warranty_period')}</TableHead>
                  <TableHead className="text-sm md:text-base">{t('garantie_description')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warrantyPeriods.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium text-sm md:text-base">{t(item.category)}</TableCell>
                    <TableCell className="text-sm md:text-base">{t(item.standard)}</TableCell>
                    <TableCell className="text-sm md:text-base">{t(item.standardDescription)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 md:mt-10 max-w-4xl mx-auto">
            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 items-start">
              <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium mb-1">{t('garantie_about_warranty')}</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t('garantie_about_warranty_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is covered section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('garantie_what_covers')}</h2>
            <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
              {t('garantie_covers_description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-100">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t('garantie_covered')}</span>
                </h3>

                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_manufacturing_defects')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_defective_components')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_preinstalled_software')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_screen_defects')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_battery_issues')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_functional_errors')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-100">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>{t('garantie_not_covered')}</span>
                </h3>

                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_physical_damage')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_normal_wear')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_incorrect_installation')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_environmental_damage')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_user_software')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    <span className="text-sm md:text-base">{t('garantie_commercial_use')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 items-start">
              <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium mb-1">{t('garantie_authorized_service')}</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t('garantie_service_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('garantie_faq_title')}</h2>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto">
            {t('garantie_faq_description')}
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('garantie_faq_question_1')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('garantie_faq_answer_1')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('garantie_faq_question_2')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('garantie_faq_answer_2')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('garantie_faq_question_3')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('garantie_faq_answer_3')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('garantie_faq_question_4')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('garantie_faq_answer_4')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('garantie_faq_question_5')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('garantie_faq_answer_5')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-base md:text-lg text-left">{t('garantie_faq_question_6')}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t('garantie_faq_answer_6')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('garantie_cta_title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('garantie_cta_description')}
          </p>

          <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
            <Link href="/catalog">
              {t('garantie_explore_products')}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
