// ✅ other-expenses/page.tsx
"use client"

import { useEffect, useState } from "react"
import { OtherBuy, OtherBuyForm } from "@/schema/otherBuy"
import { OtherExpensesTable } from "@/components/other-expenses-table"
import { Button } from "@/components/ui/button"

export default function OtherExpensesPage() {
    const [expenses, setExpenses] = useState<OtherBuy[]>([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [updatedRows, setUpdatedRows] = useState<Record<number, Partial<OtherBuy>>>({})

    useEffect(() => {
        async function fetchExpenses() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys`, {
                    credentials: "include",
                })
                const json = await res.json()
                const sorted = json.sort((a: OtherBuy, b: OtherBuy) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime())
                setExpenses(sorted)
            } catch (err) {
                console.error("Erreur fetch other-buys", err)
            } finally {
                setLoading(false)
            }
        }

        fetchExpenses()
    }, [])

    const handleUpdateRow = (id: number, updated: Partial<OtherBuy>) => {
        setUpdatedRows((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...updated },
        }))
    }

    const handleSaveAll = async () => {
        try {
            for (const [id, body] of Object.entries(updatedRows)) {
                const originalExpense = expenses.find(e => e.id === Number(id))
                if (!originalExpense) continue

                const bodyToSend = {
                    name: body.name ?? originalExpense.name,
                    buyPrice: body.buyPrice !== undefined && !isNaN(body.buyPrice) ? body.buyPrice : 0,
                    buyFees: body.buyFees !== undefined && !isNaN(body.buyFees) ? body.buyFees : 0,
                    category: body.category ?? originalExpense.category,
                    buyDate: body.buyDate ? new Date(body.buyDate).toISOString().split("T")[0] : originalExpense.buyDate,
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(bodyToSend),
                })

                if (!response.ok) throw new Error("Erreur lors de la mise à jour")
            }

            setExpenses(prev =>
                prev.map(expense => ({
                    ...expense,
                    ...updatedRows[expense.id]
                })).sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime())
            )

            setUpdatedRows({})
            setEditMode(false)
        } catch (e) {
            console.error("Erreur lors de la sauvegarde", e)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            setExpenses((prev) => prev.filter((e) => e.id !== id))
        } catch (e) {
            console.error("Erreur suppression", e)
        }
    }

    const handleAdd = async (data: OtherBuyForm) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    buyFees: data.buyFees ?? 0,
                }),
            })

            if (!res.ok) throw new Error("Erreur serveur")

            const created: OtherBuy = await res.json()
            setExpenses(prev => [created, ...prev])
        } catch (e) {
            console.error("Erreur ajout", e)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Autres dépenses</h1>
                    <p className="text-muted-foreground">Activez l'édition pour ajouter, modifier et supprimer des frais annexes.</p>
                </div>
                <div className="flex gap-2">
                    {editMode && <Button onClick={handleSaveAll}>Enregistrer les modifications</Button>}
                    <Button variant={editMode ? "outline" : "default"} onClick={() => setEditMode((v) => !v)}>
                        {editMode ? "Quitter le mode édition" : "Activer l'édition"}
                    </Button>
                </div>
            </div>

            <OtherExpensesTable
                expenses={expenses}
                loading={loading}
                editMode={editMode}
                updatedRows={updatedRows}
                onUpdateRow={handleUpdateRow}
                onDelete={handleDelete}
                onAddNew={handleAdd}
            />
        </div>
    )
}
