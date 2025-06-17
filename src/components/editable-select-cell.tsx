"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type SellingStatusOption = {
    id: number;
    name: string;
};

type Props = {
    initialValue: string;
    field: string;
    id: number;
    options: string[];
    onVinyleUpdated?: (updated: any) => void;
    sellingStatusOptions?: SellingStatusOption[];
};

export default function EditableSelectCell({ initialValue, field, id, options, onVinyleUpdated }: Props) {
    const [value, setValue] = useState(initialValue || "");

    // const handleChange = async (newValue: string) => {
    //     if (newValue === value) return;
    //
    //     try {
    //         const res = await axios.patch(
    //             `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
    //             { [field]: newValue },
    //             { withCredentials: true }
    //         );
    //         toast.success("Modification enregistrée !");
    //         setValue(newValue);
    //         onVinyleUpdated?.(res.data);
    //     } catch {
    //         toast.error("Erreur lors de la mise à jour");
    //     }
    // };

    const handleChange = async (newValue: string) => {
        if (newValue === value) return;

        try {
            let payload: any;

            if (field === "sellingStatus" && sellingStatusOptions) {
                const selected = sellingStatusOptions.find((s) => s.name === newValue);
                if (!selected) {
                    toast.error("Statut de vente invalide");
                    return;
                }
                payload = { sellingStatusId: selected.id };
            } else {
                payload = { [field]: newValue };
            }

            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                payload,
                { withCredentials: true }
            );

            toast.success("Modification enregistrée !");
            setValue(newValue);
            onVinyleUpdated?.(res.data);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };


    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                        {opt}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
