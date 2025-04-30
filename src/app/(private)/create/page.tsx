"use client";

import React, { useRef } from "react";
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
import { Euro } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const vinyleSchema = z.object({
    artist: z.string().min(1, "Champ requis"),
    title: z.string().min(1, "Champ requis"),
    support: z.string().min(1, "Champ requis"),
    countryYear: z.string().min(1, "Champ requis"),
    buyPlace: z.string().min(1, "Champ requis"),
    netBuyPrice: z.coerce.number().nonnegative("Doit être positif"),
    buyDate: z.string().min(1, "Champ requis"),
    sellingStatus: z.string().min(1, "Champ requis"),
    diskCondition: z.string().min(1, "Champ requis"),
    label: z.string().optional(),
    genre: z.string().optional(),
    notes: z.string().optional(),
    sellingPlace: z.string().optional(),
    sellingDate: z.string().optional(),
    netSellingPrice: z.coerce.number().optional(),
    buyDeliveryFees: z.coerce.number().optional(),
    sellingDeliveryFees: z.coerce.number().optional(),
    sellingCommission: z.coerce.number().optional(),
    paypalFees: z.coerce.number().optional(),
    iebayFees: z.coerce.number().optional(),
    paymentStatus: z.string().optional(),
    deliveryStatus: z.string().optional(),
    isReceived: z.string().optional(),
    scanStatus: z.string().optional(),
    ref: z.string().optional(),
    cdlpListingPrice: z.coerce.number().optional(),
    cdlpListingStatus: z.string().optional(),
    discogsSellingPrice: z.coerce.number().optional(),
    discogsSellingStatus: z.string().optional(),
    listingIssues: z.string().optional(),
    ebayListingStatus: z.string().optional(),
});

type VinyleFormData = z.infer<typeof vinyleSchema>;

const requiredFields: (keyof VinyleFormData)[] = [
    "artist",
    "title",
    "support",
    "countryYear",
    "buyPlace",
    "netBuyPrice",
    "buyDate",
    "sellingStatus",
    "diskCondition",
];

const orderedFields: (keyof VinyleFormData)[] = [
    "artist",
    "title",
    "support",
    "genre",
    "label",
    "countryYear",
    "ref",
    "diskCondition",
    "scanStatus",
    "notes",
    "buyDate",
    "buyPlace",
    "netBuyPrice",
    "buyDeliveryFees",
    "sellingStatus",
    "sellingPlace",
    "sellingDate",
    "netSellingPrice",
    "sellingDeliveryFees",
    "sellingCommission",
    "paypalFees",
    "iebayFees",
    "paymentStatus",
    "deliveryStatus",
    "isReceived",
    "cdlpListingPrice",
    "cdlpListingStatus",
    "discogsSellingPrice",
    "discogsSellingStatus",
    "ebayListingStatus",
    "listingIssues",
];

export default function AddVinyleForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const firstInvalidField = useRef<HTMLInputElement | null>(null);

    const form = useForm<VinyleFormData>({
        resolver: zodResolver(vinyleSchema),
        defaultValues: Object.fromEntries(
            orderedFields.map((field) => [field, ""])
        ) as any,
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const { data: filtersInit, isLoading: isLoadingFilters } = useQuery({
        queryKey: ["vinyles", "filters", "initialization"],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/filters/initialization`, { withCredentials: true });
            return data;
        },
    });

    const createVinyle = useMutation({
        mutationFn: async (newDisk: VinyleFormData) => {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vinyles`, newDisk, { withCredentials: true });
            return data;
        },
        onSuccess: (createdDisk) => {
            queryClient.invalidateQueries({ queryKey: ["vinyles"] });
            toast.success("Disque ajouté avec succès !");
            const formattedArtist = createdDisk.artist.replaceAll(" ", "-").replaceAll("/", "-").replaceAll("\\", "-");
            const formattedTitle = createdDisk.title.replaceAll(" ", "-").replaceAll("/", "-").replaceAll("\\", "-");
            router.push(`/detail/${createdDisk.id}-${formattedArtist}-${formattedTitle}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Erreur inconnue lors de la création du disque.");
        },
    });

    const onSubmit = (values: VinyleFormData) => {
        createVinyle.mutate(values);
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
        <form onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
        })} className="p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Ajouter un nouveau disque</h1>
                <p className="text-muted-foreground">Complétez les champs du formulaire et validez pour ajouter votre disque à la base de données !</p>
            </div>
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orderedFields.map((key) => (
                        <div key={key} className="flex flex-col gap-1">
                            <Label className="flex items-center gap-1">
                                {requiredFields.includes(key) && <span className="text-red-500">*</span>}
                                {key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? (
                                    <>
                                        {key === "netBuyPrice" && "Prix d'achat"}
                                        {key === "buyDeliveryFees" && "Frais de livraison d'achat"}
                                        {key === "netSellingPrice" && "Prix de vente"}
                                        {key === "sellingCommission" && "Commission du site de vente"}
                                        {key === "paypalFees" && "Frais Paypal"}
                                        {key === "iebayFees" && "Frais ieBay"}
                                        {key === "sellingDeliveryFees" && "Frais de livraison de vente"}
                                        {key === "cdlpListingPrice" && "Prix CD&LP"}
                                        {key === "discogsSellingPrice" && "Prix Discogs"} <Euro className="w-4 h-4 text-muted-foreground" />
                                    </>
                                ) : (
                                    {
                                        artist: "Artiste",
                                        title: "Titre",
                                        support: "Support",
                                        genre: "Genre",
                                        label: "Label",
                                        countryYear: "Pressage",
                                        ref: "Référence du disque",
                                        diskCondition: "État du disque",
                                        scanStatus: "État du scan",
                                        notes: "Notes",
                                        buyDate: "Date d'achat",
                                        buyPlace: "Lieu d'achat",
                                        sellingStatus: "Statut de vente",
                                        sellingPlace: "Lieu de vente",
                                        sellingDate: "Date de vente",
                                        paymentStatus: "Statut du paiement",
                                        deliveryStatus: "État de la livraison",
                                        isReceived: "État de la réception",
                                        cdlpListingStatus: "Statut de l'annonce CD&LP",
                                        discogsSellingStatus: "Statut de l'annonce Discogs",
                                        ebayListingStatus: "Statut de l'annonce eBay",
                                        listingIssues: "Problèmes rencontrés",
                                    }[key] || key
                                )}
                            </Label>
                            {key === "support" ? (
                                <Select value={watch("support")} onValueChange={(v) => setValue("support", v)}>
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
                                <Select value={watch("sellingStatus")} onValueChange={(v) => setValue("sellingStatus", v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filtersInit.sellingStatuses.map((s: string) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : key === "notes" || key === "listingIssues" ? (
                                <Textarea {...register(key)} />
                            ) : (
                                <Input
                                    type={key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? "number" : key.includes("Date") ? "date" : "text"}
                                    min={key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? 0 : undefined}
                                    {...register(key)}
                                />
                            )}
                            {errors[key] && <p className="text-sm text-red-500">{errors[key]?.message as string}</p>}
                        </div>
                    ))}
                </CardContent>
                <div className="flex justify-end p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : "Créer le disque"}
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </form>
    );
}