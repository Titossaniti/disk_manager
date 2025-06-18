'use client'

import Link from 'next/link'
import { Disc3, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-8">
            <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Disc3 className="size-4" />
                </div>
                <p className="text-sm font-medium">Disk Manager</p>
            </div>

            <div className="space-y-4 max-w-md">
                <div className="flex justify-center">
                    <Ban className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-semibold text-destructive">Page introuvable</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
                </p>
            </div>

            <Link href="/home">
                <Button>Retour à l’accueil</Button>
            </Link>
        </div>
    )
}
