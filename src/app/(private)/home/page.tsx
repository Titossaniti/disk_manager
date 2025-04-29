"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardStat from "@/components/dashboard-stat";
import { Separator } from "@/components/ui/separator"
import LiteVinyleTable from "@/components/lite-vinyle-table";
import {Button} from "@/components/ui";
import {Plus} from "lucide-react";
import {redirect} from "next/navigation";

export default function DashboardPage() {


    return (
        <div className="space-y-6 pt-4">
            <div>
                <h1 className="text-3xl font-bold">Tableau de bord</h1>
            </div>
            <Button
                onClick={() => {
                    redirect("/create");
                }}
                className="rounded-full h-12 w-12 p-0 cursor-pointer border border-2 hover:bg-gray-400"
                variant="icon"
            >
                <Plus className="h-6 w-6" />
            </Button>
            {/*<Card >*/}
            {/*    <CardHeader className="">*/}
            {/*        <CardTitle>Statistiques</CardTitle>*/}
            {/*        <CardDescription>Stats globales</CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*        <div className="">*/}
            {/*            HELLO*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}

            <DashboardStat />
            {/*<Separator />*/}
        </div>
    )
}