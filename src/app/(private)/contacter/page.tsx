"use client"

import ContactForm from "@/components/contact-form"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PrivateContactPage() {
    const { user } = useAuth()

    return (
        <div className="flex justify-center p-6">
            <Card className="w-full w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Nous contacter</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Si vous rencontrer un soucis, souhaitez proposer une amélioration
                        <br/>
                        ou alors avez besoin d'un quelconque renseignement,
                        <br/>
                        écrivez nous via ce formulaire.
                        <br/>
                        <br/>
                        Nous ferons de notre mieux pour répondre au plus vite à votre demande.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContactForm defaultEmail={user?.email ?? ""} />
                </CardContent>
            </Card>
        </div>
    )
}
