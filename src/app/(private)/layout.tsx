import type { ReactNode } from "react"
import { AuthProvider } from "@/hooks/useAuth"
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSession } from "@/actions/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PrivateLayout({ children }: { children: ReactNode }) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    return (
        <AuthProvider>
            <SidebarProvider>
                <div className="flex w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto p-6">
                        <SidebarTrigger />
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </AuthProvider>
    )
}
