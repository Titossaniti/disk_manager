"use client";

import LiteVinylesTable from "@/components/lite-vinyle-table";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import React from "react";

export default function VinylesPage() {

    const searchParams = useSearchParams();
    const router = useRouter();
    const deleted = searchParams.get("deleted");

    React.useEffect(() => {
        if (deleted) {
            toast.success("Le disque a été supprimé avec succès !");
            const newUrl = window.location.pathname;
            router.replace(newUrl);
        }
    }, [deleted]);

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Mes disques</h1>
                <p className="text-muted-foreground">Filtrez, triez et explorez les vinyles.</p>
            </div>
            <LiteVinylesTable />
        </div>
    );
}