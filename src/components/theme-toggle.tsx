"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isLight = resolvedTheme === "light"

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="cursor-pointer"
        >
            {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Changer de thème</span>
        </Button>
    )
}
