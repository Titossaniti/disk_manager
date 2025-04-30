import {
    Input,
    Label,
    Textarea,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui";
import { Euro } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { VinyleFormData, requiredFields, orderedFields} from "@/schema/vinyleSchema";

type Props = {
    register: UseFormRegister<VinyleFormData>;
    errors: FieldErrors<VinyleFormData>;
    watch: UseFormWatch<VinyleFormData>;
    setValue: UseFormSetValue<VinyleFormData>;
    filtersInit: {
        supports: string[];
        sellingStatuses: string[];
    };
};

export const VinyleFormFields = ({ register, errors, watch, setValue, filtersInit }: Props) => {
    return (
        <>
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
                                {filtersInit.supports.map((s) => (
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
                                {filtersInit.sellingStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : key === "notes" || key === "listingIssues" ? (
                        <Textarea {...register(key)} />
                    ) : (
                        <Input
                            type="text"
                            inputMode={key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? "decimal" : undefined}
                            min={key.includes("Price") || key.includes("Fees") || key.includes("Commission") ? 0 : undefined}
                            {...register(key)}
                        />
                    )}
                    {errors[key] && <p className="text-sm text-red-500">{errors[key]?.message as string}</p>}
                </div>
            ))}
        </>
    );
};
