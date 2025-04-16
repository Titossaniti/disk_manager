"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type LoginCredentials = {
    email: string
    password: string
}

type LoginResult = {
    success: boolean
    error?: string
}

type SessionUser = {
    id: string
    email: string
    name: string
}

const SESSION_COOKIE_NAME = "session"

/**
 * Authentifie un utilisateur et stocke les infos en cookie.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.message || `Login failed with status: ${res.status}`,
            }
        }

        const data = await res.json()

        // Crée un objet utilisateur pour la session
        const user: SessionUser = {
            id: data.user?.id || data.id || "1",
            email: data.user?.email || email,
            name: data.user?.name || data.name || email.split("@")[0],
        }

        return { success: true }
    } catch (error) {
        console.error("Login error:", error)
        return {
            success: false,
            error: "Impossible de se connecter au service d’authentification.",
        }
    }
}

/**
 * Supprime la session et redirige vers /login.
 */
export async function logout(): Promise<void> {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => {
            // API de logout échoue => on supprime quand même le cookie
        })
    } finally {
        cookies().delete(SESSION_COOKIE_NAME)
        redirect("/login")
    }
}

/**
 * Récupère les infos de session de l'utilisateur.
 */
export async function getSession(): Promise<SessionUser | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            credentials: "include",
            cache: "no-store",
        })

        if (!res.ok) return null

        return await res.json()
    } catch {
        return null
    }
}

