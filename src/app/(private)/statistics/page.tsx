import GlobalStatisticsChart from "@/components/global-statistics-chart"
import FilteredStatsChart from "@/components/filtered-statistics-chart";
import BackButton from "@/components/back-button";

export default function StatisticsPage() {
    return (
        <div className="space-y-6 p-6">
            <BackButton/>
            <h1 className="text-3xl font-bold">Statistiques</h1>
            <GlobalStatisticsChart/>
            <FilteredStatsChart/>
        </div>
    )
}
