"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { toast } from "sonner";

type Props = {
    id: number;
    field: string;
    initialValue: string | null;
    onVinyleUpdated: (updated: Record<string, any>) => void;
};

const EditableDateCell: React.FC<Props> = ({
                                               id,
                                               field,
                                               initialValue,
                                               onVinyleUpdated,
                                           }) => {
    const [value, setValue] = useState<Date | undefined>(
        initialValue ? new Date(initialValue) : undefined
    );
    const [tempValue, setTempValue] = useState<Date | undefined>(value);
    const prevValue = useRef<string | null>(initialValue);

    const updateIfChanged = async (date: Date | undefined) => {
        const newFormatted = date ? format(date, "yyyy-MM-dd") : null;

        if (newFormatted !== prevValue.current) {
            const payload: Record<string, any> = { [field]: newFormatted };

            if (field === "sellingDate") {
                try {
                    const { data: currentVinyle } = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`,
                        { withCredentials: true }
                    );

                    const currentStatus = currentVinyle.sellingStatus;

                    if (newFormatted) {
                        if (currentStatus !== "réceptionné") {
                            payload.sellingStatus = "vendu";
                        }
                    } else {
                        payload.sellingStatus = "en vente";
                    }
                } catch (err) {
                    toast.error("Erreur lors de la vérification du statut.");
                    console.error("Erreur fetch status actuel :", err);
                    return;
                }
            }

            axios
                .patch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`, payload, {
                    withCredentials: true,
                })
                .then((res) => {
                    toast.success("Modification enregistrée !");
                    const updatedValue = res.data[field] ?? null;
                    prevValue.current = updatedValue;
                    setValue(updatedValue ? new Date(updatedValue) : undefined);

                    const updated: Record<string, any> = { [field]: updatedValue };

                    if (field === "sellingDate") {
                        updated.sellingStatus = res.data.sellingStatus ?? payload.sellingStatus;
                    }

                    onVinyleUpdated?.(updated);
                })
                .catch((err) => {
                    toast.error("Erreur lors de la mise à jour.");
                    console.error("Erreur lors de la mise à jour de la date :", err);
                });
        }
    };


    return (
        <div className="w-full">
            <DateTimePicker
                granularity="day"
                locale={fr}
                displayFormat={{ hour24: "PPP" }}
                value={tempValue}
                onChange={(date) => setTempValue(date || undefined)}
                placeholder="Choisir une date"
                className="cursor-pointer"
                onPopoverClose={() => updateIfChanged(tempValue)}
            />
        </div>
    );
};

export default EditableDateCell;
