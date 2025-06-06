"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
    label?: string;
    className?: string;
};

export default function BackButton({ label = "Retour", className }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant="outline"
            onClick={() => router.back()}
            className={`w-fit max-w-full whitespace-nowrap text-sm flex items-center gap-1 ${className || ""}`}
            type="button"
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </Button>
    );
}