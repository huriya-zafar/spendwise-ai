import type { Transaction } from "./types"

// Auto-categorization keywords mapping
const CATEGORY_KEYWORDS: Record<Transaction["category"], string[]> = {
  Food: [
    "kfc", "mcdonald", "mcd", "burger", "pizza", "restaurant", "cafe", "coffee",
    "starbucks", "subway", "domino", "grocery", "food", "eat", "lunch", "dinner",
    "breakfast", "snack", "bakery", "sushi", "thai", "chinese", "indian", "meal",
    "uber eats", "doordash", "grubhub", "deliveroo", "foodpanda"
  ],
  Entertainment: [
    "netflix", "spotify", "disney", "hulu", "hbo", "amazon prime", "youtube",
    "twitch", "gaming", "game", "xbox", "playstation", "steam", "movie", "cinema",
    "concert", "theatre", "theater", "music", "apple music", "podcast"
  ],
  Shopping: [
    "amazon", "ebay", "walmart", "target", "costco", "ikea", "clothing", "clothes",
    "shoes", "fashion", "mall", "shop", "store", "online", "purchase", "buy",
    "electronics", "gadget", "tech", "phone", "laptop", "computer"
  ],
  Transport: [
    "uber", "lyft", "taxi", "cab", "gas", "fuel", "petrol", "parking", "toll",
    "bus", "train", "metro", "subway", "flight", "airline", "car", "vehicle",
    "maintenance", "repair", "insurance", "careem", "grab"
  ],
  Health: [
    "hospital", "doctor", "clinic", "pharmacy", "medicine", "drug", "health",
    "gym", "fitness", "workout", "yoga", "medical", "dental", "dentist", "therapy",
    "vitamin", "supplement", "insurance"
  ],
  Rent: [
    "rent", "mortgage", "lease", "housing", "apartment", "house", "landlord",
    "property", "accommodation", "home"
  ],
  Salary: [
    "salary", "paycheck", "wage", "income", "bonus", "commission", "freelance",
    "payment", "earnings", "revenue", "dividend"
  ],
  Fun: [
    "bar", "pub", "club", "party", "vacation", "holiday", "travel", "trip",
    "adventure", "hobby", "sports", "recreation", "leisure", "outing"
  ],
}

/**
 * Auto-categorize a transaction based on its title
 * Returns the best matching category or "Shopping" as default for expenses
 */
export function autoCategorize(
  title: string,
  type: "income" | "expense"
): Transaction["category"] {
  const lowerTitle = title.toLowerCase()

  // For income, check salary-related keywords first
  if (type === "income") {
    for (const keyword of CATEGORY_KEYWORDS.Salary) {
      if (lowerTitle.includes(keyword)) {
        return "Salary"
      }
    }
    return "Salary" // Default for income
  }

  // For expenses, check all categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "Salary") continue // Skip salary for expenses
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return category as Transaction["category"]
      }
    }
  }

  return "Shopping" // Default for expenses
}

/**
 * Generate AI insights based on transaction data
 */
export function generateAIInsights(
  transactions: Transaction[],
  userName: string
): {
  greeting: string
  spendingAnalysis: string | null
  savingsProjection: string | null
  topCategory: string | null
  suggestion: string | null
} {
  const currentMonth = new Date().toLocaleString("default", { month: "long" })
  
  if (transactions.length === 0) {
    return {
      greeting: `Welcome, ${userName}!`,
      spendingAnalysis: null,
      savingsProjection: null,
      topCategory: null,
      suggestion: "Add your first transaction to unlock AI-powered insights!",
    }
  }

  // Calculate totals for current month
  const now = new Date()
  const currentMonthTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date)
    return (
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    )
  })

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate category spending
  const categorySpending = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const topCategoryEntry = Object.entries(categorySpending).sort(
    ([, a], [, b]) => b - a
  )[0]

  // Generate insights
  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0

  const projectedSavings = monthlyIncome - monthlyExpenses
  
  let suggestion: string | null = null
  if (topCategoryEntry) {
    const [topCat, topAmount] = topCategoryEntry
    const percentage = Math.round((topAmount / monthlyExpenses) * 100)
    if (percentage > 40) {
      suggestion = `Consider reducing ${topCat} spending - it's ${percentage}% of your expenses this month.`
    } else if (savingsRate < 20 && monthlyIncome > 0) {
      suggestion = "Try to increase your savings rate to at least 20% for better financial health."
    } else if (savingsRate >= 20) {
      suggestion = "Great job! You're maintaining a healthy savings rate."
    }
  }

  return {
    greeting: `Hi ${userName}!`,
    spendingAnalysis: `You have spent ${monthlyExpenses.toLocaleString()} this ${currentMonth}.`,
    savingsProjection: projectedSavings >= 0
      ? `You are on track to save ${projectedSavings.toLocaleString()} this month!`
      : `You are overspending by ${Math.abs(projectedSavings).toLocaleString()} this month.`,
    topCategory: topCategoryEntry
      ? `Top spending: ${topCategoryEntry[0]} (${topCategoryEntry[1].toLocaleString()})`
      : null,
    suggestion,
  }
}
