"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { CircleCheckBig, CircleSlash, Loader2 } from "lucide-react";

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
        reset();
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

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => router.push("/vinyles")} className="cursor-pointer">
                    ← Retour aux disques
                </Button>
                {!isEditing ? (
                    <div className="flex gap-2">
                        <Button onClick={handleEdit} variant="outline">
                            Modifier
                        </Button>
                        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">Supprimer</Button>
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
                    <div className="flex gap-2">
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
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <p><strong>Support :</strong> {data.support}</p>
                                <p><strong>Pressage :</strong> {data.countryYear}</p>
                                <p><strong>Label :</strong> {data.label}</p>
                                <p><strong>Genre :</strong> {data.genre}</p>
                                <p><strong>État :</strong> {data.diskCondition}</p>
                                <p><strong>Statut :</strong> <Badge
                                    className={sellingStatusBadgeColor(data.sellingStatus)}>{data.sellingStatus || "?"}</Badge></p>
                                <p><strong>Marge :</strong> {data.margin} €</p>
                                <p><strong>Référence :</strong> {data.ref}</p>
                                <p className="flex items-center space-x-2"><strong>Scan :</strong>{renderScanStatus(data.scanStatus)}</p>
                                <p className="sm:col-span-2 lg:col-span-3"><strong>Notes :</strong> {data.notes}</p>
                                {discogsData?.id && discogsData?.type && (
                                    <a
                                        href={`https://www.discogs.com/${discogsData.type}/${discogsData.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline sm:col-span-2 lg:col-span-3"
                                    >
                                        Voir la page du disque sur Discogs
                                    </a>
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
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p><strong>Date :</strong> {data.buyDate}</p>
                            <p><strong>Lieu :</strong> {data.buyPlace}</p>
                            <p><strong>Prix net :</strong> {data.netBuyPrice} €</p>
                            <p><strong>Frais livraison :</strong> {data.buyDeliveryFees} €</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vente">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations de vente</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p><strong>Date :</strong> {data.sellingDate}</p>
                            <p><strong>Lieu :</strong> {data.sellingPlace}</p>
                            <p><strong>Prix net :</strong> {data.netSellingPrice} €</p>
                            <p><strong>Frais livraison :</strong> {data.sellingDeliveryFees} €</p>
                            <p><strong>Commission :</strong> {data.sellingCommission} €</p>
                            <p><strong>Frais Paypal :</strong> {data.paypalFees} €</p>
                            <p><strong>Frais eBay :</strong> {data.iebayFees} €</p>
                            <p><strong>Statut du paiement :</strong> {data.paymentStatus}</p>
                            <p><strong>Statut de la livraison :</strong> {data.deliveryStatus}</p>
                            <p><strong>Réception :</strong> {data.isReceived}</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listing">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations de listing</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p><strong>CD&LP Prix :</strong> {data.cdlpListingPrice} €</p>
                            <p><strong>CD&LP Statut :</strong> {data.cdlpListingStatus}</p>
                            <p><strong>Discogs Prix :</strong> {data.discogsSellingPrice} €</p>
                            <p><strong>Discogs Statut :</strong> {data.discogsSellingStatus}</p>
                            <p><strong>eBay Statut :</strong> {data.ebayListingStatus}</p>
                            <p><strong>Problèmes :</strong> {data.listingIssues}</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="discogs">
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Informations Discogs</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {loadingDiscogs ? (
                                <p>Chargement des données Discogs...</p>
                            ) : discogsData ? (
                                <>
                                    <div className="space-y-2">
                                        <p><strong>Titre :</strong> {discogsData.title}</p>
                                        <p><strong>Référence :</strong> {discogsData.catno}</p>
                                        <p><strong>Pays :</strong> {discogsData.country}</p>
                                        <p><strong>Année :</strong> {discogsData.year}</p>
                                        <p><strong>Format :</strong> {discogsData.format?.join(", ")}</p>
                                        <p><strong>Label :</strong> {discogsData.label?.join(", ")}</p>
                                        <p><strong>Type :</strong> {discogsData.type}</p>
                                        <p><strong>Genre :</strong> {discogsData.genre}</p>
                                        <p><strong>Style :</strong> {discogsData.style?.join(", ")}</p>
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