"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatISO } from "date-fns"
import {DateTimePicker} from "@/components/ui/datetime-picker";
import {Checkbox, Label} from "@/components/ui";
import React from "react";
import {fr} from "date-fns/locale";

const formSchema = z.object({
    name: z.string().min(1, "Nom requis"),
    buyPrice: z.coerce.number().positive("Prix requis"),
    buyFees: z.coerce.number().optional(),
    category: z.string().min(1, "Catégorie requise"),
    buyDate: z.date({ required_error: "Date requise" }),
})

type FormData = z.infer<typeof formSchema>

export function OtherExpensesForm() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            buyDate: new Date(),
        },
    })

    const onSubmit = async (data: FormData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    buyDate: formatISO(data.buyDate, { representation: "date" }),
                }),
            })

            if (!res.ok) throw new Error("Échec de l'envoi")

            form.reset()
            toast.success("Dépense ajoutée")
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors de l'ajout")
        }
    }

    return (
        <div className="space-y-6 rounded-lg shadow p-4 bg-muted">
            <div className="space-y-1">
                <h2>Ajouter une dépense</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Input placeholder="Nom de la dépense" {...form.register("name")} />
                    <Input type="number" step="0.01" placeholder="Prix" {...form.register("buyPrice")} />
                    <Input type="number" step="0.01" placeholder="Frais (optionnel)" {...form.register("buyFees")} />
                    <Input placeholder="Catégorie" {...form.register("category")} />
                    <DateTimePicker
                        granularity="day"
                        locale={fr}
                        displayFormat={{ hour24: "PPP" }}
                        value={form.watch("buyDate")}
                        onChange={(date) => form.setValue("buyDate", date)}
                        placeholder="Choisir une date"
                        className="cursor-pointer"
                    />
                    <Button type="submit">Ajouter</Button>
                </form>
            </div>
        </div>
    )
}