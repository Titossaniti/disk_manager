"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const schema = z.object({
    name: z.string().min(2, "Nom requis").max(50, "Nom trop long (50 caractères max.)"),
    email: z.string().email("Email invalide"),
    message: z.string().min(5, "Message trop court").max(1000, "Message est trop long (1000 caractères max.)"),
})

type ContactFormData = z.infer<typeof schema>

type ContactFormProps = {
    defaultEmail?: string
}

export default function ContactForm({ defaultEmail = "" }: ContactFormProps) {
    const form = useForm<ContactFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: defaultEmail,
            message: "",
        },
    })

    const onSubmit = async (data: ContactFormData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                toast.success(
                    <>
                        Message envoyé avec succès.<br />
                        Un retour vous sera fait le plus rapidement possible.
                    </>
                )
                form.reset()
                form.setValue("email", defaultEmail)
            } else {
                toast.error("Erreur lors de l'envoi du message")
            }
        } catch (err) {
            toast.error("Erreur réseau")
        }
    }

    return (
        <Form   {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl><Textarea rows={5} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    )
}
