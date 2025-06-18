"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Contact, Plus, ReceiptEuro } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react";

type DashboardCardProps = {
    title: string
    description: string
    icon?: React.ReactNode
    imageSrc?: string
    route: string
}

const DashboardCard = ({ title, description, icon, imageSrc, route }: DashboardCardProps) => {
    const router = useRouter()

    return (
        <Card onClick={() => router.push(route)} className="group cursor-pointer hover:shadow-lg transition">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center pt-4">
                <div className="transition-transform duration-300 group-hover:scale-125">
                    {imageSrc ? (
                        <img src={imageSrc} alt="Icône de l'application" className="h-24 w-24 rounded shadow-md" />
                    ) : (
                        <Button
                            className="rounded-full h-24 w-24 p-0 cursor-pointer border border-2 hover:bg-gray-400"
                            variant="outline"
                        >
                            {icon}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function DashboardCards() {
    return (
        <div className="space-y-6">
            <h2 className="text-muted-foreground text-xl">Rubriques principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DashboardCard
                    title="Accéder à mes vinyles"
                    description="Consultez, filtrez et gérez votre collection de disque"
                    imageSrc="../android-chrome-192x192.png"
                    route="/vinyles"
                />
                <DashboardCard
                    title="Ajouter un disque"
                    description="Accédez au formulaire pour ajouter un disque à la base de données"
                    icon={<Plus />}
                    route="/create"
                />
                <DashboardCard
                    title="Mes autres frais"
                    description="Accédez à vos frais annexes pour les consulter ou en ajouter"
                    icon={<ReceiptEuro />}
                    route="/other-expenses"
                />
                <DashboardCard
                    title="Contact"
                    description="Accédez au formulaire pour contacter l'équipe de développement"
                    icon={<Contact />}
                    route="/contact"
                />
            </div>
        </div>
    )
}
