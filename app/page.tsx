"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Wallet } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-4">
        <Wallet className="h-10 w-10 text-income animate-pulse" />
        <span className="text-2xl font-bold text-foreground">SpendWise</span>
      </div>
      <div className="text-muted-foreground text-sm">Loading...</div>
    </div>
  )
}
