"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useLanguage } from "@/lib/language-context";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MorphingText } from "@/components/magicui/morphing-text";
import { cn } from "@/lib/utils";

export default function CreditPage() {
  const { t } = useLanguage();
  const [samplePrice, setSamplePrice] = useState(10000); // 10,000 MDL default price

  // Different durations in months
  const durations = [4, 6, 8, 12, 24, 36];

  // Calculate monthly payment
  const calculateMonthlyPayment = (price: number, months: number) => {
    return Math.round(price / months);
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
        {/* Background decorations */}

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 md:mb-12">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {t("creditPageTitle")}
            </span>
          </nav>

          {/* Main title */}
          <div className="text-center  mx-auto">
            <Badge className="mb-3 md:mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {t("zeroCreditBadge")}
            </Badge>

            <div className="mb-4 md:mb-6">
              {/* Mobile Morphing Text - shorter texts only */}
              <div className="md:hidden">
                <MorphingText
                  texts={[t("creditPageTitle")]}
                  className="h-12 text-[25pt]"
                />
              </div>

              {/* Desktop Morphing Text - full text options */}
              <div className="hidden md:flex">
                <MorphingText
                  texts={[
                    t("creditPageTitle"),
                    t("zeroCreditBadge"),
                    t("readyToBuyInInstallments"),
                  ]}
                  className="h-16 text-[40pt] lg:text-[50pt] max-w-[2000px] mx-auto"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
              {t("creditPageDescription")}
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
                {t("exploreProducts")}
              </ShimmerButton>
              <ShimmerButton
                className="w-full sm:w-auto px-6 py-3 text-white"
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
                {t("rateCalculator")}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>

      {/* Financing terms section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("availableFinancingPeriods")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("chooseFinancingPeriodDescription")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto ">
            {durations.map((month) => (
              <Card
                key={month}
                className="bg-white/80 backdrop-blur-sm border border-primary/10 hover:border-primary/50 transition-all hover:shadow-xl  group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {month} <span className="text-lg">{t("months")}</span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t("monthlyPayment")}
                      </span>
                      <span className="font-medium">
                        {calculateMonthlyPayment(10000, month).toLocaleString(
                          "ro-RO"
                        )}{" "}
                        MDL
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t("totalPayment")}
                      </span>
                      <span className="font-medium">10.000 MDL</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6 flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className="font-normal bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {t("zeroInterest")}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("howItWorks")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("howItWorksDescription")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <Card className="h-full bg-white/80 backdrop-blur-sm border border-primary/10 shadow-md hover:shadow-lg transition-all p-6 group-hover:border-primary/30">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {t("step1Title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("step1Description")}
                  </p>
                </div>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute top-0 left-6 h-full w-[2px] bg-primary/20 -z-10 md:hidden"></div>
              <Card className="h-full bg-white/80 backdrop-blur-sm border border-primary/10 shadow-md hover:shadow-lg transition-all p-6 group-hover:border-primary/30">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {t("step2Title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("step2Description")}
                  </p>
                </div>
              </Card>
            </div>

            <div className="relative group">
              <Card className="h-full bg-white/80 backdrop-blur-sm border border-primary/10 shadow-md hover:shadow-lg transition-all p-6 group-hover:border-primary/30">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {t("step3Title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("step3Description")}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("frequentlyAskedQuestions")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t("faqDescription")}
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
                  {t("faqQuestion1")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer1")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("faqQuestion2")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer2")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("faqQuestion3")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer3")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("faqQuestion4")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer4")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("faqQuestion5")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer5")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="border-b border-primary/10 px-4"
              >
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("faqQuestion6")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer6")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="px-4">
                <AccordionTrigger className="text-base md:text-lg text-left hover:text-primary transition-colors py-4">
                  {t("faqQuestion7")}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base pb-4">
                  {t("faqAnswer7")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden mb-16 md:mb-20">
        <div className=" mx-4 md:mx-auto max-w-5xl py-12 px-6 md:py-16 md:px-12 ">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">
              {t("readyToBuyInInstallments")}
            </h2>

            <p className="text-muted-foreground mb-8 md:mb-10 text-base md:text-lg max-w-2xl text-center">
              {t("readyToBuyDescription")}
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
                {t("exploreProducts")}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
