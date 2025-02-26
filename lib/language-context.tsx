"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "ro" | "ru"

interface Translations {
  [key: string]: {
    ro: string
    ru: string
  }
}

export const translations: Translations = {
  // Header - Top bar
  "workingHours": {
    ro: "Luni - Vineri: 9:00 - 18:00",
    ru: "Понедельник - Пятница: 9:00 - 18:00"
  },
  "credit": {
    ro: "Intelect Credit",
    ru: "Intelect Кредит"
  },
  "delivery": {
    ro: "Livrare",
    ru: "Доставка"
  },
  // Header - Main
  "techStore": {
    ro: "Magazin de tehnică",
    ru: "Магазин техники"
  },
  "catalog": {
    ro: "Catalog",
    ru: "Каталог"
  },
  "searchPlaceholder": {
    ro: "Caută produse...",
    ru: "Поиск товаров..."
  },
  // User menu
  "welcome": {
    ro: "Bine ați venit!",
    ru: "Добро пожаловать!"
  },
  "loginToContinue": {
    ro: "Conectați-vă pentru a continua",
    ru: "Войдите, чтобы продолжить"
  },
  "signInWithGoogle": {
    ro: "Conectare cu Google",
    ru: "Войти через Google"
  },
  // Categories
  "subcategories": {
    ro: "Subcategorii",
    ru: "Подкатегории"
  },
  "popularProducts": {
    ro: "Produse populare",
    ru: "Популярные товары"
  },
  "seeDetails": {
    ro: "Vezi detalii",
    ru: "Подробнее"
  },
  // Mobile menu
  "menu": {
    ro: "Meniu",
    ru: "Меню"
  },
  "back": {
    ro: "Înapoi",
    ru: "Назад"
  },
  "login": {
    ro: "Autentificare",
    ru: "Войти"
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ro")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "ro" || savedLang === "ru")) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
