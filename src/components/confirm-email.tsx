"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MailCheck, MailX } from "lucide-react"

export default function ConfirmEmail() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

    useEffect(() => {
        const confirmEmail = async () => {
            if (!token) {
                setStatus("error")
                return
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/confirm-email-change?token=${token}`)
                setStatus(res.ok ? "success" : "error")
            } catch {
                setStatus("error")
            }
        }

        confirmEmail()
    }, [token])

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Vérification en cours...</span>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            {status === "success" ? (
                <Alert>
                    <MailCheck className="h-5 w-5" />
                    <AlertTitle>Confirmation réussie</AlertTitle>
                    <AlertDescription>Votre adresse email a bien été mise à jour.</AlertDescription>
                    <AlertDescription>Vous allez être redirigé vers la page de connexion.</AlertDescription>
                </Alert>
            ) : (
                <Alert variant="destructive">
                    <MailX className="h-5 w-5" />
                    <AlertTitle>Échec de la confirmation</AlertTitle>
                    <AlertDescription>Le lien est invalide ou a expiré.</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
