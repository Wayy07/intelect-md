"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw, CheckCircle, Zap } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Advantage {
  id: number;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  shadowColor: string;
  bgGradient: string;
}

export default function Advantages() {
  const { t } = useLanguage();

  // Enhanced animation variants
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
        stiffness: 80,
        damping: 15,
      },
    },
  };

  // Define advantages with enhanced styling properties
  const advantages: Advantage[] = [
    {
      id: 1,
      titleKey: "fastDelivery",
      descriptionKey: "fastDeliveryDescription",
      icon: <Truck className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />,
      color: "#4361ee",
      gradient: "from-blue-500/20 to-indigo-500/10",
      shadowColor: "shadow-blue-500/20",
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      id: 2,
      titleKey: "qualityGuarantee",
      descriptionKey: "qualityGuaranteeDescription",
      icon: <ShieldCheck className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />,
      color: "#2ec4b6",
      gradient: "from-emerald-500/20 to-teal-500/10",
      shadowColor: "shadow-emerald-500/20",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
    {
      id: 3,
      titleKey: "easyReturn",
      descriptionKey: "easyReturnDescription",
      icon: <RefreshCw className="h-7 w-7 md:h-9 md:w-9" strokeWidth={1.5} />,
      color: "#ff9f1c",
      gradient: "from-amber-500/20 to-orange-500/10",
      shadowColor: "shadow-amber-500/20",
      bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50",
    },
  ];

  // Determine if page has been scrolled to this component
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("avantaje-section");
      if (element) {
        const position = element.getBoundingClientRect();
        // If element is in viewport (with some buffer)
        if (position.top < window.innerHeight * 0.85) {
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
    <section id="avantaje-section" className="py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto py-12 px-2 sm:px-6 xl:px-6 xl:max-w-[65%] 3xl:px-16 3xl:max-w-[60%]">
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
            className="h-1.5 w-24 rounded-full bg-gradient-to-r from-primary to-primary/50 mx-auto mb-6"
            initial={{ opacity: 0, width: 0 }}
            animate={
              isVisible ? { opacity: 1, width: 96 } : { opacity: 0, width: 0 }
            }
            transition={{ duration: 0.8, delay: 0.4 }}
          />

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
                className={`bg-white/90 backdrop-blur-sm rounded-2xl ${advantage.shadowColor} border border-gray-100 overflow-hidden group relative`}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
                style={{
                  boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)"
                }}
              >
                {/* Gradient background that grows on hover */}
                <div
                  className={`absolute inset-0 ${advantage.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                />

                {/* Foreground content */}
                <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10 h-full">
                  <div className="mb-6 relative">
                    {/* Animated background glow */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${advantage.gradient} rounded-full scale-150 blur-xl opacity-0 group-hover:opacity-100`}
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.5, opacity: 0.8 }}
                      transition={{ duration: 0.8 }}
                    />

                    {/* Icon container */}
                    <div
                      className={`relative flex items-center justify-center w-20 h-20 rounded-2xl group-hover:rounded-3xl p-5 transition-all duration-500 bg-gradient-to-br ${advantage.gradient}`}
                      style={{ boxShadow: `0 10px 20px -5px ${advantage.color}40` }}
                    >
                      <div style={{ color: advantage.color }}>
                        {advantage.icon}
                      </div>

                      {/* Decorative circles that appear on hover */}
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Title with color transition effect */}
                  <h3
                    className="text-xl font-bold mb-4 transition-colors duration-300 relative"
                    style={{ color: "rgb(17, 24, 39)" }}
                  >
                    <span className="relative inline-block">
                      {t(advantage.titleKey)}
                      <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full"
                        style={{ background: advantage.color, originX: 0 }}
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </span>
                  </h3>

                  {/* Description with subtle animation */}
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {t(advantage.descriptionKey)}
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
                className={`bg-white/90 backdrop-blur-sm rounded-xl ${advantage.shadowColor} border border-gray-100 overflow-hidden active:scale-[0.98] transition-all duration-150`}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-4 flex items-center relative">
                  {/* Subtle background gradient */}
                  <div className={`absolute inset-0 ${advantage.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon container with enhanced design */}
                  <div
                    className={`flex-shrink-0 mr-4 w-14 h-14 rounded-xl flex items-center justify-center relative z-10 bg-gradient-to-br ${advantage.gradient}`}
                    style={{ boxShadow: `0 6px 15px -3px ${advantage.color}30` }}
                  >
                    <div style={{ color: advantage.color }}>{advantage.icon}</div>

                    {/* Decorative element */}
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>

                  {/* Content with enhanced styling */}
                  <div className="flex-1 relative z-10">
                    <h3
                      className="text-base font-bold mb-1"
                      style={{ color: advantage.color }}
                    >
                      {t(advantage.titleKey)}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {t(advantage.descriptionKey)}
                    </p>
                  </div>

                  {/* Right arrow indicator */}
                  <div className="flex-shrink-0 ml-2">
                    <Zap className="h-4 w-4 opacity-60" style={{ color: advantage.color }} />
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
