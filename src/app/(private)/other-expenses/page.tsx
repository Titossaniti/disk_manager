import {OtherExpensesForm} from "@/components/other-expenses-form";
import {OtherExpensesTable} from "@/components/other-expenses-table";
import React from "react";


export default function OtherExpensesPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Autres dépenses</h1>
                <p className="text-muted-foreground">Consultez et ajoutez vos frais autre que les disques.</p>
            </div>
            <OtherExpensesForm/>
            <OtherExpensesTable/>
        </div>
    )
}
