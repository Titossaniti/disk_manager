"use client"

import Link from "next/link"
import { LayoutDashboard, LogOut, Disc3 } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"

export function AppSidebar() {
    const { user, isLoading, logout } = useAuth()

    if (isLoading) return null
    if (!user) return null

    const navItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
    ]

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Disc3 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Disk Manager</span>
                        <span className="text-xs text-muted-foreground">{user.pseudonym}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent >
                <SidebarMenu className="p-3">
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild>
                                <Link href={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} alt={user.name} />
                            <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                    <Button variant="destructive" className="hover:border-2 hover:border-red-400 hover:cursor-pointer" size="icon" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
