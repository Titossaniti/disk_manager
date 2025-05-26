"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const schema = z.object({
    name: z.string().min(2, "Nom requis").max(50, "Le nom doit contenir moins de 50 caractères."),
    email: z.string().email("Email invalide"),
    message: z.string().min(5, "Message trop court").max(1000, "Votre message doit contenir moins de 1000 caractères."),
});

type ContactFormData = z.infer<typeof schema>;

export default function ContactForm() {

    const form = useForm<ContactFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });


    const onSubmit = async (data: ContactFormData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success("Message envoyé !");
                form.reset();
            } else {
                toast.error("Erreur lors de l'envoi.");
            }
        } catch (error) {
            toast.error("Erreur réseau.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl><Textarea rows={5} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}
