"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const schema = z.object({
    newEmail: z.string().email("Email invalide"),
})

export function RequestEmailChangeForm() {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { newEmail: "" },
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        })

        if (res.ok) {
            toast.success("Email envoyé ! Vérifiez votre boîte mail.")
        } else {
            toast.error("Erreur lors de l'envoi de l'email de confirmation.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nouvelle adresse email</FormLabel>
                            <Input type="email" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Modifier l'email</Button>
            </form>
        </Form>
    )
}
