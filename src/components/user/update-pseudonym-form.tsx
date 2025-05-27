"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const schema = z.object({
    pseudonym: z.string().min(1, "Le pseudonyme est requis"),
})

export function UpdatePseudonymForm({ initialPseudonym }: { initialPseudonym: string }) {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { pseudonym: initialPseudonym },
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/pseudonym`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        })

        if (res.ok) {
            toast.success("Pseudonyme mis à jour.")
        } else {
            toast.error("Erreur lors de la mise à jour.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
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
                <Button type="submit">Modifier le pseudonyme</Button>
            </form>
        </Form>
    )
}
