"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Search, Receipt, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransactions } from "@/lib/transactions-context"
import { useSettings } from "@/lib/settings-context"
import { CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useTransactions()
  const { currency } = useSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const currencySymbol = CURRENCY_SYMBOLS[currency]

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter
    const matchesType = typeFilter === "all" || t.type === typeFilter
    return matchesSearch && matchesCategory && matchesType
  })

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Transactions History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage all your transactions
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              All Transactions
              <Badge variant="secondary" className="ml-2">
                {filteredTransactions.length} of {transactions.length}
              </Badge>
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground sm:hidden" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] bg-secondary/50 border-border">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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
          </div>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-12 w-12" />}
              title="No transactions found"
              description={
                searchQuery || categoryFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first transaction to get started"
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
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
                    {sortedTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                        className="border-border hover:bg-secondary/50"
                      >
                        <TableCell className="font-medium text-foreground">
                          {transaction.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === "income" ? "default" : "secondary"}
                            className={
                              transaction.type === "income"
                                ? "bg-income/20 text-income border-income/30"
                                : "bg-expense/20 text-expense border-expense/30"
                            }
                          >
                            {transaction.type === "income" ? "Income" : "Expense"}
                          </Badge>
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
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-medium ${
                            transaction.type === "income" ? "text-income" : "text-expense"
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
    </div>
  )
}
