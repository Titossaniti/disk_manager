"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

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
    DialogFooter
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
            toast.success("Disque supprimé avec succès !");
            router.push("/vinyles");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression du disque");
        },
    });

    if (isLoading) return <div className="p-4">Chargement...</div>;
    if (isError || !data) return <div className="p-4 text-red-600">Erreur de chargement</div>;

    const handleChange = (name: string, value: any) => {
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 space-y-6">
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
                                        <Button onClick={() => updateVinyle.mutate(editData)}>Confirmer</Button>
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

            <Card>
                <CardHeader>
                    <CardTitle>Informations principales</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>ID</Label>
                        <p>{data.id}</p>
                    </div>
                    <div>
                        <Label>Marge (€)</Label>
                        <p>{data.margin}</p>
                    </div>
                    <div className="col-span-2">
                        <Label>Support</Label>
                        {isEditing ? (
                            <Input defaultValue={data.support} onChange={(e) => handleChange("support", e.target.value)} />
                        ) : (
                            <p>{data.support}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Onglets */}
            <Tabs defaultValue="achat" className="w-full">
                <TabsList className="w-full justify-start gap-2">
                    <TabsTrigger value="achat">Achat</TabsTrigger>
                    <TabsTrigger value="vente">Vente</TabsTrigger>
                    <TabsTrigger value="listing">Listing</TabsTrigger>
                </TabsList>

                <TabsContent value="achat">
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Informations d'achat</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Lieu d'achat</Label>
                                <p>{data.buyPlace}</p>
                            </div>
                            <div>
                                <Label>Date d'achat</Label>
                                <p>{data.buyDate}</p>
                            </div>
                            <div>
                                <Label>Prix d'achat (€)</Label>
                                <p>{data.netBuyPrice}</p>
                            </div>
                            <div>
                                <Label>Frais d'achat (€)</Label>
                                <p>{data.buyDeliveryFees}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vente">
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Informations de vente</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Lieu de vente</Label>
                                <p>{data.sellingPlace}</p>
                            </div>
                            <div>
                                <Label>Date de vente</Label>
                                <p>{data.sellingDate}</p>
                            </div>
                            <div>
                                <Label>Prix de vente (€)</Label>
                                <p>{data.netSellingPrice}</p>
                            </div>
                            <div>
                                <Label>Frais de vente (€)</Label>
                                <p>{data.sellingDeliveryFees}</p>
                            </div>
                            <div>
                                <Label>Commission (€)</Label>
                                <p>{data.sellingCommission}</p>
                            </div>
                            <div>
                                <Label>Frais Paypal (€)</Label>
                                <p>{data.paypalFees}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listing">
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Informations listing</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Statut CD&LP</Label>
                                <p>{data.cdlpListingStatus}</p>
                            </div>
                            <div>
                                <Label>Statut Discogs</Label>
                                <p>{data.discogsSellingStatus}</p>
                            </div>
                            <div>
                                <Label>Statut Ebay</Label>
                                <p>{data.ebayListingStatus}</p>
                            </div>
                            <div className="col-span-2">
                                <Label>Notes / Problèmes</Label>
                                <p>{data.listingIssues}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
