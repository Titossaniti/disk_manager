"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

type RawStat = {
    year: number
    month: number
    revenue: number
    margin: number
    sold: number
}

type StatKey = "sold" | "revenue" | "margin"

const LABELS: Record<StatKey, string> = {
    sold: "Ventes",
    revenue: "Chiffre d'affaires",
    margin: "Marge",
}

export default function MonthlyStatisticsChart() {
    const [allStats, setAllStats] = useState<RawStat[]>([])
    const [displayedStats, setDisplayedStats] = useState<RawStat[]>([])
    const [selectedKey, setSelectedKey] = useState<StatKey>("sold")
    const [loading, setLoading] = useState(true)

    // selected dates
    const currentDate = new Date()
    const [fromMonth, setFromMonth] = useState<number>(currentDate.getMonth())
    const [fromYear, setFromYear] = useState<number>(currentDate.getFullYear() - 1)
    const [toMonth, setToMonth] = useState<number>(currentDate.getMonth())
    const [toYear, setToYear] = useState<number>(currentDate.getFullYear())

    const monthOptions = [...Array(12).keys()].map((m) => ({
        value: m,
        label: format(new Date(2024, m, 1), "MMMM", { locale: fr }),
    }))

    const yearOptions = Array.from({ length: currentDate.getFullYear() - 2000 + 1 }, (_, i) => 2000 + i)

    useEffect(() => {
        async function fetchAllStats() {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats/by-month`, {
                    credentials: "include",
                    cache: "no-store",
                })
                const json = await res.json()
                setAllStats(json)
            } catch (err) {
                console.error("Erreur fetch stats globales :", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAllStats()
    }, [])

    useEffect(() => {
        if (!allStats.length) return

        const from = new Date(fromYear, fromMonth, 1)
        const to = new Date(toYear, toMonth, 1)

        const filtered = allStats.filter((s) => {
            const date = new Date(s.year, s.month - 1, 1)
            return date >= from && date <= to
        })

        setDisplayedStats(
            filtered.map((s) => ({
                ...s,
                label: format(new Date(s.year, s.month - 1, 1), "MMM yy", { locale: fr }),
            }))
        )
    }, [fromMonth, fromYear, toMonth, toYear, allStats])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques mensuelles</CardTitle>
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    {/* Choix de la donnée */}
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(LABELS).map((key) => (
                            <Button
                                key={key}
                                variant={key === selectedKey ? "default" : "outline"}
                                onClick={() => setSelectedKey(key as StatKey)}
                                size="sm"
                            >
                                {LABELS[key as StatKey]}
                            </Button>
                        ))}
                    </div>

                    {/* Choix des dates */}
                    <div className="flex gap-2 flex-wrap">
                        <Select value={String(fromMonth)} onValueChange={(v) => setFromMonth(Number(v))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Mois début" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((m) => (
                                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Année début" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(toMonth)} onValueChange={(v) => setToMonth(Number(v))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Mois fin" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((m) => (
                                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Année fin" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-64" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={displayedStats}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip/>
                            <Bar dataKey={selectedKey} fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
