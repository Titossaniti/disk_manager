"use client";

import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import clsx from "clsx";

type Props = {
    initialValue: string;
    field: string;
    id: number;
    onVinyleUpdated?: (updated: any) => void;
};

export default function EditableInputCell({ initialValue, field, id, onVinyleUpdated }: Props) {
    const [value, setValue] = useState(initialValue || "");
    const [originalValue, setOriginalValue] = useState(initialValue || "");
    const [highlighted, setHighlighted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleBlur = async () => {
        if (value === originalValue) return;

        try {
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                { [field]: value },
                { withCredentials: true }
            );
            toast.success("Modification enregistrée !");
            setOriginalValue(value);
            setHighlighted(true);
            setTimeout(() => setHighlighted(false), 1500);
            onVinyleUpdated?.(res.data);
        } catch {
            toast.error("Erreur lors de la mise à jour");
            setValue(originalValue);
        }
    };

    return (
        <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className={clsx("h-8 text-sm px-2 transition-colors duration-500", highlighted && "bg-green-100")}
        />
    );
}
