export type Transaction = {
  id: string
  title: string
  amount: number
  type: "income" | "expense"
  category: "Food" | "Salary" | "Rent" | "Fun" | "Shopping" | "Transport" | "Health" | "Entertainment"
  date: string
}

export type User = {
  id: string
  name: string
  email: string
  setupCompleted?: boolean
  startingBalance?: number
  monthlyIncomeGoal?: number
}

export type Currency = "USD" | "PKR"

export const CATEGORY_COLORS: Record<Transaction["category"], string> = {
  Food: "oklch(0.75 0.15 85)",
  Salary: "oklch(0.72 0.17 160)",
  Rent: "oklch(0.65 0.2 15)",
  Fun: "oklch(0.7 0.15 250)",
  Shopping: "oklch(0.65 0.15 310)",
  Transport: "oklch(0.7 0.17 200)",
  Health: "oklch(0.72 0.15 140)",
  Entertainment: "oklch(0.68 0.18 280)",
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  PKR: "Rs.",
}

export const defaultTransactions: Transaction[] = [
  { id: "1", title: "Monthly Salary", amount: 5000, type: "income", category: "Salary", date: "2026-03-15" },
  { id: "2", title: "Groceries", amount: 150, type: "expense", category: "Food", date: "2026-03-14" },
  { id: "3", title: "Rent Payment", amount: 1200, type: "expense", category: "Rent", date: "2026-03-01" },
  { id: "4", title: "Netflix", amount: 15, type: "expense", category: "Entertainment", date: "2026-03-10" },
  { id: "5", title: "Freelance Work", amount: 800, type: "income", category: "Salary", date: "2026-03-12" },
  { id: "6", title: "Dinner Out", amount: 75, type: "expense", category: "Food", date: "2026-03-13" },
  { id: "7", title: "Gym Membership", amount: 50, type: "expense", category: "Health", date: "2026-03-05" },
  { id: "8", title: "Uber Rides", amount: 40, type: "expense", category: "Transport", date: "2026-03-08" },
  { id: "9", title: "New Shoes", amount: 120, type: "expense", category: "Shopping", date: "2026-03-06" },
  { id: "10", title: "Bonus", amount: 500, type: "income", category: "Salary", date: "2026-03-02" },
]
