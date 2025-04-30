"use client"

import DashboardStat from "@/components/dashboard-stat";
import {Button, Separator} from "@/components/ui";
import {Plus} from "lucide-react";
import {redirect} from "next/navigation";

export default function DashboardPage() {


    return (
        <div className="space-y-6 pt-4">
            <div>
                <h1 className="text-5xl font-bold">Tableau de bord</h1>
            </div>
            <Separator/>
            <DashboardStat />
            <Separator/>
            <p>2 CARDS - SEE VINYLES & ADD NEW</p>
            <Button
                onClick={() => {
                    redirect("/create");
                }}
                className="rounded-full h-12 w-12 p-0 cursor-pointer border border-2 hover:bg-gray-400"
                variant="icon"
            >
                <Plus className="h-6 w-6" />
            </Button>
        </div>
    )
}