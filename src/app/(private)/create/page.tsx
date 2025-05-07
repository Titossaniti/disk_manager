"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Button,
    Card,
    CardContent, CardDescription, CardTitle,
    Label,
    Skeleton,
} from "@/components/ui";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {VinyleFormFields} from "@/components/vinyle-form-fields";
import {orderedFields, vinyleSchema} from "@/schema/vinyleSchema";
import {DiscogsSearch} from "@/components/discogs-search";

type VinyleFormData = z.infer<typeof vinyleSchema>;


export default function AddVinyleForm() {
    const router = useRouter();
    const queryClient = useQueryClient();

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
            setValue("notes", d.notes || "");
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
        <div>
            <form onSubmit={handleSubmit(onSubmit, () => {
                toast.error("Veuillez corriger les erreurs dans le formulaire.");
            })} className="p-6 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Ajouter un nouveau disque</h1>
                    <p className="text-muted-foreground">Complétez les champs du formulaire et validez pour ajouter
                        votre disque à la base de données !</p>
                </div>
                <Card className="">
                    <CardContent className="space-y-2">
                        <CardTitle className="text-sm font-medium">Préremplir le formulaire</CardTitle>
                        <CardDescription>Recherchez et selectionnez un vinyle sur Discogs pour préremplir les
                            champs du formulaire.
                        </CardDescription>
                        <DiscogsSearch
                            onSelect={handleDiscogsSelect}
                            onReset={() => {
                                setValue("artist", "");
                                setValue("title", "");
                                setValue("label", "");
                                setValue("countryYear", "");
                                setValue("ref", "");
                                setValue("genre", "");
                                setValue("support", "");
                                setValue("notes", "");
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
                                {isSubmitting ? <Spinner/> : "Créer le disque"}
                            </Button>
                        </motion.div>
                    </div>
                </Card>
            </form>
        </div>
    );
}