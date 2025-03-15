"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, CreditCard, Calendar, CheckCircle2, HelpCircle, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export default function CreditPage() {
  const { t } = useLanguage()
  const [samplePrice, setSamplePrice] = useState(10000) // 10,000 MDL default price

  // Different durations in months
  const durations = [4, 6, 8, 12, 24, 36]

  // Calculate monthly payment
  const calculateMonthlyPayment = (price: number, months: number) => {
    return Math.round(price / months)
  }

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
              {t("home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{t("creditPageTitle")}</span>
          </nav>

          {/* Main title */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("zeroCreditBadge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6">
              <span>{t("creditPageTitle").split(" ")[0]}</span> <span className="text-primary">{t("creditPageTitle").split(" ")[1]} {t("creditPageTitle").split(" ")[2]}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t("creditPageDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
                <Link href="/catalog">
                  {t("exploreProducts")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto" asChild>
                <a href="#calculator">
                  {t("rateCalculator")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>




      {/* Financing terms section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">{t("availableFinancingPeriods")}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("chooseFinancingPeriodDescription")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {durations.map((month) => (
              <Card key={month} className="text-center hover:border-primary/50 transition-all hover:shadow cursor-pointer">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-2xl">{month}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("months")}</p>
                </CardContent>
                <CardFooter className="pb-4 pt-0 justify-center">
                  <Badge variant="outline" className="font-normal">
                    {t("zeroInterest")}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator section */}
      <section id="calculator" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">{t("monthlyRateCalculator")}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              {t("calculateMonthlyRateDescription")}
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t("samplePrice")}: {samplePrice.toLocaleString('ro-RO')} MDL</h3>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setSamplePrice(5000)}
                      variant={samplePrice === 5000 ? "default" : "outline"}
                      className="mr-2"
                    >
                      5.000 MDL
                    </Button>
                    <Button
                      onClick={() => setSamplePrice(10000)}
                      variant={samplePrice === 10000 ? "default" : "outline"}
                      className="mr-2"
                    >
                      10.000 MDL
                    </Button>
                    <Button
                      onClick={() => setSamplePrice(20000)}
                      variant={samplePrice === 20000 ? "default" : "outline"}
                      className="mr-2"
                    >
                      20.000 MDL
                    </Button>
                    <Button
                      onClick={() => setSamplePrice(30000)}
                      variant={samplePrice === 30000 ? "default" : "outline"}
                    >
                      30.000 MDL
                    </Button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-4">{t("monthlyRates")}</h4>
                  <ul className="space-y-3">
                    {durations.map((month) => (
                      <li key={month} className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                        <span>{month} {t("months")}:</span>
                        <span className="font-semibold">{calculateMonthlyPayment(samplePrice, month).toLocaleString('ro-RO')} MDL/{t("months").slice(0, -1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg flex gap-3 items-start">
                <Calculator className="h-5 w-5 text-primary mt-1" />
                <p className="text-sm">
                  <span className="font-medium">{t("calculationExample")}</span> {t("calculationDescription")
                    .replace("{price}", samplePrice.toLocaleString('ro-RO'))
                    .replace("{months}", "12")
                    .replace("{monthlyPayment}", calculateMonthlyPayment(samplePrice, 12).toLocaleString('ro-RO'))}
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/catalog">
                  {t("exploreProducts")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">{t("howItWorks")}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("howItWorksDescription")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("step1Title")}</h3>
                <p className="text-muted-foreground">
                  {t("step1Description")}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("step2Title")}</h3>
                <p className="text-muted-foreground">
                  {t("step2Description")}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("step3Title")}</h3>
                <p className="text-muted-foreground">
                  {t("step3Description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">{t("frequentlyAskedQuestions")}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("faqDescription")}
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion1")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer1")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion2")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer2")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion3")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer3")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion4")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer4")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion5")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer5")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion6")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer6")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-base md:text-lg text-left">{t("faqQuestion7")}</AccordionTrigger>
                <AccordionContent className="text-sm md:text-base">
                  {t("faqAnswer7")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("readyToBuyInInstallments")}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("readyToBuyDescription")}
          </p>

          <Button size="lg" className="rounded-full" asChild>
            <Link href="/catalog">
              {t("exploreProducts")}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
