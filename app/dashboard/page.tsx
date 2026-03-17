"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Search,
  FileDown,
  Receipt,
  Sparkles,
  Brain,
  Lightbulb,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useTransactions } from "@/lib/transactions-context"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { type Transaction, CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { autoCategorize, generateAIInsights } from "@/lib/ai-utils"

export default function DashboardPage() {
  const {
    transactions,
    isLoaded,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    totalBalance,
  } = useTransactions()
  const { currency } = useSettings()
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const currencySymbol = CURRENCY_SYMBOLS[currency]

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const recentTransactions = filteredTransactions.slice(0, 10)

  // Calculate spending by category for chart
  const categorySpending = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(categorySpending).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as Transaction["category"]],
  }))

  // Generate AI insights
  const aiInsights = generateAIInsights(transactions, user?.name || "User")

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    addTransaction(transaction)
    setIsDialogOpen(false)
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Title", "Amount", "Type", "Category", "Date"]
    const rows = transactions.map((t) => [
      t.title,
      t.amount.toString(),
      t.type,
      t.category,
      t.date,
    ])
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "spendwise-transactions.csv")
    link.click()
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your income and expenses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-border"
            onClick={exportToCSV}
            disabled={transactions.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-income text-income-foreground hover:bg-income/90">
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm onSubmit={handleAddTransaction} currency={currency} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Balance"
          value={totalBalance}
          icon={<Wallet className="h-5 w-5" />}
          variant="balance"
          delay={0}
          currencySymbol={currencySymbol}
        />
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="income"
          delay={0.1}
          currencySymbol={currencySymbol}
        />
        <SummaryCard
          title="Total Expenses"
          value={totalExpenses}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="expense"
          delay={0.2}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mb-6"
      >
        <Card className="border-income/20 bg-card overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-income/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardContent className="pt-6 relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-income/10">
                <Brain className="h-6 w-6 text-income" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-income" />
                  <span className="text-sm font-semibold text-income">AI Insights</span>
                </div>
                {transactions.length === 0 ? (
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      Welcome, {user?.name || "User"}!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your AI-powered assistant is ready. Add your first transaction to see the magic!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">{aiInsights.greeting}</p>
                    {aiInsights.spendingAnalysis && (
                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">AI Analysis:</span> {aiInsights.spendingAnalysis} {aiInsights.savingsProjection}
                      </p>
                    )}
                    {aiInsights.topCategory && (
                      <p className="text-sm text-muted-foreground">{aiInsights.topCategory}</p>
                    )}
                    {aiInsights.suggestion && (
                      <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-secondary/50">
                        <Lightbulb className="h-4 w-4 text-income mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground">{aiInsights.suggestion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-foreground">Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-secondary/50 border-border h-9"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[130px] h-9 bg-secondary/50 border-border">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Fun">Fun</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <EmptyState
                  icon={<Receipt className="h-12 w-12" />}
                  title={
                    searchQuery || categoryFilter !== "all"
                      ? "No transactions found"
                      : "Welcome to SpendWise AI!"
                  }
                  description={
                    searchQuery || categoryFilter !== "all"
                      ? "Try adjusting your search or filter"
                      : "Your dashboard is ready. Add your first transaction to start seeing AI-driven insights."
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Title</TableHead>
                        <TableHead className="text-muted-foreground">Category</TableHead>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {recentTransactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="border-border hover:bg-secondary/50"
                          >
                            <TableCell className="font-medium text-foreground">
                              {transaction.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: CATEGORY_COLORS[transaction.category],
                                  color: CATEGORY_COLORS[transaction.category],
                                }}
                              >
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                            <TableCell
                              className={`text-right font-mono font-medium ${
                                transaction.type === "income"
                                  ? "text-income"
                                  : "text-expense"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {currencySymbol}
                              {transaction.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-expense hover:bg-expense/10"
                                onClick={() => deleteTransaction(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete transaction</span>
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <>
                  <div className="h-[200px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                                  <p className="text-sm font-medium text-foreground">
                                    {data.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {currencySymbol}
                                    {data.value.toLocaleString()}
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {chartData.map((category) => {
                      const percentage =
                        totalExpenses > 0
                          ? Math.round((category.value / totalExpenses) * 100)
                          : 0
                      return (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">{category.name}</span>
                            <span className="text-muted-foreground font-mono">
                              {currencySymbol}
                              {category.value.toLocaleString()} ({percentage}%)
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2 bg-secondary"
                            style={
                              {
                                "--progress-color": category.color,
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<TrendingDown className="h-12 w-12" />}
                  title="No expense data"
                  description="Add some expenses to see your spending breakdown"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  variant,
  delay,
  currencySymbol,
}: {
  title: string
  value: number
  icon: React.ReactNode
  variant: "balance" | "income" | "expense"
  delay: number
  currencySymbol: string
}) {
  const variantStyles = {
    balance: "border-border",
    income: "border-income/30",
    expense: "border-expense/30",
  }

  const iconStyles = {
    balance: "text-foreground",
    income: "text-income",
    expense: "text-expense",
  }

  const valueStyles = {
    balance: "text-foreground",
    income: "text-income",
    expense: "text-expense",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`bg-card ${variantStyles[variant]}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{title}</span>
            <div className={iconStyles[variant]}>{icon}</div>
          </div>
          <p className={`text-3xl font-bold font-mono ${valueStyles[variant]}`}>
            {currencySymbol}
            {value.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TransactionForm({
  onSubmit,
  currency,
}: {
  onSubmit: (transaction: Omit<Transaction, "id">) => void
  currency: string
}) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState<Transaction["category"]>("Food")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [autoSuggested, setAutoSuggested] = useState(false)

  // Auto-categorize when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (newTitle.length >= 3) {
      const suggestedCategory = autoCategorize(newTitle, type)
      setCategory(suggestedCategory)
      setAutoSuggested(true)
    }
  }

  // Re-run auto-categorization when type changes
  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType)
    if (title.length >= 3) {
      const suggestedCategory = autoCategorize(title, newType)
      setCategory(suggestedCategory)
      setAutoSuggested(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    onSubmit({
      title,
      amount: parseFloat(amount),
      type,
      category,
      date,
    })

    setTitle("")
    setAmount("")
    setType("expense")
    setCategory("Food")
    setDate(new Date().toISOString().split("T")[0])
    setAutoSuggested(false)
  }

  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., KFC, Netflix, Uber..."
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
        {autoSuggested && title.length >= 3 && (
          <p className="text-xs text-income flex items-center gap-1 mt-1">
            <Sparkles className="h-3 w-3" />
            AI suggested: {category}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ({currencySymbol})</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={(v) => handleTypeChange(v as "income" | "expense")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                Income
              </span>
            </SelectItem>
            <SelectItem value="expense">
              <span className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                Expense
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Transaction["category"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Salary">Salary</SelectItem>
            <SelectItem value="Rent">Rent</SelectItem>
            <SelectItem value="Fun">Fun</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="Transport">Transport</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-income text-income-foreground hover:bg-income/90"
      >
        Add Transaction
      </Button>
    </form>
  )
}
