"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const schema = z
    .object({
        currentPassword: z.string().min(1, "Mot de passe actuel requis"),
        newPassword: z.string()
            .min(8, "Minimum 8 caractères")
            .regex(/[A-Z]/, "Au moins une majuscule")
            .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    })

export function UpdatePasswordForm() {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }),
        })

        if (res.ok) {
            toast.success("Mot de passe mis à jour.")
            form.reset()
        } else {
            toast.error("Erreur : mot de passe actuel incorrect.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe actuel</FormLabel>
                            <Input type="password" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <Input type="password" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                            <Input type="password" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Modifier le mot de passe</Button>
            </form>
        </Form>
    )
}
