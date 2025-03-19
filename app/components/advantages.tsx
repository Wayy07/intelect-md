"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Advantage {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  color: string;
  gradient: string;
}

export default function Advantages() {
  const { t } = useLanguage();

  // More dynamic animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Define advantages with enhanced styling properties
  const advantages: Advantage[] = [
    {
      id: 1,
      title: t("fastDelivery"),
      description: t("fastDeliveryDescription"),
      titleKey: "fastDelivery",
      descriptionKey: "fastDeliveryDescription",
      icon: <Truck className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />,
      color: "text-blue-600",
      gradient: "from-blue-500/20 to-indigo-500/10",
    },
    {
      id: 2,
      title: t("qualityGuarantee"),
      description: t("qualityGuaranteeDescription"),
      titleKey: "qualityGuarantee",
      descriptionKey: "qualityGuaranteeDescription",
      icon: <ShieldCheck className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />,
      color: "text-emerald-600",
      gradient: "from-emerald-500/20 to-green-500/10",
    },
    {
      id: 3,
      title: t("easyReturn"),
      description: t("easyReturnDescription"),
      titleKey: "easyReturn",
      descriptionKey: "easyReturnDescription",
      icon: <RefreshCw className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />,
      color: "text-amber-600",
      gradient: "from-amber-500/20 to-yellow-500/10",
    },
  ];

  // Determine if page has been scrolled to this component
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("avantaje-section");
      if (element) {
        const position = element.getBoundingClientRect();

        // If element is in viewport
        if (position.top < window.innerHeight && position.bottom >= 0) {
          setIsVisible(true);
        }
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Check visibility on mount
    handleScroll();

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="avantaje-section"
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4 sm:px-6 3xl:px-16 3xl:max-w-[80%]">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("ourAdvantages")}
          </motion.h2>
          <motion.div
            className="h-1.5 w-24 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-6"
            initial={{ opacity: 0, width: 0 }}
            animate={
              isVisible ? { opacity: 1, width: 96 } : { opacity: 0, width: 0 }
            }
            transition={{ duration: 0.8, delay: 0.4 }}
          ></motion.div>
          <motion.p
            className="max-w-3xl mx-auto text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t("whyChooseUs")}
          </motion.p>
        </div>

        {/* Desktop View (Grid) - Hidden on Mobile */}
        <div className="hidden md:block">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {advantages.map((advantage) => (
              <motion.div
                key={advantage.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-500 group"
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 10 },
                }}
              >
                <div className="p-8 md:p-10 flex flex-col items-center text-center h-full">
                  <div className="mb-6 relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${advantage.gradient} rounded-full scale-150 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500`}
                    ></div>
                    <div
                      className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${advantage.gradient} p-5 group-hover:translate-y-[-5px] transition-all duration-500`}
                    >
                      <div className={`${advantage.color}`}>
                        {advantage.icon}
                      </div>
                    </div>
                  </div>
                  <h3
                    className={`text-xl font-bold mb-4 group-hover:${advantage.color} transition-colors duration-300`}
                  >
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
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
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {advantages.map((advantage) => (
              <motion.div
                key={advantage.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-5 flex items-center">
                  <div
                    className={`flex-shrink-0 mr-5 w-14 h-14 rounded-full bg-gradient-to-br ${advantage.gradient} flex items-center justify-center`}
                  >
                    <div className={`${advantage.color}`}>{advantage.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-base font-bold mb-1 ${advantage.color}`}
                    >
                      {advantage.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
