"use client";


import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import axios from "axios";
import {toast} from "sonner";
import {AnimatePresence, motion} from "framer-motion";

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
    TabsTrigger
} from "@/components/ui";
import { Spinner } from "@/components/ui/spinner";
import { vinyleSchema, VinyleFormData } from "@/schema/vinyleSchema";
import { VinyleFormFields } from "@/components/vinyle-form-fields";

export default function DetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const diskId = params.diskId?.toString().split("-")[0];

    const [isEditing, setIsEditing] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const form = useForm<VinyleFormData>({
        resolver: zodResolver(vinyleSchema),
    });
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting, dirtyFields },
    } = form;

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
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, {
                withCredentials: true,
            });
            Object.entries(data).forEach(([key, value]) => {
                setValue(key as keyof VinyleFormData, value);
            });
            return data;
        },
    });

    const updateVinyle = useMutation({
        mutationFn: async (updatedData: VinyleFormData) => {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, updatedData, {
                withCredentials: true,
            });
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
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            router.push("/vinyles?deleted=true");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression du disque");
        },
    });

    const [activeTab, setActiveTab] = useState("achat");

    useEffect(() => {
        if (searchParams.get("deleted")) {
            toast.success("Le disque a été supprimé !");
            router.replace("/vinyles");
        }
    }, [searchParams, router]);

    if (isLoading || isLoadingFilters || !filtersInit) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (isError || !data) return <div className="p-4 text-red-600">Erreur de chargement</div>;

    return (
        <div className="p-6 space-y-6">
            <Button variant="outline" onClick={() => router.push("/vinyles")} className="mb-4">
                ← Retour aux disques
            </Button>

            <div className="flex justify-between items-center pt-4">
                <h1 className="text-3xl font-bold">
                    {watch("artist")} - {watch("title")}
                </h1>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" disabled={Object.keys(dirtyFields).length === 0}>
                                    Annuler
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Annuler la modification</DialogTitle>
                                </DialogHeader>
                                <p>Les modifications en cours seront perdues. Voulez-vous vraiment annuler ?</p>
                                <DialogFooter className="flex gap-2 pt-4">
                                    <Button variant="outline" onClick={() => { if (data) form.reset(data); setIsEditing(false); }}>Oui, annuler</Button>
                                    <DialogClose asChild>
                                        <Button autoFocus>Continuer l'édition</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Supprimer</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmation de suppression</DialogTitle>
                            </DialogHeader>
                            <p>Vous allez supprimer ce disque de la base de données. Êtes-vous sûr ?</p>
                            <DialogFooter className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
                                <Button variant="destructive" onClick={() => deleteVinyle.mutate()}>Supprimer</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Separator />

            {!isEditing ? (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Résumé</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <p><strong>Support :</strong> {watch("support")}</p>
                            <p><strong>Pressage :</strong> {watch("countryYear")}</p>
                            <p><strong>Label :</strong> {watch("label")}</p>
                            <p><strong>Genre :</strong> {watch("genre")}</p>
                            <p><strong>État :</strong> {watch("diskCondition")}</p>
                            <p><strong>Référence :</strong> {watch("ref")}</p>
                            <p className="col-span-2"><strong>Notes :</strong> {watch("notes")}</p>
                        </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start gap-2">
                            <TabsTrigger value="achat">Achat</TabsTrigger>
                            <TabsTrigger value="vente">Vente</TabsTrigger>
                            <TabsTrigger value="listing">Listing</TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            {activeTab === "achat" && (
                                <TabsContent value="achat">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <Card className="mt-4">
                                            <CardHeader><CardTitle>Informations d'achat</CardTitle></CardHeader>
                                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <p><strong>Lieu d'achat :</strong> {watch("buyPlace")}</p>
                                                <p><strong>Date :</strong> {watch("buyDate")}</p>
                                                <p><strong>Prix :</strong> {watch("netBuyPrice")} €</p>
                                                <p><strong>Frais :</strong> {watch("buyDeliveryFees")} €</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                            )}
                            {activeTab === "vente" && (
                                <TabsContent value="vente">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <Card className="mt-4">
                                            <CardHeader><CardTitle>Informations de vente</CardTitle></CardHeader>
                                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <p><strong>CD&LP :</strong> {watch("cdlpListingStatus")}</p>
                                                <p><strong>Discogs :</strong> {watch("discogsSellingStatus")}</p>
                                                <p><strong>eBay :</strong> {watch("ebayListingStatus")}</p>
                                                <p><strong>Lieu :</strong> {watch("sellingPlace")}</p>
                                                <p><strong>Date :</strong> {watch("sellingDate")}</p>
                                                <p><strong>Prix :</strong> {watch("netSellingPrice")} €</p>
                                                <p><strong>Livraison :</strong> {watch("sellingDeliveryFees")} €</p>
                                                <p><strong>Commission :</strong> {watch("sellingCommission")} €</p>
                                                <p><strong>Paypal :</strong> {watch("paypalFees")} €</p>
                                                <p><strong>eBay :</strong> {watch("iebayFees")} €</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                            )}
                            {activeTab === "listing" && (
                                <TabsContent value="listing">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <Card className="mt-4">
                                            <CardHeader><CardTitle>Informations listing</CardTitle></CardHeader>
                                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <p><strong>Statut paiement :</strong> {watch("paymentStatus")}</p>
                                                <p><strong>Livraison :</strong> {watch("deliveryStatus")}</p>
                                                <p><strong>Réception :</strong> {watch("isReceived")}</p>
                                                <p><strong>Scan :</strong> {watch("scanStatus")}</p>
                                                <p className="col-span-2"><strong>Remarques :</strong> {watch("listingIssues")}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                            )}
                        </AnimatePresence>
                    </Tabs>
                </>
            ) : (
                <form
                    id="editForm"
                    onSubmit={handleSubmit((values) => updateVinyle.mutate(values), () => {
                        toast.error("Veuillez corriger les erreurs dans le formulaire.");
                    })}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader><CardTitle>Modifier le disque</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <VinyleFormFields
                                register={register}
                                errors={errors}
                                watch={watch}
                                setValue={setValue}
                                filtersInit={filtersInit}
                            />
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-4 px-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : "Enregistrer les modifications"}
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" disabled={Object.keys(dirtyFields).length === 0}>
                                    Annuler
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Annuler la modification</DialogTitle>
                                </DialogHeader>
                                <p>Les modifications en cours seront perdues. Voulez-vous vraiment annuler ?</p>
                                <DialogFooter className="flex gap-2 pt-4">
                                    <Button variant="outline" onClick={() => { form.reset(data); setIsEditing(false); }}>Oui, annuler</Button>
                                    <DialogClose asChild>
                                        <Button autoFocus>Continuer l'édition</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </form>)}
        </div>
    );
}
