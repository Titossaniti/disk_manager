"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { addMonths, format, isBefore } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type StatKey = "countSoldThisPeriod" | "revenueThisPeriod" | "marginThisPeriod"

type MonthlyStat = {
    label: string
    countSoldThisPeriod: number
    revenueThisPeriod: number
    marginThisPeriod: number
}

const STAT_LABELS: Record<StatKey, string> = {
    countSoldThisPeriod: "Ventes",
    revenueThisPeriod: "Chiffre d'affaires",
    marginThisPeriod: "Marge",
}

export default function StatisticsChart() {
    const [data, setData] = useState<MonthlyStat[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedKey, setSelectedKey] = useState<StatKey>("countSoldThisPeriod")

    const [fromDate, setFromDate] = useState<Date>(() => addMonths(new Date(), -23))
    const [toDate, setToDate] = useState<Date>(() => new Date())

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            const months = []

            const cursor = new Date(fromDate)
            while (cursor <= toDate) {
                const fromStr = new Date(cursor.getFullYear(), cursor.getMonth(), 1).toISOString().split("T")[0]
                const toStr = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).toISOString().split("T")[0]
                const label = format(cursor, "MMM yy", { locale: fr })

                months.push({ fromStr, toStr, label })
                cursor.setMonth(cursor.getMonth() + 1)
            }

            const results: MonthlyStat[] = []

            for (const m of months) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats?from=${m.fromStr}&to=${m.toStr}`, {
                        credentials: "include",
                        cache: "no-store",
                    })
                    const json = await res.json()
                    results.push({
                        label: m.label,
                        countSoldThisPeriod: json.countSoldThisPeriod ?? 0,
                        revenueThisPeriod: json.revenueThisPeriod ?? 0,
                        marginThisPeriod: json.marginThisPeriod ?? 0,
                    })
                } catch {
                    results.push({
                        label: m.label,
                        countSoldThisPeriod: 0,
                        revenueThisPeriod: 0,
                        marginThisPeriod: 0,
                    })
                }
            }

            setData(results)
            setLoading(false)
        }

        fetchStats()
    }, [fromDate, toDate])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques mensuelles</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                    {Object.keys(STAT_LABELS).map((key) => (
                        <Button
                            key={key}
                            variant={key === selectedKey ? "default" : "outline"}
                            onClick={() => setSelectedKey(key as StatKey)}
                            size="sm"
                        >
                            {STAT_LABELS[key as StatKey]}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-4 mt-4 flex-wrap">
                    {/* Sélection date de début */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                Début : {format(fromDate, "dd MMM yyyy", { locale: fr })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={fromDate}
                                onSelect={(date) => date && isBefore(date, toDate) && setFromDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Sélection date de fin */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                Fin : {format(toDate, "dd MMM yyyy", { locale: fr })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={toDate}
                                onSelect={(date) => date && isBefore(fromDate, date) && setToDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-64" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey={selectedKey} fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
