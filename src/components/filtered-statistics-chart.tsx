"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, CartesianGrid, XAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Combobox } from "@/components/ui/combobox"

type MonthlyStat = {
    year: number
    month: number
    revenue: number
    margin: number
    sold: number
    label: string
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

export default function FilteredStatsChart() {
    const now = new Date()
    const [fromMonth, setFromMonth] = useState(now.getMonth())
    const [fromYear, setFromYear] = useState(now.getFullYear() - 1)
    const [toMonth, setToMonth] = useState(now.getMonth())
    const [toYear, setToYear] = useState(now.getFullYear())

    const monthOptions = [...Array(12).keys()].map((m) => ({
        value: m,
        label: format(new Date(2024, m, 1), "MMMM", { locale: fr }),
    }))
    const yearOptions = Array.from({ length: now.getFullYear() - 2003 + 1 }, (_, i) => 2003 + i)

    const [artist, setArtist] = useState("")
    const [buyPlace, setBuyPlace] = useState("")
    const [sellingPlace, setSellingPlace] = useState("")
    const [allStats, setAllStats] = useState<MonthlyStat[]>([])
    const [displayedStats, setDisplayedStats] = useState<MonthlyStat[]>([])
    const [viewMode, setViewMode] = useState<ViewMode>("sold")
    const [loading, setLoading] = useState(false)
    const [showEmptyMessage, setShowEmptyMessage] = useState(false)

    useEffect(() => {
        const fetchFilteredStats = async () => {
            if (!artist && buyPlace.length < 3 && sellingPlace.length < 3) {
                setAllStats([])
                setDisplayedStats([])
                setShowEmptyMessage(true)
                return
            }
            setShowEmptyMessage(false)

            setLoading(true)

            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats/by-month/filtered`)
            if (artist) url.searchParams.append("artist", artist)
            if (buyPlace.length >= 3) url.searchParams.append("buyPlace", buyPlace)
            if (sellingPlace.length >= 3) url.searchParams.append("sellingPlace", sellingPlace)

            try {
                const res = await fetch(url.toString(), { credentials: "include", cache: "no-store" })
                if (!res.ok) throw new Error(`Erreur ${res.status}`)
                const json = await res.json()
                const withLabels = json.monthlyStats.map((item: any) => ({
                    ...item,
                    label: format(new Date(item.year, item.month - 1, 1), "MMM yy", { locale: fr }),
                }))
                setAllStats(withLabels)
            } catch (err) {
                console.error("Erreur stats filtrées:", err)
                setAllStats([])
            } finally {
                setLoading(false)
            }
        }

        fetchFilteredStats()
    }, [artist, buyPlace, sellingPlace])

    useEffect(() => {
        if (!allStats.length) return
        const from = new Date(fromYear, fromMonth)
        const to = new Date(toYear, toMonth)
        const filtered = allStats.filter((s) => {
            const date = new Date(s.year, s.month - 1)
            return date >= from && date <= to
        })
        setDisplayedStats(filtered)
    }, [fromMonth, fromYear, toMonth, toYear, allStats])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques filtrées</CardTitle>

                <div className="flex flex-wrap justify-between mt-4 gap-4">
                    <div className="flex flex-wrap gap-2">
                        <Combobox
                            label="Artiste"
                            fetchUrl="/vinyles/artists"
                            value={artist}
                            onValueChange={setArtist}
                            strictList
                        />
                        <Combobox
                            label="Lieu d’achat"
                            fetchUrl="/vinyles/buy-places"
                            value={buyPlace}
                            onValueChange={setBuyPlace}
                        />
                        <Combobox
                            label="Lieu de vente"
                            fetchUrl="/vinyles/selling-places"
                            value={sellingPlace}
                            onValueChange={setSellingPlace}
                        />
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

                    <div className="flex flex-wrap gap-2 mt-2">
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
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-[300px]" />
                ) : showEmptyMessage ? (
                    <p className="text-sm text-muted-foreground">Veuillez sélectionner au moins un filtre.</p>
                ) : displayedStats.every((d) => d.revenue === 0 && d.margin === 0 && d.sold === 0) ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée pour ce filtrage.</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
