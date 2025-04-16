import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "next-themes"
import {AuthProvider} from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] })

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}