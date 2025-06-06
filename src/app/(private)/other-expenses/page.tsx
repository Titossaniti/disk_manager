"use client"

import React, { useEffect, useState } from "react"
import { OtherBuy, OtherBuyForm } from "@/schema/otherBuy"
import { OtherExpensesTable } from "@/components/other-expenses-table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {TablePagination} from "@/components/table-pagination";
import BackButton from "@/components/back-button";

type OtherBuyPaginatedResponse = {
    content: OtherBuy[]
    pagination: {
        page: number
        size: number
        totalElements: number
        totalPages: number
        first: boolean
        last: boolean
        sortBy: string | null
        direction: string | null
    }
    totals: {
        totalBuyPrice: number
        totalBuyPriceWithFees: number
    }
}


export default function OtherExpensesPage() {
    const [expenses, setExpenses] = useState<OtherBuy[]>([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [updatedRows, setUpdatedRows] = useState<Record<number, Partial<OtherBuy>>>({})

    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)
    const [pagination, setPagination] = useState<OtherBuyPaginatedResponse["pagination"] | null>(null)
    const [totals, setTotals] = useState<OtherBuyPaginatedResponse["totals"] | null>(null)



    useEffect(() => {
        async function fetchExpenses() {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys?page=${page}&size=${size}&sortBy=buyDate&direction=desc`, {
                    credentials: "include",
                })
                const json: OtherBuyPaginatedResponse = await res.json()
                setExpenses(json.content)
                setPagination(json.pagination)
                setTotals(json.totals)
            } catch (err) {
                console.error("Erreur fetch other-buys", err)
            } finally {
                setLoading(false)
            }
        }

        fetchExpenses()
    }, [page, size])

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
            toast.success("Modifications enregistrées")
        } catch (e) {
            console.error("Erreur lors de la sauvegarde", e)
            toast.error("Échec de la mise à jour")
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/other-buys/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            setExpenses((prev) => prev.filter((e) => e.id !== id))
            toast.success("Dépense supprimée")
        } catch (e) {
            console.error("Erreur suppression", e)
            toast.error("Erreur lors de la suppression de la dépense")
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
            toast.success("Dépense ajoutée")
        } catch (e) {
            console.error("Erreur ajout", e)
            toast.error("Erreur lors de l'ajout de la dépense")
        }
    }

    return (
        <div className="space-y-6 p-6">
            <BackButton/>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Autres dépenses</h1>
                    <p className="text-muted-foreground">
                        Activez l'édition pour ajouter, modifier et supprimer des frais annexes.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {editMode && (
                        <Button className="w-full sm:w-auto" onClick={handleSaveAll}>
                            Enregistrer les modifications
                        </Button>
                    )}
                    <Button
                        variant={editMode ? "outline" : "default"}
                        className="w-full sm:w-auto"
                        onClick={() => setEditMode((v) => !v)}
                    >
                        {editMode ? "Quitter le mode édition" : "Activer l'édition"}
                    </Button>
                </div>
            </div>

            <OtherExpensesTable
                expenses={{ content: expenses, totals: totals! }}
                loading={loading}
                editMode={editMode}
                updatedRows={updatedRows}
                onUpdateRow={handleUpdateRow}
                onDelete={handleDelete}
                onAddNew={handleAdd}
            />
            {pagination && (
                <TablePagination
                    pagination={pagination}
                    page={page}
                    setPage={setPage}
                    size={size}
                    setSize={setSize}
                />
            )}
        </div>
    )
}
