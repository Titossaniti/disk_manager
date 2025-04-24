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
import {Separator} from "@/components/ui/separator";
import {useIsMobile} from "@/hooks/use-mobile";
import {SeparatorVertical} from "lucide-react";

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
    const isMobile = useIsMobile()
    const [loading, setLoading] = useState(false)
    const [showEmptyMessage, setShowEmptyMessage] = useState(false)
    const [groupBy, setGroupBy] = useState<"month" | "year">("month")
    const [globalStats, setGlobalStats] = useState({
        sold: 0,
        inSale: 0,
        notInSale: 0,
        revenue: 0,
        margin: 0,
    })

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
                setGlobalStats({
                    sold: json.sold,
                    inSale: json.inSale,
                    notInSale: json.notInSale,
                    revenue: json.revenue,
                    margin: json.margin,
                })
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
        const from = new Date(fromYear, groupBy === "year" ? 0 : fromMonth)
        const to = new Date(toYear, groupBy === "year" ? 11 : toMonth)

        const filtered = allStats.filter((s) => {
            const date = new Date(s.year, s.month - 1)
            return date >= from && date <= to
        })

        if (groupBy === "month") {
            setDisplayedStats(filtered)
        } else {
            const grouped = filtered.reduce<Record<number, MonthlyStat>>((acc, item) => {
                if (!acc[item.year]) {
                    acc[item.year] = {
                        year: item.year,
                        month: 1,
                        revenue: 0,
                        margin: 0,
                        sold: 0,
                        label: String(item.year),
                    }
                }
                acc[item.year].revenue += item.revenue
                acc[item.year].margin += item.margin
                acc[item.year].sold += item.sold
                return acc
            }, {})

            setDisplayedStats(Object.values(grouped).sort((a, b) => a.year - b.year))
        }
    }, [fromMonth, fromYear, toMonth, toYear, allStats, groupBy])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques filtrées</CardTitle>
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
                            <Separator orientation={"vertical"} className="hidden sm:block" />
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

                <div className="mt-4 border rounded-md p-2 flex gap-2 flex-col w-fit">
                    <p className="text-sm text-muted-foreground px-1">Filtres</p>
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
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-[300px]"/>
                ) : showEmptyMessage ? (
                    <p className="text-base text-center text-muted-foreground py-4">Veuillez sélectionner au moins un filtre.</p>
                ) : displayedStats.every((d) => d.revenue === 0 && d.margin === 0 && d.sold === 0) ? (
                    <p className="text-base text-center text-muted-foreground py-4">Aucune donnée pour ce filtrage.</p>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                <Separator className="mt-4"/>
                {!loading && !showEmptyMessage && displayedStats.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm font-medium mb-4 px-1">
                            Statistiques de la sélection (toutes années confondues)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <Card className="p-4">
                                <div className="text-xs text-muted-foreground">Vendus</div>
                                <div className="text-lg font-semibold text-foreground">
                                    {new Intl.NumberFormat("fr-FR").format(globalStats.sold)}
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">En vente</div>
                                <div className="text-lg font-semibold text-foreground">
                                    {new Intl.NumberFormat("fr-FR").format(globalStats.inSale)}
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">À mettre en vente</div>
                                <div className="text-lg font-semibold text-foreground">
                                    {new Intl.NumberFormat("fr-FR").format(globalStats.notInSale)}
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">Chiffre d'affaires</div>
                                <div className="text-lg font-semibold text-foreground">
                                    {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(globalStats.revenue)} €
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-xs text-muted-foreground mb-1">Marge</div>
                                <div className="text-lg font-semibold text-foreground">
                                    {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(globalStats.margin)} €
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}
