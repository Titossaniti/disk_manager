"use server"

import {cookies} from "next/headers"

type SessionUser = {
    id: string
    email: string
    name: string
    role: string
}

/**
 * Récupère les infos de session côté serveur (via cookie JWT).
 */
export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies()
    const jwt = cookieStore.get('jwt')?.value

    // Si pas de cookie, pas de session
    if (!jwt) return null

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                Cookie: `jwt=${jwt}`,
            },
            credentials: "include",
            cache: "no-store",
        })

        if (!res.ok) return null

        return await res.json()
    } catch (err) {
        console.error("[getSession] erreur :", err)
        return null
    }
}

/**
 * Déconnecte l'utilisateur côté serveur et redirige.
 */
// export async function logoutServerSide(): Promise<void> {
//     const jwt = cookies().get("jwt")?.value
//     if (jwt) {
//         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
//             method: "POST",
//             headers: {
//                 Cookie: `jwt=${jwt}`,
//             },
//         })
//     }
//
//     redirect("/login")
// }
