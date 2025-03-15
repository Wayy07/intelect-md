"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Truck,
  ShieldCheck,
  RefreshCw
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Advantage {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
}

export default function Advantages() {
  const { t } = useLanguage()

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  // Define advantages
  const advantages: Advantage[] = [
    {
      id: 1,
      title: t("fastDelivery"),
      description: t("fastDeliveryDescription"),
      titleKey: "fastDelivery",
      descriptionKey: "fastDeliveryDescription",
      icon: <Truck className="h-6 w-6 md:h-8 md:w-8" />,
    },
    {
      id: 2,
      title: t("qualityGuarantee"),
      description: t("qualityGuaranteeDescription"),
      titleKey: "qualityGuarantee",
      descriptionKey: "qualityGuaranteeDescription",
      icon: <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />,
    },
    {
      id: 3,
      title: t("easyReturn"),
      description: t("easyReturnDescription"),
      titleKey: "easyReturn",
      descriptionKey: "easyReturnDescription",
      icon: <RefreshCw className="h-6 w-6 md:h-8 md:w-8" />,
    }
  ]

  // Determine if page has been scrolled to this component
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('avantaje-section')
      if (element) {
        const position = element.getBoundingClientRect()

        // If element is in viewport
        if (position.top < window.innerHeight && position.bottom >= 0) {
          setIsVisible(true)
        }
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)

    // Check visibility on mount
    handleScroll()

    // Clean up
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="avantaje-section" className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {t("ourAdvantages")}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-gray-600">
            {t("whyChooseUs")}
          </p>
        </div>

        {/* Desktop View (Grid) - Hidden on Mobile */}
        <div className="hidden md:block">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {advantages.map((advantage) => (
              <motion.div
                key={advantage.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
                variants={itemVariants}
              >
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 opacity-0  transition-all duration-300"></div>
                    <div className="bg-white p-4 rounded-full border border-gray-100 shadow-sm relative z-10 group-hover:translate-y-[-5px] transition-transform duration-300">
                      <div className="text-primary">
                        {advantage.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600">
                    {advantage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile View (Compact Cards) - Hidden on Desktop */}
        <div className="md:hidden">
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {advantages.map((advantage) => (
              <motion.div
                key={advantage.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                variants={itemVariants}
              >
                <div className="p-4 flex items-center">
                  <div className="flex-shrink-0 bg-white mr-4 p-3 rounded-full border border-gray-100 shadow-sm">
                    <div className="text-primary">
                      {advantage.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {advantage.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-14 text-center">
          <p className="text-gray-900 font-medium mb-6">
            {t("satisfiedCustomers")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <div className="w-14 h-10 md:w-16 md:h-12 bg-gray-100 rounded-md border border-gray-200 opacity-70 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-10 md:w-16 md:h-12 bg-gray-100 rounded-md border border-gray-200 opacity-70 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-10 md:w-16 md:h-12 bg-gray-100 rounded-md border border-gray-200 opacity-70 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-10 md:w-16 md:h-12 bg-gray-100 rounded-md border border-gray-200 opacity-70 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-10 md:w-16 md:h-12 bg-gray-100 rounded-md border border-gray-200 opacity-70 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
