import type { ReactNode } from "react";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import ClientWrapper from "@/components/layout/client-wrapper";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return <ClientWrapper>{children}</ClientWrapper>;
}
