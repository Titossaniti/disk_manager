"use client"

import { useEffect, useState } from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {UpdatePseudonymForm} from "@/components/user/update-pseudonym-form";
import {RequestEmailChangeForm} from "@/components/user/update-email-form";
import {UpdatePasswordForm} from "@/components/user/update-password-form";
import { Skeleton } from "@/components/ui/skeleton"
import BackButton from "@/components/back-button";

type CurrentUser = {
    pseudonym: string
    email: string
}

export default function ProfilePage() {
    const [user, setUser] = useState<CurrentUser | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                credentials: "include",
            })
            if (res.ok) {
                const data = await res.json()
                setUser({ pseudonym: data.pseudonym, email: data.email })
            }
        }
        fetchUser()
    }, [])

    if (!user) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <BackButton/>
            <h1 className="text-2xl font-semibold">Modifiez les informations de votre profil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card className="flex flex-col justify-between h-full">
                    <CardHeader>
                        <CardTitle>Modifier vos informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <UpdatePseudonymForm initialPseudonym={user.pseudonym} />
                        <div>
                            <p className="text-muted-foreground text-sm font-medium mb-1">Email actuel</p>
                            <p className="bg-muted px-3 py-2 rounded text-primary text-sm">{user.email}</p>
                        </div>
                        <RequestEmailChangeForm />
                    </CardContent>
                </Card>

                <Card className="flex flex-col  h-full">
                    <CardHeader>
                        <CardTitle>Modifier le mot de passe</CardTitle>
                        <CardDescription>Entrez votre mot de passe actuel pour pouvoir le modifier ensuite</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdatePasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )

}
