"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import api from "./api"

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  company: string | null
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; company?: string }) => Promise<void>
  loginWithToken: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("access_token")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me")
      setUser(data)
      localStorage.setItem("user", JSON.stringify(data))
    } catch {
      // Token might be invalid
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password })
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("user", JSON.stringify(data.user))
  }, [])

  const register = useCallback(
    async (regData: { name: string; email: string; password: string; company?: string }) => {
      const { data } = await api.post("/auth/register", regData)
      setToken(data.access_token)
      setUser(data.user)
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))
    },
    []
  )

  const loginWithToken = useCallback((newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem("access_token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    router.push("/sign-in")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        loginWithToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>")
  return context
}
