"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

type MonthlyStat = {
    year: number
    month: number
    revenue: number
    margin: number
    sold: number
    label?: string
}

const chartConfig = {
    revenue: {
        label: "Chiffre d'affaires",
        color: "hsl(160 48% 49%)",
    },
    margin: {
        label: "Marge",
        color: "hsl(220 70% 49.6%)",
    },
    sold: {
        label: "Ventes",
        color: "hsl(220 70% 49.6%)",
    },
} satisfies ChartConfig

type ViewMode = "stacked" | "sold"

export default function GlobalStatisticsChart() {
    const [allStats, setAllStats] = useState<MonthlyStat[]>([])
    const [displayedStats, setDisplayedStats] = useState<MonthlyStat[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>("sold")

    const [now] = useState(() => new Date())
    const [fromMonth, setFromMonth] = useState(() => now.getMonth())
    const [fromYear, setFromYear] = useState(() => now.getFullYear() - 1)
    const [toMonth, setToMonth] = useState(() => now.getMonth())
    const [toYear, setToYear] = useState(() => now.getFullYear())

    const monthOptions = [...Array(12).keys()].map((m) => ({
        value: m,
        label: format(new Date(2024, m, 1), "MMMM", { locale: fr }),
    }))
    const yearOptions = Array.from({ length: now.getFullYear() - 2000 + 1 }, (_, i) => 2000 + i)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats/by-month/filtered`, {
                    credentials: "include",
                    cache: "no-store",
                })
                const json = await res.json()

                const monthlyStats = json.monthlyStats as MonthlyStat[]

                const withLabels = monthlyStats.map((item) => {
                    const label =
                        typeof window !== "undefined"
                            ? format(new Date(item.year, item.month - 1, 1), "MMM yy", { locale: fr })
                            : `${item.month}/${item.year}`
                    return { ...item, label }
                })

                setAllStats(withLabels)
            } catch (err) {
                console.error("Erreur fetch:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    useEffect(() => {
        if (!allStats.length) return
        const from = new Date(fromYear, fromMonth)
        const to = new Date(toYear, toMonth)

        if (from > to) {
            setDisplayedStats([])
            return
        }

        const filtered = allStats.filter((s) => {
            const date = new Date(s.year, s.month - 1)
            return date >= from && date <= to
        })

        setDisplayedStats(filtered)
    }, [fromMonth, fromYear, toMonth, toYear, allStats])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques mensuelles</CardTitle>
                <div className="flex flex-wrap justify-between mt-4 gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={viewMode === "sold" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("sold")}
                        >
                            Ventes
                        </Button>
                        <Button
                            variant={viewMode === "stacked" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("stacked")}
                        >
                            Chiffre d'affaires & Marge
                        </Button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Select value={String(fromMonth)} onValueChange={(v) => setFromMonth(Number(v))}>
                            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Mois début" /></SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((m) => (
                                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
                            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Année début" /></SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(toMonth)} onValueChange={(v) => setToMonth(Number(v))}>
                            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Mois fin" /></SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((m) => (
                                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
                            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Année fin" /></SelectTrigger>
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
                    <Skeleton className="w-full h-[300px]" />
                ) : displayedStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée pour cette période.</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[500px] w-full">
                        <BarChart data={displayedStats}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent className="min-w-[260px] text-base p-2"/>} />
                            <ChartLegend content={<ChartLegendContent />} />

                            {viewMode === "sold" ? (
                                <Bar dataKey="sold" fill={chartConfig.sold.color} radius={[4, 4, 0, 0]} />
                            ) : (
                                <>
                                    <Bar dataKey="margin" stackId="a" fill={chartConfig.margin.color} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="revenue" stackId="a" fill={chartConfig.revenue.color} radius={[4, 4, 0, 0]} />
                                </>
                            )}
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
