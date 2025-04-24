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
import {Separator} from "@radix-ui/react-select";
import { useIsMobile } from "@/hooks/use-mobile"

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
        color: "hsl(220 70% 49%)",
    },
    sold: {
        label: "Ventes",
        color: "hsl(220 70% 49%)",
    },
} satisfies ChartConfig

type ViewMode = "stacked" | "sold"

export default function GlobalStatisticsChart() {
    const [allStats, setAllStats] = useState<MonthlyStat[]>([])
    const [displayedStats, setDisplayedStats] = useState<MonthlyStat[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>("sold")
    const isMobile = useIsMobile()

    const [now] = useState(() => new Date())
    const [fromMonth, setFromMonth] = useState(() => now.getMonth())
    const [fromYear, setFromYear] = useState(() => now.getFullYear() - 1)
    const [toMonth, setToMonth] = useState(() => now.getMonth())
    const [toYear, setToYear] = useState(() => now.getFullYear())

    const [groupBy, setGroupBy] = useState<"month" | "year">("month")

    const monthOptions = [...Array(12).keys()].map((m) => ({
        value: m,
        label: format(new Date(2024, m, 1), "MMMM", { locale: fr }),
    }))
    const yearOptions = Array.from({ length: now.getFullYear() - 2003 + 1 }, (_, i) => 2003 + i)

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
        const from = new Date(fromYear, groupBy === "year" ? 0 : fromMonth)
        const to = new Date(toYear, groupBy === "year" ? 11 : toMonth)

        if (from > to) {
            setDisplayedStats([])
            return
        }

        const filtered = allStats.filter((s) => {
            const date = new Date(s.year, s.month - 1)
            return date >= from && date <= to
        })

        if (groupBy === "year") {
            const byYear = filtered.reduce<Record<number, MonthlyStat>>((acc, stat) => {
                const { year, sold, revenue, margin } = stat
                if (!acc[year]) {
                    acc[year] = { year, month: 1, sold: 0, revenue: 0, margin: 0, label: String(year) }
                }
                acc[year].sold += sold
                acc[year].revenue += revenue
                acc[year].margin += margin
                return acc
            }, {})
            setDisplayedStats(Object.values(byYear))
        } else {
            setDisplayedStats(filtered)
        }
    }, [fromMonth, fromYear, toMonth, toYear, allStats, groupBy])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques globales</CardTitle>
                <div className="flex flex-wrap justify-between mt-4 gap-4">
                    <div className="border rounded-md p-2 flex gap-2 flex-col min-w-[220px]">
                        <p className="text-sm text-muted-foreground px-1">Affichage</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={viewMode === "sold" ? "default" : "outline"}
                                onClick={() => setViewMode("sold")}
                            >
                                Ventes
                            </Button>
                            <Button
                                variant={viewMode === "stacked" ? "default" : "outline"}
                                onClick={() => setViewMode("stacked")}
                            >
                                {isMobile ? "CA & Marge" : "Chiffre d'affaires & Marge"}
                            </Button>
                            <Separator className="w-[1px] bg-muted hidden sm:block" />
                            <Button
                                variant={groupBy === "month" ? "default" : "outline"}
                                onClick={() => setGroupBy("month")}
                            >
                                Mensuel
                            </Button>
                            <Button
                                variant={groupBy === "year" ? "default" : "outline"}
                                onClick={() => setGroupBy("year")}
                            >
                                Annuel
                            </Button>
                        </div>
                    </div>


                    <div className="flex gap-4 flex-wrap">
                        <div className="border rounded-md p-2 flex gap-2 flex-col min-w-[220px] w-full sm:w-fit">
                            <p className="text-sm text-muted-foreground px-1">Début</p>
                            <div className="flex gap-2">
                                {groupBy === "month" && (
                                    <Select value={String(fromMonth)} onValueChange={(v) => setFromMonth(Number(v))}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Mois début" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((m) => (
                                                <SelectItem key={m.value} value={String(m.value)}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}


                                <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
                                    <SelectTrigger className="w-[100px]"><SelectValue
                                        placeholder="Année début"/></SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((y) => (
                                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="border rounded-md p-2 flex gap-2 flex-col min-w-[220px] w-full sm:w-fit">
                            <p className="text-sm text-muted-foreground px-1">Fin</p>
                            <div className="flex gap-2">
                                {groupBy === "month" && (
                                    <Select value={String(fromMonth)} onValueChange={(v) => setFromMonth(Number(v))}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Mois début" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((m) => (
                                                <SelectItem key={m.value} value={String(m.value)}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}


                                <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
                                    <SelectTrigger className="w-[100px]"><SelectValue
                                        placeholder="Année fin"/></SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((y) => (
                                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-[300px]"/>
                ) : displayedStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée pour cette période.</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[500px] w-full">
                        <BarChart data={displayedStats}>
                            <CartesianGrid vertical={false}/>
                            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false}/>
                            <ChartTooltip content={<ChartTooltipContent className="min-w-[260px] text-base p-2"/>}/>
                            <ChartLegend content={<ChartLegendContent/>}/>

                            {viewMode === "sold" ? (
                                <Bar dataKey="sold" fill={chartConfig.sold.color} radius={[4, 4, 0, 0]}/>
                            ) : (
                                <>
                                    <Bar dataKey="margin" stackId="a" fill={chartConfig.margin.color}
                                         radius={[0, 0, 0, 0]}/>
                                    <Bar dataKey="revenue" stackId="a" fill={chartConfig.revenue.color}
                                         radius={[4, 4, 0, 0]}/>
                                </>
                            )}
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
