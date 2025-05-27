"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email("Email invalide"),
    pseudonym: z.string().min(1, "Pseudonyme requis"),
    password: z.string()
        .min(8, "Minimum 8 caractères")
        .regex(/[A-Z]/, "Au moins une majuscule")
        .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
})

type FormValues = z.infer<typeof formSchema>

export default function UpdateUserForm() {
    const [currentUser, setCurrentUser] = useState<{ email: string; pseudonym: string } | null>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            pseudonym: "",
            password: "",
        },
    })

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                credentials: "include",
            })
            const user = await res.json()
            setCurrentUser({ email: user.email, pseudonym: user.pseudonym })
            form.setValue("email", user.email)
            form.setValue("pseudonym", user.pseudonym)
        }

        fetchCurrentUser()
    }, [form])

    const onSubmit = async (data: FormValues) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error("Erreur lors de la mise à jour.")

            toast.success("Profil mis à jour avec succès")
            form.reset({ ...data, password: "" })
        } catch (err) {
            toast.error("Échec de la mise à jour")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modifier mes informations</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Ligne 1 : Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex flex-col gap-2">
                                <FormLabel className="text-muted-foreground">Email actuel</FormLabel>
                                <div className="bg-muted px-3 py-2 rounded text-primary text-sm">
                                    {currentUser?.email || "Chargement..."}
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouvel email</FormLabel>
                                        <Input type="email" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Ligne 2 : Pseudonyme */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex flex-col gap-2">
                                <FormLabel className="text-muted-foreground">Pseudonyme actuel</FormLabel>
                                <div className="bg-muted px-3 py-2 rounded text-primary text-sm">
                                    {currentUser?.pseudonym || "Chargement..."}
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="pseudonym"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouveau pseudonyme</FormLabel>
                                        <Input {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Ligne 3 : Mot de passe */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex flex-col gap-2">
                                <FormLabel className="text-muted-foreground">Mot de passe actuel</FormLabel>
                                <div className="bg-muted px-3 py-2 rounded text-primary text-sm">
                                    ********
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouveau mot de passe</FormLabel>
                                        <Input type="password" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button type="submit" className="w-full md:w-auto">
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )

}
