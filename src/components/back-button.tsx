"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
    label?: string;
    className?: string;
    fallbackHref?: string;
};

export default function BackButton({ label = "Retour", className, fallbackHref = "/home" }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        const referrer = document.referrer;
        const currentOrigin = window.location.origin;

        if (referrer && new URL(referrer).origin === currentOrigin) {
            router.back();
        } else {
            router.replace(fallbackHref);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            className={`w-fit max-w-full whitespace-nowrap text-sm flex items-center gap-1 ${className || ""}`}
            type="button"
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </Button>
    );
}
