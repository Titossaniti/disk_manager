"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type Props = {
    initialValue: number | null;
    field: string;
    id: number;
};

export default function EditableNumberCell({ initialValue, field, id }: Props) {
    const [value, setValue] = useState(initialValue?.toString() || "");
    const [originalValue, setOriginalValue] = useState(initialValue?.toString() || "");

    const handleBlur = async () => {
        if (value === originalValue) return;

        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) {
            setValue(originalValue);
            return;
        }

        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                { [field]: numberValue },
                { withCredentials: true }
            );
            toast.success("Modifié !");
            setOriginalValue(value);
        } catch {
            toast.error("Erreur de mise à jour");
            setValue(originalValue);
        }
    };

    return (
        <Input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className="h-8 text-sm px-2"
        />
    );
}
