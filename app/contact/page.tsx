"use client"

import React from "react"
import Link from "next/link"
import { Phone, Mail, Clock, MapPin, ExternalLink, MapIcon, Send, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="container px-4 py-8 md:py-16 max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{t('contact_page_title')}</h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
          {t('contact_page_description')}
        </p>
      </div>

      {/* Map and Address section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden h-full">
            <CardContent className="p-0 overflow-hidden h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d87002.10673310803!2d28.8463709!3d47.0438445!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97bfb76497e13%3A0x33477dcd2ecce7c1!2sIntelect!5e0!3m2!1sen!2s!4v1741961995937!5m2!1sen!2s"
                className="border-0 w-full h-full"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col">
          <Card className="flex-1 bg-primary/5 border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">{t('contact_location_title')}</CardTitle>
              <CardDescription>{t('contact_location_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 mt-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{t('contact_address_label')}</h3>
                  <p className="text-muted-foreground">
                    {t('contact_address').split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index === 0 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 mt-1">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{t('contact_schedule_label')}</h3>
                  <div className="text-muted-foreground text-sm">
                    <div className="flex gap-2">
                      <span className="min-w-[100px]">{t('contact_monday_friday')}</span>
                      <span>9:00 - 18:00</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="min-w-[100px]">{t('contact_saturday')}</span>
                      <span>10:00 - 16:00</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="min-w-[100px]">{t('contact_sunday')}</span>
                      <span>{t('contact_closed')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0 mt-1">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{t('contact_us_label')}</h3>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">{t('contact_phone')} <a href="tel:+37360175111" className="text-primary hover:underline">+373 601 75 111</a></p>
                    <p className="text-muted-foreground text-sm">{t('contact_email')} <a href="mailto:info@intelect.md" className="text-primary hover:underline">intelect@gmail.com</a></p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full" asChild>
                <a
                  href="https://maps.google.com/maps?q=intelect+chisinau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  {t('contact_open_google_maps')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>


      {/* Resources section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('contact_resources_title')}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t('contact_resources_description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/livrare" className="group">
            <Card className={cn(
              "h-full shadow-sm hover:shadow-md transition-all duration-200",
              "group-hover:border-primary/50"
            )}>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">{t('contact_delivery_title')}</CardTitle>
                <CardDescription>{t('contact_delivery_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('contact_delivery_description')}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/garantie" className="group">
            <Card className={cn(
              "h-full shadow-sm hover:shadow-md transition-all duration-200",
              "group-hover:border-primary/50"
            )}>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">{t('contact_warranty_title')}</CardTitle>
                <CardDescription>{t('contact_warranty_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('contact_warranty_description')}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/returnare" className="group">
            <Card className={cn(
              "h-full shadow-sm hover:shadow-md transition-all duration-200",
              "group-hover:border-primary/50"
            )}>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">{t('contact_return_title')}</CardTitle>
                <CardDescription>{t('contact_return_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t('contact_return_description')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">{t('contact_cta_title')}</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-base md:text-lg">
          {t('contact_cta_description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" size="lg" className="px-8" asChild>
            <Link href="/catalog">
              {t('contact_explore_catalog')}
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8" asChild>
            <a href="tel:+37360175111">
              <Phone className="mr-2 h-4 w-4" />
              {t('contact_call_now')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
