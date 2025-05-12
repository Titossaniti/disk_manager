"use client";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type Props = {
    initialValue: string;
    field: string;
    id: number;
    options: string[];
};

export default function EditableSelectCell({ initialValue, field, id, options }: Props) {
    const [value, setValue] = useState(initialValue || "");

    const handleChange = async (newValue: string) => {
        if (newValue === value) return;
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                { [field]: newValue },
                { withCredentials: true }
            );
            toast.success("Modifié !");
            setValue(newValue);
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
                {options.map((o) => (
                    <SelectItem key={o} value={o}>
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
