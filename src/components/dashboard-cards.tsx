// app/components/dashboard-cards.tsx
"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardCards() {
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-muted-foreground text-xl">Rubriques principales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card onClick={() => router.push("/vinyles")} className="group cursor-pointer hover:shadow-lg transition">
                    <CardHeader>
                        <CardTitle>Accéder à mes vinyles</CardTitle>
                        <CardDescription>Consultez, filtrez et gérez votre collection</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center pt-4">
                        <div className="flex justify-center items-center transition-transform duration-300 group-hover:scale-125">
                            <img src="../android-chrome-192x192.png" alt="Icône Vinyle" className="h-24 w-24 rounded shadow-md" />
                        </div>
                    </CardContent>
                </Card>

                <Card onClick={() => router.push("/create")} className="group cursor-pointer hover:shadow-lg transition">
                    <CardHeader>
                        <CardTitle>Ajouter un disque</CardTitle>
                        <CardDescription>Accédez au formulaire pour ajouter un disque à la base de données</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center pt-4">
                        <div className="transition-transform duration-300 group-hover:scale-125">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    router.push("/create")
                                }}
                                className="rounded-full h-24 w-24 p-0 cursor-pointer border border-2 hover:bg-gray-400"
                                variant="icon"
                            >
                                <Plus className="h-10 w-10" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
