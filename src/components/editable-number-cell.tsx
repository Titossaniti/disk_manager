import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import clsx from "clsx";

type Props = {
    initialValue: number;
    field: string;
    id: number;
    onVinyleUpdated?: (updated: any) => void;
};

export default function EditableNumberCell({ initialValue, field, id, onVinyleUpdated }: Props) {
    const [value, setValue] = useState<number | string>(initialValue ?? 0);
    const [originalValue, setOriginalValue] = useState(initialValue ?? 0);
    const [highlighted, setHighlighted] = useState(false);

    const handleBlur = async () => {
        const numericValue = value === "" ? 0 : Number(value);
        if (numericValue === originalValue) return;

        try {
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                { [field]: numericValue },
                { withCredentials: true }
            );
            toast.success("Modification enregistrée !");
            setValue(numericValue);
            setOriginalValue(numericValue);
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
            type="number"
            step="0.01"
            value={value === "" ? "" : Number(value)}
            onChange={(e) => {
                const inputValue = e.target.value;
                setValue(inputValue === "" ? "" : Number(inputValue));
            }}
            onBlur={handleBlur}
            className={clsx("h-8 text-sm px-2 transition-colors duration-500", highlighted && "bg-green-100")}
        />
    );
}
