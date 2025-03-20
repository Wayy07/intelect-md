"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Initial check
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed z-30 bg-white/80 backdrop-blur-md border border-white/20 text-primary shadow-lg rounded-full p-3.5
                    left-4 right-auto bottom-28 md:left-auto md:right-6 md:bottom-6
                    hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2
                    transition-all duration-300"
          onClick={scrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: isHovered
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
          }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to top"
          title="Back to top"
        >
          <motion.div
            animate={isHovered ? { y: -3 } : { y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.div>

          {/* Subtle pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-transparent border-2 border-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0.8, 1.2, 1.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
