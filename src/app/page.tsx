"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push("/home")
            } else {
                router.push("/login")
            }
        }
    }, [user, isLoading, router])

    return null
}