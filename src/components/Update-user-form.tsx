"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            pseudonym: "",
            password: "",
        },
    })

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

            if (!res.ok) {
                const error = await res.json()
                const message = typeof error === "string" ? error : error.message || "Erreur inconnue"
                throw new Error(message)
            }

            toast.success("Profil mis à jour avec succès.")
            form.reset()
        } catch (err: any) {
            toast.error(err.message || "Échec de la mise à jour")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <Input type="email" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pseudonym"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pseudonyme</FormLabel>
                            <Input {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
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

                <Button type="submit" className="w-full">
                    Mettre à jour mes informations
                </Button>
            </form>
        </Form>
    )
}
