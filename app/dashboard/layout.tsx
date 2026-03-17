"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/lib/auth-context"
import { TransactionsProvider } from "@/lib/transactions-context"
import { SettingsProvider } from "@/lib/settings-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SettingsProvider>
      <TransactionsProvider>
        <div className="min-h-screen bg-background flex">
          <AppSidebar
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Mobile header */}
            <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
              <div className="flex items-center justify-between h-full px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
                <span className="font-semibold text-foreground">SpendWise</span>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </TransactionsProvider>
    </SettingsProvider>
  )
}
