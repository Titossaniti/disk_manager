"use client";

import React, {useRef} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Button,
    Card,
    CardContent, CardDescription, CardTitle,
    Skeleton,
} from "@/components/ui";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {VinyleFormFields} from "@/components/vinyle-form-fields";
import { vinyleSchema, type VinyleFormData } from "@/schema/vinyleSchema"
import {DiscogsSearch} from "@/components/discogs-search";
import {Loader2} from "lucide-react";
import BackButton from "@/components/back-button";

const defaultValues: VinyleFormData = {
    artist: "",
    title: "",
    support: "",
    genre: "",
    label: "",
    countryYear: "",
    ref: "",
    diskCondition: "",
    scanStatus: "",
    notes: "",
    buyDate: "",
    buyPlace: "",
    netBuyPrice: 0,
    buyDeliveryFees: 0,
    sellingStatusId: 2,
    sellingPlace: "",
    sellingDate: "",
    netSellingPrice: 0,
    sellingDeliveryFees: 0,
    sellingCommission: 0,
    paypalFees: 0,
    iebayFees: 0,
    paymentStatus: "",
    deliveryStatus: "",
    isReceived: "",
    cdlpListingPrice: 0,
    cdlpListingStatus: "",
    discogsSellingPrice: 0,
    discogsSellingStatus: "",
    ebayListingStatus: "",
    listingIssues: "",
};

export default function AddVinyleForm() {

    const discogsRef = useRef<{ resetSearch: () => void }>(null);
    const queryClient = useQueryClient();

    const form = useForm<VinyleFormData>({
        resolver: zodResolver(vinyleSchema) as Resolver<VinyleFormData>,
        defaultValues,
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = form;

    const { data: filtersInit, isLoading: isLoadingFilters } = useQuery({
        queryKey: ["vinyles", "filters", "initialization"],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/filters/initialization`, { withCredentials: true });
            return data;
        },
    });

    const handleDiscogsSelect = async (releaseId: number) => {
        try {
            const res = await axios.get(`https://api.discogs.com/releases/${releaseId}`, {
                headers: { Authorization: `Discogs token=${process.env.NEXT_PUBLIC_DISCOGS_TOKEN}` }
            });
            const d = res.data;

            // Préremplissage des champs avec setValue()
            setValue("artist", d.artists?.[0]?.name || "");
            setValue("title", d.title || "");
            setValue("label", d.labels?.[0]?.name || "");
            setValue("countryYear", `${d.country || ""} / ${d.year || ""}`);
            setValue("ref", d.labels?.[0]?.catno || "");
            setValue("genre", d.genres?.[0] || "");
            setValue("support", d.formats?.[0]?.name || "");
        } catch (err) {
            console.error("Erreur Discogs:", err);
            toast.error("Erreur lors du chargement des données depuis Discogs.");
        }
    };


    const createVinyle = useMutation({
        mutationFn: async (newDisk: VinyleFormData) => {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vinyles`, newDisk, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vinyles"] });
            reset();
            discogsRef.current?.resetSearch();
            toast.success("Disque ajouté avec succès !");
            setValue("artist", "");
            window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div>

            <form onSubmit={handleSubmit(onSubmit, () => {
                toast.error("Veuillez corriger les erreurs dans le formulaire.");
            })} className="p-6 space-y-6">
                <div className="space-y-2">
                    <BackButton fallbackHref="/home"/>
                    <h1 className="text-2xl font-bold tracking-tight">Ajouter un nouveau disque</h1>
                    <p className="text-muted-foreground">Complétez les champs du formulaire et validez pour ajouter
                        votre disque à la base de données !</p>
                </div>
                <Card className="">
                    <CardContent className="space-y-2">
                        <CardTitle className="text-sm font-medium">Préremplir le formulaire</CardTitle>
                        <CardDescription>Recherchez et sélectionnez un vinyle sur Discogs pour préremplir les
                            champs du formulaire.
                        </CardDescription>
                        <DiscogsSearch
                            ref={discogsRef}
                            onSelect={handleDiscogsSelect}
                            onReset={() => {
                                setValue("artist", "");
                                setValue("title", "");
                                setValue("label", "");
                                setValue("countryYear", "");
                                setValue("ref", "");
                                setValue("genre", "");
                                setValue("support", "");
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <VinyleFormFields
                            register={register}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            filtersInit={filtersInit}
                        />
                    </CardContent>
                    <div className="flex justify-end p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.3}}
                        >
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2/> : "Créer le disque"}
                            </Button>
                        </motion.div>
                    </div>
                </Card>
            </form>
        </div>
    );
}