"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Transaction } from "./types"

type TransactionsContextType = {
  transactions: Transaction[]
  isLoaded: boolean
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  clearTransactions: () => void
  totalIncome: number
  totalExpenses: number
  totalBalance: number
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount - start with empty array for new users
  useEffect(() => {
    const stored = localStorage.getItem("spendwise-transactions")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTransactions(Array.isArray(parsed) ? parsed : [])
      } catch {
        setTransactions([])
      }
    } else {
      // New users start with empty transactions
      setTransactions([])
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("spendwise-transactions", JSON.stringify(transactions))
    }
  }, [transactions, isLoaded])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const clearTransactions = () => {
    setTransactions([])
    localStorage.removeItem("spendwise-transactions")
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpenses

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        isLoaded,
        addTransaction,
        deleteTransaction,
        clearTransactions,
        totalIncome,
        totalExpenses,
        totalBalance,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider")
  }
  return context
}
