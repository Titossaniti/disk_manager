import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Détail du disque",
    description: "Consulter et modifier un disque",
};

export default function VinylesPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Modifier un disque</h1>
                <p className="text-muted-foreground">Consultez les informations d'un disque et modifiez ses informations.</p>
                <p>FORMULAIRE</p>
            </div>
        </div>
    );
}