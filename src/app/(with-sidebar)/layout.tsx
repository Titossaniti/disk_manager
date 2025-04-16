import type React from "react"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSession } from "@/actions/auth"

export default async function WithSidebarLayout({
                                                    children,
                                                }: {
    children: React.ReactNode
}) {
    // We still use server-side session check for initial render
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-svh">
                <AppSidebar />
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </SidebarProvider>
    )
}
