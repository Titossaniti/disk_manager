"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Input,
    Button,
    Label,
    Textarea,
    Card,
    CardContent,
    Skeleton,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui";
import { Spinner } from "@/components/ui/spinner";

const requiredFields = ["artist", "title", "support", "countryYear", "buyPlace", "netBuyPrice", "buyDate", "sellingStatus"];

export default function AddVinylePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const firstInvalidField = useRef<HTMLInputElement | null>(null);

    const { data: filtersInit, isLoading: isLoadingFilters } = useQuery({
        queryKey: ["vinyles", "filters", "initialization"],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/filters/initialization`, { withCredentials: true });
            return data;
        },
    });

    const initialForm = {
        artist: "",
        title: "",
        support: "",
        countryYear: "",
        label: "",
        genre: "",
        diskCondition: "",
        notes: "",
        sellingStatus: "",
        buyPlace: "",
        buyDate: "",
        netBuyPrice: "",
        buyDeliveryFees: "",
        sellingPlace: "",
        sellingDate: "",
        netSellingPrice: "",
        sellingDeliveryFees: "",
        sellingCommission: "",
        paypalFees: "",
        iebayFees: "",
        paymentStatus: "",
        deliveryStatus: "",
        isReceived: "",
        scanStatus: "",
        ref: "",
        cdlpListingPrice: "",
        cdlpListingStatus: "",
        discogsSellingPrice: "",
        discogsSellingStatus: "",
        listingIssues: "",
        ebayListingStatus: "",
    };

    const [formData, setFormData] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createVinyle = useMutation({
        mutationFn: async (newDisk: any) => {
            setIsSubmitting(true);
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vinyles`, newDisk, { withCredentials: true });
            return data;
        },
        onSuccess: (createdDisk) => {
            queryClient.invalidateQueries({ queryKey: ["vinyles"] });
            toast.success("Disque ajouté avec succès !");
            setFormData(initialForm);
            const formattedArtist = createdDisk.artist.replaceAll(" ", "-").replaceAll("/", "-").replaceAll("\\", "-");
            const formattedTitle = createdDisk.title.replaceAll(" ", "-").replaceAll("/", "-").replaceAll("\\", "-");
            router.push(`/detail/${createdDisk.id}-${formattedArtist}-${formattedTitle}`);
        },
        onError: (error: any) => {
            if (error.response?.data?.message) {
                toast.error(`Erreur lors de la création : ${error.response.data.message}`);
            } else {
                toast.error("Erreur inconnue lors de la création du disque.");
            }
        },
        onSettled: () => {
            setIsSubmitting(false);
        }
    });

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isFormValid = requiredFields.every((field) => formData[field]) &&
        Number(formData.netBuyPrice) >= 0 &&
        formData.buyDate && new Date(formData.buyDate) <= new Date();

    const handleCreate = () => {
        if (!isFormValid) {
            if (firstInvalidField.current) firstInvalidField.current.focus();
            // if (firstInvalidField.current) if ("focus" in firstInvalidField.current) {
            //     firstInvalidField.current.focus();
            // }
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
            return;
        }

        const finalForm = { ...formData };
        Object.keys(finalForm).forEach(key => {
            if (key.includes("Price") || key.includes("Fees") || key.includes("Commission")) {
                if (finalForm[key] === "") {
                    finalForm[key] = 0;
                }
            }
        });

        createVinyle.mutate(finalForm);
    };

    if (isLoadingFilters || !filtersInit) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Ajouter un nouveau disque</h1>
                <p className="text-muted-foreground">Complétez les champs du formulaire et validez pour ajouter votre disque à la base de données !</p>
            </div>
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(initialForm).map(([key, _]) => (
                        <div key={key} className="flex flex-col gap-1">
                            <Label className="flex items-center gap-1">
                                {requiredFields.includes(key) && <span className="text-red-500">*</span>}
                                {key === "artist" ? "Artiste" :
                                    key === "title" ? "Titre" :
                                        key === "support" ? "Support" :
                                            key === "countryYear" ? "Pressage" :
                                                key === "buyPlace" ? "Lieu d'achat" :
                                                    key === "netBuyPrice" ? "Prix d'achat (€)" :
                                                        key === "buyDate" ? "Date d'achat" :
                                                            key === "sellingStatus" ? "Statut de vente" :
                                                                key.charAt(0).toUpperCase() + key.slice(1)}
                            </Label>
                            {key === "support" ? (
                                <Select value={formData.support} onValueChange={(v) => handleChange("support", v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filtersInit.supports.map((s: string) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : key === "sellingStatus" ? (
                                <Select value={formData.sellingStatus} onValueChange={(v) => handleChange("sellingStatus", v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filtersInit["sellingStatuses"].map((s: string) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : key.includes("notes") || key.includes("issues") ? (
                                <Textarea
                                    value={formData[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                />
                            ) : (
                                <Input
                                    type={key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? "number" : key.includes("Date") ? "date" : "text"}
                                    value={formData[key] ?? ""}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    min={key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? 0 : undefined}
                                />
                            )}
                        </div>
                    ))}
                </CardContent>
                <div className="flex justify-end p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isFormValid ? 1 : 0.5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button onClick={handleCreate} disabled={!isFormValid || isSubmitting}>
                            {isSubmitting ? <Spinner /> : "Créer le disque"}
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </div>
    );
}
