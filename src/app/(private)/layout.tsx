
import ClientWrapper from "@/components/layout/client-wrapper";
import {useAuth} from "@/hooks/useAuth";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";


export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return null
    }

    return <ClientWrapper>{children}</ClientWrapper>;
}
