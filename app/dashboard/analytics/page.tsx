"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/lib/transactions-context"
import { useSettings } from "@/lib/settings-context"
import { CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { BarChart3, PieChartIcon } from "lucide-react"

export default function AnalyticsPage() {
  const { transactions, totalExpenses } = useTransactions()
  const { currency } = useSettings()

  const currencySymbol = CURRENCY_SYMBOLS[currency]

  // Calculate spending by category for pie chart
  const categorySpending = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)
  }, [transactions])

  const pieChartData = useMemo(() => {
    return Object.entries(categorySpending).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS],
    }))
  }, [categorySpending])

  // Calculate monthly income vs expenses for bar chart
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expenses: number }> = {}

    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      if (!months[monthKey]) {
        months[monthKey] = { month: monthName, income: 0, expenses: 0 }
      }

      if (t.type === "income") {
        months[monthKey].income += t.amount
      } else {
        months[monthKey].expenses += t.amount
      }
    })

    // Sort by date and return last 6 months
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, data]) => data)
  }, [transactions])

  const hasExpenseData = pieChartData.length > 0
  const hasMonthlyData = monthlyData.length > 0

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed insights into your spending habits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Income vs Expenses</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly comparison</p>
            </CardHeader>
            <CardContent>
              {hasMonthlyData ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.28 0.005 285)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="oklch(0.65 0.01 285)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="oklch(0.65 0.01 285)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${currencySymbol}${value}`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-lg">
                                <p className="text-sm font-medium text-foreground mb-2">
                                  {label}
                                </p>
                                {payload.map((entry) => (
                                  <p
                                    key={entry.name}
                                    className="text-sm"
                                    style={{ color: entry.color }}
                                  >
                                    {entry.name}: {currencySymbol}
                                    {(entry.value as number).toLocaleString()}
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value) => (
                          <span className="text-sm text-foreground">{value}</span>
                        )}
                      />
                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="oklch(0.72 0.17 160)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill="oklch(0.65 0.2 15)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={<BarChart3 className="h-12 w-12" />}
                  title="No data yet"
                  description="Add transactions to see your monthly income vs expenses"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Spending by Category</CardTitle>
              <p className="text-sm text-muted-foreground">Where your money goes</p>
            </CardHeader>
            <CardContent>
              {hasExpenseData ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={{ stroke: "oklch(0.65 0.01 285)", strokeWidth: 1 }}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            const percentage =
                              totalExpenses > 0
                                ? Math.round((data.value / totalExpenses) * 100)
                                : 0
                            return (
                              <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-lg">
                                <p className="text-sm font-medium text-foreground">
                                  {data.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {currencySymbol}
                                  {data.value.toLocaleString()} ({percentage}%)
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
              ) : (
                <EmptyState
                  icon={<PieChartIcon className="h-12 w-12" />}
                  title="No expense data"
                  description="Add some expenses to see your spending breakdown"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown Table */}
      {hasExpenseData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pieChartData
                  .sort((a, b) => b.value - a.value)
                  .map((category) => {
                    const percentage =
                      totalExpenses > 0
                        ? Math.round((category.value / totalExpenses) * 100)
                        : 0
                    return (
                      <div
                        key={category.name}
                        className="p-4 rounded-lg bg-secondary/30 border border-border"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {category.name}
                          </span>
                        </div>
                        <p className="text-2xl font-bold font-mono text-foreground">
                          {currencySymbol}
                          {category.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {percentage}% of total expenses
                        </p>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
