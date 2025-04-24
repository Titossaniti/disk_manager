import GlobalStatisticsChart from "@/components/global-statistics-chart"
import {Separator} from "@radix-ui/react-select";

export default function StatisticsPage() {
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Statistiques</h1>
            <GlobalStatisticsChart/>
        </div>
    )
}
