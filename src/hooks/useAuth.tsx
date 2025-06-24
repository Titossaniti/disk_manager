"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

type User = {
    id: string
    email: string
    pseudonym: string
    role: string
}

type AuthContextType = {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    credentials: "include",
                    cache: "no-store",
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error("Erreur récupération user :", err)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        if (!pathname.startsWith("/login")) {
            fetchUser()
        } else {
            setIsLoading(false)
        }
    }, [pathname])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return {
                    success: false,
                    error: errorData.message || `Login failed with status: ${response.status}`,
                }
            }

            const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                credentials: "include",
            })

            if (!meResponse.ok) {
                return {
                    success: false,
                    error: "Échec récupération de l'utilisateur",
                }
            }

            const user = await meResponse.json()
            setUser(user)

            router.push("/home")
            return { success: true }
        } catch (error) {
            console.error("Login error:", error)
            return {
                success: false,
                error: "Erreur réseau. Merci de réessayer.",
            }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            })
            setUser(null)
            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}