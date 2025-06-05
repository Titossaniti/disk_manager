'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({
    newPassword: z
        .string()
        .min(8, 'Le mot de passe doit faire au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir un caractère spécial'),
})

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const [loading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { newPassword: '' },
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
                throw new Error(errorData.message || 'Erreur lors de la réinitialisation')
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
        <div className="max-w-md mx-auto mt-24 p-6 border rounded-2xl shadow-xl">
            <h1 className="text-2xl font-semibold mb-6 text-center">Réinitialiser le mot de passe</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'En cours...' : 'Réinitialiser'}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
