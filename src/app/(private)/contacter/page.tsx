"use client"

import ContactForm from "@/components/contact-form"
import { useAuth } from "@/hooks/useAuth"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import BackButton from "@/components/back-button"
import React from "react"

export default function PrivateContactPage() {
    const { user } = useAuth()

    return (
        <div className="p-6 space-y-6">
            <BackButton fallbackHref="/home"/>
            <div className="flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Nous contacter</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Si vous rencontrez un souci, souhaitez proposer une amélioration
                            <br />
                            ou avez besoin d'un quelconque renseignement,
                            <br />
                            écrivez-nous via ce formulaire.
                            <br />
                            <br />
                            Nous ferons de notre mieux pour répondre au plus vite à votre demande.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ContactForm defaultEmail={user?.email ?? ""} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
