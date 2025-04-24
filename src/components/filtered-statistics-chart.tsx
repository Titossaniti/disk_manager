"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox" // tu dois avoir un composant custom Combobox

type MonthlyStat = {
    year: number
    month: number
    revenue: number
    margin: number
    sold: number
    label: string
}

export default function FilteredStatsChart() {
    const [stats, setStats] = useState<MonthlyStat[]>([])
    const [loading, setLoading] = useState(false)

    const [artists, setArtists] = useState<string[]>([])
    const [buyPlaceOptions, setBuyPlaceOptions] = useState<string[]>([])
    const [sellingPlaceOptions, setSellingPlaceOptions] = useState<string[]>([])

    const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
    const [buyPlace, setBuyPlace] = useState("")
    const [sellingPlace, setSellingPlace] = useState("")

    const now = new Date()
    const defaultFrom = new Date(now.getFullYear() - 2, now.getMonth())
    const defaultTo = now
    const fromStr = defaultFrom.toISOString().split("T")[0]
    const toStr = defaultTo.toISOString().split("T")[0]

    // Récupère les artistes au mount
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/artists`)
            .then(res => res.json())
            .then(setArtists)
    }, [])

    // Fetch pour buyPlace
    useEffect(() => {
        if (buyPlace.length < 3) return
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/buy-places`)
            .then(res => res.json())
            .then(setBuyPlaceOptions)
    }, [buyPlace])

    // Fetch pour sellingPlace
    useEffect(() => {
        if (sellingPlace.length < 3) return
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/selling-places`)
            .then(res => res.json())
            .then(setSellingPlaceOptions)
    }, [sellingPlace])

    useEffect(() => {
        if (!selectedArtist) return
        setLoading(true)
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/stats/by-month/filtered`)
        url.searchParams.set("from", fromStr)
        url.searchParams.set("to", toStr)
        url.searchParams.set("artist", selectedArtist)
        if (buyPlace.length >= 3) url.searchParams.set("buyPlace", buyPlace)
        if (sellingPlace.length >= 3) url.searchParams.set("sellingPlace", sellingPlace)

        fetch(url.toString(), { credentials: "include", cache: "no-store" })
            .then(res => res.json())
            .then(data => {
                const monthly = data.monthlyStats.map((s: any) => ({
                    ...s,
                    label: format(new Date(s.year, s.month - 1, 1), "MMM yy", { locale: fr }),
                }))
                setStats(monthly)
            })
            .catch(err => console.error("Erreur fetch filtered stats:", err))
            .finally(() => setLoading(false))
    }, [selectedArtist, buyPlace, sellingPlace])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistiques filtrées</CardTitle>
                <div className="mt-4 flex flex-wrap gap-3">
                    <div className="w-[200px]">
                        <Combobox
                            label="Artiste"
                            options={artists}
                            placeholder="Sélectionne un artiste"
                            value={selectedArtist}
                            onChange={setSelectedArtist}
                        />
                    </div>
                    <div className="w-[200px] relative">
                        <Input
                            placeholder="Lieu d'achat (min 3 lettres)"
                            value={buyPlace}
                            onChange={(e) => setBuyPlace(e.target.value)}
                            list="buy-place-list"
                        />
                        <datalist id="buy-place-list">
                            {buyPlaceOptions.map((bp) => (
                                <option key={bp} value={bp} />
                            ))}
                        </datalist>
                    </div>
                    <div className="w-[200px] relative">
                        <Input
                            placeholder="Lieu de vente (min 3 lettres)"
                            value={sellingPlace}
                            onChange={(e) => setSellingPlace(e.target.value)}
                            list="selling-place-list"
                        />
                        <datalist id="selling-place-list">
                            {sellingPlaceOptions.map((sp) => (
                                <option key={sp} value={sp} />
                            ))}
                        </datalist>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-[300px]" />
                ) : stats.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucune donnée pour cette période.</p>
                ) : (
                    <ChartContainer
                        config={{
                            sold: { label: "Ventes", color: "hsl(220 70% 49.6%)" },
                            margin: { label: "Marge", color: "hsl(160 48% 49%)" },
                            revenue: { label: "Chiffre d'affaires", color: "hsl(41.1 70% 60%)" },
                        }}
                        className="h-[500px] w-full"
                    >
                        <BarChart data={stats}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="margin" stackId="a" fill="hsl(160 48% 49%)" />
                            <Bar dataKey="revenue" stackId="a" fill="hsl(41.1 70% 60%)" />
                            <Bar dataKey="sold" fill="hsl(220 70% 49.6%)" />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
