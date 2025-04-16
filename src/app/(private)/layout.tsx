import type { ReactNode } from "react"
import { AuthProvider } from "@/hooks/useAuth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSession } from "@/actions/auth"
import { redirect } from "next/navigation"

export default async function PrivateLayout({ children }: { children: ReactNode }) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    return (
        <AuthProvider>
            <SidebarProvider>
                <div className="flex min-h-svh">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto p-6">{children}</main>
                </div>
            </SidebarProvider>
        </AuthProvider>
    )
}
