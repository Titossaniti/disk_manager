"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {ChartColumn} from 'lucide-react'
import Link from "next/link";

type Stats = {
    countInSale: number
    countSold: number
    countNotInSale: number
    countToPutInSale: number
    countIsReceived: number
    totalRevenue: number
    totalMargin: number
    totalOtherBuyExpenses: number
    countSoldThisPeriod: number | null
    revenueThisPeriod: number | null
    marginThisPeriod: number | null
    otherBuyExpensesThisPeriod: number | null
}

export default function DashboardStat() {
    const [currentStats, setCurrentStats] = useState<Stats | null>(null)
    const [lastMonthStats, setLastMonthStats] = useState<Stats | null>(null)
    const [showNumbers, setShowNumbers] = useState(true)

    const formatNumber = (value: number | string | null, unit?: string) => {
        if (value == null) return "-"
        const number = typeof value === "string" ? parseFloat(value) : value

        return number.toLocaleString("fr-FR", {
            minimumFractionDigits: unit === "€" ? 2 : 0,
            maximumFractionDigits: unit === "€" ? 2 : 0,
        }) + (unit ?? "")
    }

    useEffect(() => {
        async function fetchStats() {
            const now = new Date()
            const from = new Date(now.getFullYear(), now.getMonth(), 1)
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            const fromStr = from.toISOString().split("T")[0]
            const toStr = to.toISOString().split("T")[0]

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats?from=${fromStr}&to=${toStr}`, {
                    credentials: "include",
                    cache: "no-store",
                })
                const data = await res.json()
                setCurrentStats(data)
            } catch (err) {
                console.error("Erreur récupération stats actuelles :", err)
            }
        }

        async function fetchLastMonth() {
            const now = new Date()
            const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const to = new Date(now.getFullYear(), now.getMonth(), 0)

            const fromStr = from.toISOString().split("T")[0]
            const toStr = to.toISOString().split("T")[0]

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats?from=${fromStr}&to=${toStr}`, {
                    credentials: "include",
                    cache: "no-store",
                })
                const data = await res.json()
                setLastMonthStats(data)
            } catch (err) {
                console.error("Erreur récupération stats précédent mois :", err)
            }
        }

        fetchStats()
        fetchLastMonth()
    }, [])

    const StatCard = ({
                          title,
                          value,
                          unit,
                          className,
                      }: {
        title: string
        value: number | string | null
        unit?: string
        className?: string
    }) => (
        <Card className={cn("flex flex-col justify-between", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{unit === "€" ? "En euros" : "Nombre total"}</CardDescription>
            </CardHeader>
            <CardContent>
                {value !== undefined ? (
                    <p className="text-2xl font-semibold">
                        {showNumbers ? formatNumber(value, unit) : "* * *"}
                    </p>
                ) : (
                    <Skeleton className="h-8 w-24" />
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-muted-foreground text-xl" >Statistiques générales</h2>
                <Button variant="outline" className="hover:cursor-pointer" size="sm" onClick={() => setShowNumbers(!showNumbers)}>
                    {showNumbers ? "Masquer les chiffres" : "Afficher les chiffres"}
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>Statistiques détaillées</CardTitle>
                        <CardDescription>Voir l'ensemble des chiffres</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/statistics">
                            <Button variant="default" className="w-full cursor-pointer">
                                <ChartColumn className="mr-2 h-5 w-5" />
                                Accéder aux statistiques
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <StatCard title="Vendus ce mois-ci" value={currentStats?.countSoldThisPeriod} />
                <StatCard title="Vendus le mois dernier" value={lastMonthStats?.countSoldThisPeriod} />
                <StatCard title="Vendus" value={currentStats?.countSold} />
                <StatCard title="Réceptionné" value={currentStats?.countIsReceived} />
                <StatCard title="En vente" value={currentStats?.countInSale} />

                <div className="grid grid-cols-1 sm:grid-cols-2 col-span-1 md:col-span-2 lg:col-span-3 gap-4">
                    <StatCard title="Pas encore en vente" value={currentStats?.countNotInSale} />
                    <StatCard title="À mettre en vente" value={currentStats?.countToPutInSale} />
                </div>
            </div>
        </div>
    )
}
