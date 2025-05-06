"use client"

import Link from "next/link"
import {LayoutDashboard, LogOut, Disc3, DiscAlbum, FilePlus, ChartColumn} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"

export function AppSidebar() {
    const { user, isLoading, logout } = useAuth()
    console.log("AppSidebar mounted", { user, isLoading });
    if (isLoading) return null
    if (!user) return null

    const navItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/home",
        },
        {
            title: "Statistiques",
            icon: ChartColumn,
            href: "/statistics",
        },
        {
            title: "Mes disques",
            icon: Disc3,
            href: "/vinyles",
        },
        {
            title: "Ajouter un disque",
            icon: FilePlus,
            href: "/create",
        },
    ]

    return (
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <DiscAlbum className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Disk Manager</span>
                        <span className="text-xs text-muted-foreground">{user.pseudonym}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarMenu className="p-3">
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href} className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} alt={user.pseudonym} />
                            <AvatarFallback>{user?.pseudonym?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.pseudonym}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                    <Button variant="destructive" size="icon" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Déconnexion</span>
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}