import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardStat from "@/components/dashboard-stat";

export default function DashboardPage() {
    return (
        <div className="space-y-6 pt-5">
            <div>
                <h1 className="text-3xl font-bold">Tableau de bord</h1>
            </div>
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
        </div>
    )
}
