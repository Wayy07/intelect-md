"use client";

import React from "react";
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

export default function ContactPage() {
  const { t } = useLanguage();

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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              <HyperText className="py-0">{t("contact_page_title")}</HyperText>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("contact_subtitle")}
            </p>
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

        {/* Resources section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <HyperText className="py-0">
                {t("contact_resources_title")}
              </HyperText>
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("contact_resources_description")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="h-full shadow-md hover:shadow-lg border-t-4 border-t-primary/70 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-primary group-hover:translate-x-1 transition-transform">
                    {t("contact_delivery_title")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("contact_delivery_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("contact_delivery_description")}
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <ShimmerButton
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  shimmerColor="#00BFFF"
                  onClick={() => (window.location.href = "/livrare")}
                >
                  {t("learn_more")}
                </ShimmerButton>
              </CardFooter>
            </Card>

            <Card className="h-full shadow-md hover:shadow-lg border-t-4 border-t-primary/70 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-primary group-hover:translate-x-1 transition-transform">
                    {t("contact_warranty_title")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("contact_warranty_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("contact_warranty_description")}
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <ShimmerButton
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  shimmerColor="#00BFFF"
                  onClick={() => (window.location.href = "/garantie")}
                >
                  {t("learn_more")}
                </ShimmerButton>
              </CardFooter>
            </Card>

            <Card className="h-full shadow-md hover:shadow-lg border-t-4 border-t-primary/70 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Send className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-primary group-hover:translate-x-1 transition-transform">
                    {t("contact_return_title")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("contact_return_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("contact_return_description")}
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <ShimmerButton
                  className="w-full group-hover:scale-[1.02] transition-transform"
                  shimmerColor="#00BFFF"
                  onClick={() => (window.location.href = "/returnare")}
                >
                  {t("learn_more")}
                </ShimmerButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
