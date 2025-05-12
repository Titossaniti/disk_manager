"use client";

import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

type Props = {
    initialValue: string;
    field: string;
    id: number;
};

export default function EditableInputCell({ initialValue, field, id }: Props) {
    const [value, setValue] = useState(initialValue || "");
    const [originalValue, setOriginalValue] = useState(initialValue || "");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleBlur = async () => {
        if (value === originalValue) return;

        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                { [field]: value },
                { withCredentials: true }
            );
            toast.success("Modifié avec succès !");
            setOriginalValue(value);
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
            className="h-8 text-sm px-2"
        />
    );
}
