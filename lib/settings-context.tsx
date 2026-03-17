"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Currency } from "./types"

type SettingsContextType = {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedCurrency = localStorage.getItem("spendwise-currency")
    if (storedCurrency === "USD" || storedCurrency === "PKR") {
      setCurrencyState(storedCurrency)
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("spendwise-currency", currency)
    }
  }, [currency, isLoaded])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
  }

  return (
    <SettingsContext.Provider value={{ currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
