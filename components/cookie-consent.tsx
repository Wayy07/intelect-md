"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, X } from "lucide-react"

interface CookieSettings {
  analytics: boolean
  preferences: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [settings, setSettings] = useState<CookieSettings>({
    analytics: true,
    preferences: true,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookieConsent")
    if (!hasAccepted) {
      setIsVisible(true)
    } else {
      // Load saved settings
      try {
        const savedSettings = JSON.parse(localStorage.getItem("cookieSettings") || "{}")
        setSettings(savedSettings)
      } catch (error) {
        console.error("Error loading cookie settings:", error)
      }
    }
  }, [])

  const acceptAllCookies = () => {
    const allSettings = {
      analytics: true,
      preferences: true,
      marketing: true
    }
    saveCookieSettings(allSettings)
  }

  const saveCustomSettings = () => {
    saveCookieSettings(settings)
  }

  const saveCookieSettings = (selectedSettings: CookieSettings) => {
    localStorage.setItem("cookieConsent", "true")
    localStorage.setItem("cookieSettings", JSON.stringify(selectedSettings))

    // Apply cookie settings
    if (selectedSettings.analytics) {
      // Enable analytics (Google Analytics, etc.)
      enableAnalytics()
    }
    if (selectedSettings.preferences) {
      // Enable preferences (theme, language, etc.)
      enablePreferences()
    }
    if (selectedSettings.marketing) {
      // Enable marketing cookies
      enableMarketing()
    }

    setIsVisible(false)
  }

  const enableAnalytics = () => {
    // Initialize analytics (placeholder)
    console.log("Analytics enabled")
  }

  const enablePreferences = () => {
    // Initialize preferences (placeholder)
    console.log("Preferences enabled")
  }

  const enableMarketing = () => {
    // Initialize marketing (placeholder)
    console.log("Marketing enabled")
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg px-4 md:px-0"
        >
          <div className="container mx-auto py-4 space-y-4">
            {/* Main consent message */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Setări Cookie-uri 🍪</h3>
                  <p className="text-sm text-muted-foreground max-w-prose">
                    Folosim cookie-uri pentru a vă oferi cea mai bună experiență pe site-ul nostru.
                    Acestea ne ajută să analizăm traficul, să personalizăm conținutul și să îmbunătățim serviciile noastre.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Cookie settings */}
              <AnimatePresence mode="wait">
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.analytics}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              analytics: e.target.checked
                            }))}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="font-medium">Analitice</span>
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Ne ajută să înțelegem cum folosiți site-ul pentru a-l îmbunătăți.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.preferences}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              preferences: e.target.checked
                            }))}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="font-medium">Preferințe</span>
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Salvează preferințele dvs. pentru o experiență personalizată.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.marketing}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              marketing: e.target.checked
                            }))}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="font-medium">Marketing</span>
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Ne permite să vă oferim reclame personalizate.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Personalizează
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setIsVisible(false)}
                  >
                    Mai târziu
                  </Button>
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2 sm:ml-auto">
                  {showDetails ? (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={saveCustomSettings}
                    >
                      Salvează preferințele
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={acceptAllCookies}
                    >
                      Acceptă toate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
