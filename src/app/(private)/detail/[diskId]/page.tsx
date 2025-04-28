"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import {
    Input,
    Button,
    Label,
    Textarea,
    Separator,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Skeleton,
} from "@/components/ui";

interface Vinyle {
    id: number;
    support: string;
    artist: string;
    title: string;
    countryYear: string;
    label: string;
    genre: string;
    diskCondition: string;
    notes: string;
    sellingStatus: string;
    buyPlace: string;
    buyDate: string;
    netBuyPrice: number;
    buyDeliveryFees: number;
    sellingPlace: string;
    sellingDate: string;
    netSellingPrice: number;
    sellingDeliveryFees: number;
    sellingCommission: number;
    paypalFees: number;
    iebayFees: number;
    paymentStatus: string;
    deliveryStatus: string;
    isReceived: string;
    scanStatus: string;
    ref: string;
    cdlpListingPrice: number;
    cdlpListingStatus: string;
    discogsSellingPrice: number;
    discogsSellingStatus: string;
    listingIssues: string;
    ebayListingStatus: string;
    margin: number;
}

export default function DetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const diskId = params.diskId?.toString().split("-")[0];

    const { data, isLoading, isError } = useQuery<Vinyle>({
        queryKey: ["vinyle", diskId],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, {
                withCredentials: true,
            });
            return data;
        },
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Vinyle>>({});
    const [confirmEditOpen, setConfirmEditOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("achat");

    const updateVinyle = useMutation({
        mutationFn: async (updatedData: Partial<Vinyle>) => {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/${diskId}`, updatedData, {
                withCredentials: true,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vinyle", diskId] });
            setIsEditing(false);
            toast.success("Disque modifié avec succès !");
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

    useEffect(() => {
        if (searchParams.get("deleted")) {
            toast.success("Le disque a été supprimé !");
            router.replace("/vinyles");
        }
    }, [searchParams, router]);

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (isError || !data) return <div className="p-4 text-red-600">Erreur de chargement</div>;

    const handleChange = (name: string, value: any) => {
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const renderField = (label: string, field: keyof Vinyle, isFullWidth = false) => (
        <div className={isFullWidth ? "col-span-2" : ""}>
            <Label>{label}</Label>
            {isEditing ? (
                <Input defaultValue={data[field]?.toString() || ""} onChange={(e) => handleChange(field, e.target.value)} />
            ) : (
                <p>{data[field] || "-"}</p>
            )}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <Button variant="outline" onClick={() => router.push("/vinyles")} className="mb-4">
                ← Retour aux disques
            </Button>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    {data.artist} - {data.title}
                </h1>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>Modifier</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                            <Dialog open={confirmEditOpen} onOpenChange={setConfirmEditOpen}>
                                <DialogTrigger asChild>
                                    <Button>Enregistrer</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirmation de modification</DialogTitle>
                                    </DialogHeader>
                                    <p>Êtes-vous sûr de vouloir modifier les informations de ce disque ?</p>
                                    <DialogFooter className="flex gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setConfirmEditOpen(false)}>Annuler</Button>
                                        <Button onClick={() => {
                                            const fullData = { ...data, ...editData };
                                            updateVinyle.mutate(fullData);
                                        }}>Confirmer</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
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

            {/* Informations principales */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations principales</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("Artiste", "artist")}
                    {renderField("Titre", "title")}
                    {renderField("Support", "support")}
                    {renderField("Pressage", "countryYear")}
                    {renderField("Label", "label")}
                    {renderField("Genre", "genre")}
                    {renderField("État du disque", "diskCondition")}
                    {renderField("Référence", "ref")}
                    {renderField("Notes", "notes", true)}
                    {renderField("Statut de vente", "sellingStatus")}
                    {renderField("Prix d'achat (€)", "netBuyPrice")}
                    {data.sellingStatus === "vendu" && (
                        <>
                            {renderField("Prix de vente (€)", "netSellingPrice")}
                            {renderField("Marge (€)", "margin")}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Onglets animés */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start gap-2">
                    <TabsTrigger value="achat">Achat</TabsTrigger>
                    <TabsTrigger value="vente">Vente</TabsTrigger>
                    <TabsTrigger value="listing">Listing</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    {activeTab === "achat" && (
                        <TabsContent value="achat" asChild>
                            <motion.div
                                key="achat"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Card className="mt-4">
                                    <CardHeader><CardTitle>Informations d'achat</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderField("Lieu d'achat", "buyPlace")}
                                        {renderField("Date d'achat", "buyDate")}
                                        {renderField("Prix d'achat (€)", "netBuyPrice")}
                                        {renderField("Frais d'achat (€)", "buyDeliveryFees")}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    )}

                    {activeTab === "vente" && (
                        <TabsContent value="vente" asChild>
                            <motion.div
                                key="vente"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Card className="mt-4">
                                    <CardHeader><CardTitle>Informations de vente</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderField("Prix CD&LP (€)", "cdlpListingPrice")}
                                        {renderField("Statut CD&LP", "cdlpListingStatus")}
                                        {renderField("Prix Discogs (€)", "discogsSellingPrice")}
                                        {renderField("Statut Discogs", "discogsSellingStatus")}
                                        {renderField("Statut Ebay", "ebayListingStatus")}
                                        {renderField("Lieu de vente", "sellingPlace")}
                                        {renderField("Date de vente", "sellingDate")}
                                        {renderField("Prix de vente (€)", "netSellingPrice")}
                                        {renderField("Frais de vente (€)", "sellingDeliveryFees")}
                                        {renderField("Commission (€)", "sellingCommission")}
                                        {renderField("Frais Paypal (€)", "paypalFees")}
                                        {renderField("Frais Ebay (€)", "iebayFees")}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    )}

                    {activeTab === "listing" && (
                        <TabsContent value="listing" asChild>
                            <motion.div
                                key="listing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Card className="mt-4">
                                    <CardHeader><CardTitle>Informations listing</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderField("Statut de paiement", "paymentStatus")}
                                        {renderField("Statut de livraison", "deliveryStatus")}
                                        {renderField("Réception", "isReceived")}
                                        {renderField("Scan", "scanStatus")}
                                        {renderField("Notes / Problèmes", "listingIssues", true)}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    )}
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
