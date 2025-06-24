"use client"

import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import React from "react"
import ClientWrapper from "@/components/layout/client-wrapper"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PrivateAccess>{children}</PrivateAccess>
        </AuthProvider>
    )
}

function PrivateAccess({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading || !user) return null

    return <ClientWrapper>{children}</ClientWrapper>
}