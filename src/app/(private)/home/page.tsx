"use client"

import DashboardStat from "@/components/dashboard-stat";
import {Separator} from "@/components/ui";
import DashboardCards from "@/components/dashboard-cards";

export default function DashboardPage() {


    return (
        <div className="space-y-6 pt-4">
            <div>
                <h1 className="text-3xl sm:text-5xl font-bold">Tableau de bord</h1>
            </div>
            <Separator/>
            <DashboardStat />
            <Separator/>
            <DashboardCards />
        </div>
    )
}