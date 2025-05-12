"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [open, setOpen] = useState(false);
    const prevValue = useRef<string | null>(initialValue);

    const handleDateChange = (date: Date | undefined) => {
        const newFormatted = date ? format(date, "yyyy-MM-dd") : null;

        if (newFormatted !== prevValue.current) {
            const payload = { [field]: newFormatted };

            axios
                .patch(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${id}`, payload, {
                    withCredentials: true,
                })
                .then((res) => {
                    const updatedValue = res.data[field] ?? null;
                    prevValue.current = updatedValue;
                    setValue(updatedValue ? new Date(updatedValue) : undefined);
                    onVinyleUpdated?.({ [field]: updatedValue });
                })
                .catch((err) => {
                    console.error("Erreur lors de la mise à jour de la date :", err);
                });
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "dd/MM/yyyy") : <span>Choisir une date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            handleDateChange(date || undefined);
                            setOpen(false);
                        }}
                        initialFocus
                    />
                    <Button
                        variant="ghost"
                        className="mb-1 text-destructive cursor-pointer"
                        onClick={() => {
                            handleDateChange(undefined);
                            setOpen(false);
                        }}
                    >
                        <X className="w-4 h-4 mr-1" />
                        Effacer la date
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default EditableDateCell;
