'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Disc3 } from 'lucide-react'

const schema = z.object({
    email: z.string().email('Email invalide'),
})

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    })

    const onSubmit = async ({ email }: { email: string }) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de l’envoi du mail.')
            }

            toast.success('Si cet email est bien enregistré, un lien de réinitialisation a été envoyé.')
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
                    <CardTitle className="text-3xl">Mot de passe oublié</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="exemple@mail.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Envoi en cours...' : 'Recevoir le lien'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
