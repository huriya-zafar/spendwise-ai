"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

type StoredUser = User & { password: string }

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string }
  signup: (email: string, name: string, password: string) => { success: boolean; error?: string }
  completeSetup: (startingBalance: number, monthlyIncomeGoal: number) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("spendwise-session")
    if (storedSession) {
      const session = JSON.parse(storedSession)
      setUser(session)
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string, rememberMe = false): { success: boolean; error?: string } => {
    // Get all registered users
    const storedUsers = localStorage.getItem("spendwise-users")
    if (!storedUsers) {
      return { success: false, error: "No account found. Please sign up first." }
    }

    const users: StoredUser[] = JSON.parse(storedUsers)
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!foundUser) {
      return { success: false, error: "Invalid email or password." }
    }

    if (foundUser.password !== password) {
      return { success: false, error: "Invalid email or password." }
    }

    // Create session (without password)
    const sessionUser: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
    }

    setUser(sessionUser)

    // Save session based on rememberMe preference
    if (rememberMe) {
      localStorage.setItem("spendwise-session", JSON.stringify(sessionUser))
    } else {
      sessionStorage.setItem("spendwise-session", JSON.stringify(sessionUser))
      localStorage.removeItem("spendwise-session")
    }

    return { success: true }
  }

  const signup = (email: string, name: string, password: string): { success: boolean; error?: string } => {
    // Get existing users or create empty array
    const storedUsers = localStorage.getItem("spendwise-users")
    const users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []

    // Check if email already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." }
    }

    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      email,
      name,
      password,
    }

    // Save to users list
    users.push(newUser)
    localStorage.setItem("spendwise-users", JSON.stringify(users))

    // Create session (without password)
    const sessionUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    }

    setUser(sessionUser)
    localStorage.setItem("spendwise-session", JSON.stringify(sessionUser))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("spendwise-session")
    sessionStorage.removeItem("spendwise-session")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
