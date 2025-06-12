"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { CircleCheckBig, CircleSlash, Loader2 } from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/utils";

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    Separator,
    Skeleton,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";

import { vinyleSchema, VinyleFormData } from "@/schema/vinyleSchema";
import { VinyleFormFields } from "@/components/vinyle-form-fields";
import { useDiscogsData } from "@/hooks/use-discogs-data";
import BackButton from "@/components/back-button";

const sellingStatusBadgeColor = (status: string) => {
    switch (status) {
        case "réceptionné": return "bg-green-700 dark:text-zinc-100";
        case "vendu": return "bg-emerald-900 dark:text-zinc-100";
        case "en vente": return "bg-blue-800 dark:text-zinc-100";
        case "pas encore en vente": return "bg-orange-400 dark:text-zinc-100";
        case "à mettre en vente": return "bg-red-800 dark:text-zinc-100";
        default: return "bg-muted dark:text-zinc-100";
    }
};

const renderScanStatus = (status: string | null | undefined) => {
    if (!status || status.trim() === "") return <CircleSlash size={16} className="text-destructive" />;
    if (status.toLowerCase() === "ok") return <CircleCheckBig className="text-green-700" size={16} />;
    return <Badge className="bg-yellow-500 text-black">{status}</Badge>;
};

export default function DetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const diskId = params.diskId?.toString().split("-")[0];

    const [isEditing, setIsEditing] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("achat");

    const form = useForm<VinyleFormData>({
        resolver: zodResolver(vinyleSchema),
    });
    const { handleSubmit, setValue, watch, formState: { isSubmitting, dirtyFields }, reset } = form;

    const { data: filtersInit, isLoading: isLoadingFilters } = useQuery({
        queryKey: ["vinyles", "filters", "initialization"],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/filters/initialization`, { withCredentials: true });
            return data;
        },
    });

    const { data, isLoading, isError } = useQuery<VinyleFormData>({
        queryKey: ["vinyle", diskId],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, { withCredentials: true });
            Object.entries(data).forEach(([key, value]) => {
                setValue(key as keyof VinyleFormData, value);
            });
            return data;
        },
    });

    const { data: discogsData, isLoading: loadingDiscogs } = useDiscogsData({
        artist: watch("artist"),
        title: watch("title"),
        countryYear: watch("countryYear"),
    });

    const updateVinyle = useMutation({
        mutationFn: async (updatedData: VinyleFormData) => {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, updatedData, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vinyle", diskId] });
            toast.success("Disque modifié avec succès !");
            setIsEditing(false);
        },
        onError: () => {
            toast.error("Erreur lors de la modification du disque");
        },
    });

    const deleteVinyle = useMutation({
        mutationFn: async () => {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, { withCredentials: true });
        },
        onSuccess: () => {
            router.push("/vinyles?deleted=true");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression du disque");
        },
    });

    useEffect(() => {
        if (searchParams.get("deleted")) {
            toast.success("Le disque a été supprimé !");
            router.replace("/vinyles");
        }
    }, [searchParams, router]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (data) {
            reset(data);
        }
        setIsEditing(false);
    };

    const onSubmit = (data: VinyleFormData) => {
        updateVinyle.mutate(data);
    };

    if (isLoading || isLoadingFilters || !filtersInit) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (isError || !data) return <div className="p-4 text-red-600">Erreur de chargement. Il se peut que le disque recherché n'existe pas.</div>;

    const contentGridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6";

    function Field({ label, value }: { label: string; value?: string | number }) {
        return (
            <div className="flex flex-col border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <span className="mt-1 whitespace-pre-line">{value || "—"}</span>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* Retour en haut sur mobile */}
                <div className="self-start">
                    <BackButton />
                </div>

                {/* Modifier + Supprimer côte à côte */}
                {!isEditing ? (
                    <div className="flex gap-2 self-start sm:self-auto">
                        <Button onClick={handleEdit} variant="outline">
                            Modifier
                        </Button>
                        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    Supprimer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmer la suppression</DialogTitle>
                                </DialogHeader>
                                <p>Êtes-vous sûr de vouloir supprimer ce disque ? Cette action est irréversible.</p>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        onClick={() => deleteVinyle.mutate()}
                                        disabled={deleteVinyle.isPending}
                                    >
                                        {deleteVinyle.isPending ? <Loader2 className="animate-spin" /> : "Confirmer"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="flex gap-2 self-start sm:self-auto">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting || !Object.keys(dirtyFields).length}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Enregistrer"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {discogsData?.cover_image && (
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <img
                            src={discogsData.cover_image}
                            alt="cover"
                            className="shadow-md w-full max-w-[150px] md:max-w-[200px]"
                        />
                    </div>
                )}

                <div className="flex-1 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">
                        {data.artist}
                    </h1>
                    <h2 className="text-xl md:text-2xl font-semibold capitalize">
                        {data.title}
                    </h2>
                </div>
            </div>

            <Separator/>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Résumé</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {isEditing ? (
                            <VinyleFormFields
                                form={form}
                                filtersInit={filtersInit}
                                isEditing={isEditing}
                                register={form.register}
                                errors={form.formState.errors}
                                watch={form.watch}
                                setValue={form.setValue}
                            />
                        ) : (
                            <>
                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Support</span>
                                    <span className="mt-1">{data.support}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Pressage</span>
                                    <span className="mt-1">{data.countryYear}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Label</span>
                                    <span className="mt-1">{data.label}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Genre</span>
                                    <span className="mt-1">{data.genre}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">État</span>
                                    <span className="mt-1">{data.diskCondition}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Statut</span>
                                    <span className="mt-1">
                                    <Badge className={sellingStatusBadgeColor(data.sellingStatus)}>
                                        {data.sellingStatus || "?"}
                                    </Badge>
                                </span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Marge</span>
                                    <span className="mt-1">{data.margin} €</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Référence</span>
                                    <span className="mt-1">{data.ref}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Scan</span>
                                    <span className="mt-1">{renderScanStatus(data.scanStatus)}</span>
                                </div>

                                <div className="flex flex-col border-b pb-2 sm:col-span-2 lg:col-span-3">
                                    <span className="text-sm font-medium text-muted-foreground">Notes</span>
                                    <span className="mt-1 whitespace-pre-line">{data.notes || 'Aucune note'}</span>
                                </div>

                                {discogsData?.id && discogsData?.type && (
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <Button
                                            className="mt-2 w-fit"
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() =>
                                                window.open(`https://www.discogs.com/${discogsData.type}/${discogsData.id}`, "_blank")
                                            }
                                            rel="noopener noreferrer"
                                        >
                                            🌐 Voir sur Discogs
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {isEditing && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !Object.keys(dirtyFields).length}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Enregistrer"}
                        </Button>
                    </div>
                )}
            </form>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start gap-2">
                    <TabsTrigger value="achat" className="cursor-pointer">Achat</TabsTrigger>
                    <TabsTrigger value="vente" className="cursor-pointer">Vente</TabsTrigger>
                    <TabsTrigger value="listing" className="cursor-pointer">Listing</TabsTrigger>
                    <TabsTrigger value="discogs" className="cursor-pointer">Discogs</TabsTrigger>
                </TabsList>

                <TabsContent value="achat">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations d'achat</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Date</span>
                                <span className="mt-1">{formatDateDDMMYYYY(data.buyDate)}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Lieu</span>
                                <span className="mt-1">{data.buyPlace}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Prix net</span>
                                <span className="mt-1">{data.netBuyPrice} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Frais livraison</span>
                                <span className="mt-1">{data.buyDeliveryFees} €</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vente">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations de vente</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Date</span>
                                <span className="mt-1">{formatDateDDMMYYYY(data.sellingDate)}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Lieu</span>
                                <span className="mt-1">{data.sellingPlace}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Prix net</span>
                                <span className="mt-1">{data.netSellingPrice} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Frais livraison</span>
                                <span className="mt-1">{data.sellingDeliveryFees} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Commission</span>
                                <span className="mt-1">{data.sellingCommission} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Frais Paypal</span>
                                <span className="mt-1">{data.paypalFees} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Frais eBay</span>
                                <span className="mt-1">{data.iebayFees} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Statut du paiement</span>
                                <span className="mt-1">{data.paymentStatus}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Statut de la livraison</span>
                                <span className="mt-1">{data.deliveryStatus}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Réception</span>
                                <span className="mt-1">{data.isReceived}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listing">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations de listing</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">CD&LP Prix</span>
                                <span className="mt-1">{data.cdlpListingPrice} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">CD&LP Statut</span>
                                <span className="mt-1">{data.cdlpListingStatus}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Discogs Prix</span>
                                <span className="mt-1">{data.discogsSellingPrice} €</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Discogs Statut</span>
                                <span className="mt-1">{data.discogsSellingStatus}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">eBay Statut</span>
                                <span className="mt-1">{data.ebayListingStatus}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2 sm:col-span-2 lg:col-span-3">
                                <span className="text-sm font-medium text-muted-foreground">Problèmes</span>
                                <span className="mt-1">{data.listingIssues}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="discogs">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations Discogs</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {loadingDiscogs ? (
                                <p>Chargement des données Discogs...</p>
                            ) : discogsData ? (
                                <>
                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Titre</span>
                                        <span className="mt-1">{discogsData.title}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Référence</span>
                                        <span className="mt-1">{discogsData.catno}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Pays</span>
                                        <span className="mt-1">{discogsData.country}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Année</span>
                                        <span className="mt-1">{discogsData.year}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Format</span>
                                        <span className="mt-1">{discogsData.format?.join(", ")}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Label</span>
                                        <span className="mt-1">{discogsData.label?.join(", ")}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Type</span>
                                        <span className="mt-1">{discogsData.type}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Genre</span>
                                        <span className="mt-1">{discogsData.genre}</span>
                                    </div>

                                    <div className="flex flex-col border-b pb-2 sm:col-span-2 lg:col-span-3">
                                        <span className="text-sm font-medium text-muted-foreground">Style</span>
                                        <span className="mt-1">{discogsData.style?.join(", ")}</span>
                                    </div>
                                </>
                            ) : (
                                <p>Aucun résultat trouvé sur Discogs</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}