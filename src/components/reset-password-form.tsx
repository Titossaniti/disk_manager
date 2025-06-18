"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { Disc3 } from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Le mot de passe doit faire au moins 8 caractères')
            .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
            .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir un caractère spécial'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas.',
        path: ['confirmPassword'],
    })

export default function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async ({ newPassword }: { newPassword: string }) => {
        if (!token) {
            toast.error('Lien invalide ou expiré.')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la réinitialisation.')
            }

            toast.success('Mot de passe modifié avec succès.')
            router.push('/login')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center px-4 pt-20 space-y-6">
            <Link
                href="/login"
                className="flex items-center gap-2 font-medium text-sm text-muted-foreground"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Disc3 className="size-4" />
                </div>
                <p>Disk Manager</p>
            </Link>

            <Card className="w-full max-w-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Réinitialiser le mot de passe</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Entrez un nouveau mot de passe sécurisé pour votre compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouveau mot de passe</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Nouveau mot de passe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmer le mot de passe</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Répétez le mot de passe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'En cours...' : 'Réinitialiser'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
