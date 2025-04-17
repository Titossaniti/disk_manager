import type { ReactNode } from "react"
import "../globals.css"
import {AuthProvider} from "@/hooks/useAuth";


export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
            <AuthProvider>
                {children}
            </AuthProvider>
    )
}