import { Metadata } from "next";
import LiteVinylesTable from "@/components/lite-vinyle-table";

export const metadata: Metadata = {
    title: "Mes disques",
    description: "Liste complète et filtrable de vos vinyles",
};

export default function VinylesPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Mes disques</h1>
                <p className="text-muted-foreground">Filtrez, triez et explorez votre collection de vinyles.</p>
            </div>
            <LiteVinylesTable />
        </div>
    );
}