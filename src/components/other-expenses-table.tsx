"use client"

import { OtherBuy } from "@/schema/otherBuy"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function OtherExpensesTable() {
    const [expenses, setExpenses] = useState<OtherBuy[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchExpenses() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys`, {
                    credentials: "include",
                })
                const json = await res.json()
                setExpenses(json)
            } catch (err) {
                console.error("Erreur fetch other-buys", err)
            } finally {
                setLoading(false)
            }
        }

        fetchExpenses()
    }, [])

    return (
        <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Toutes les autres dépenses</h2>
            {loading ? (
                <Skeleton className="w-full h-[200px]" />
            ) : expenses.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune dépense enregistrée.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                        <thead>
                        <tr className="bg-muted">
                            <th className="px-2 py-1 border">Nom</th>
                            <th className="px-2 py-1 border">Prix</th>
                            <th className="px-2 py-1 border">Frais</th>
                            <th className="px-2 py-1 border">Date</th>
                            <th className="px-2 py-1 border">Catégorie</th>
                        </tr>
                        </thead>
                        <tbody>
                        {expenses.map((e) => (
                            <tr key={e.id}>
                                <td className="border px-2 py-1">{e.name}</td>
                                <td className="border px-2 py-1">{e.buyPrice.toFixed(2)} €</td>
                                <td className="border px-2 py-1">{e.buyFees?.toFixed(2) ?? "0.00"} €</td>
                                <td className="border px-2 py-1">{format(new Date(e.buyDate), "dd MMM yyyy", { locale: fr })}</td>
                                <td className="border px-2 py-1">{e.category}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}
