"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { ReactNode } from "react";

export default function ClientWrapper({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SidebarProvider>
                    <div className="flex w-full">
                        <AppSidebar />
                        <main className="flex-1 overflow-auto p-6">
                            <SidebarTrigger className="hover:cursor-pointer" />
                            {children}
                        </main>
                    </div>
                </SidebarProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
