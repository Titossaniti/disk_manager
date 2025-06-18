import {
    Input,
    Label,
    Textarea,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui"
import { Euro } from "lucide-react"
import {
    UseFormRegister,
    FieldErrors,
    UseFormWatch,
    UseFormSetValue,
} from "react-hook-form"
import {
    VinyleFormData,
    requiredFields,
    orderedFields,
} from "@/schema/vinyleSchema"
import {DateTimePicker} from "@/components/ui/datetime-picker";
import { fr } from "date-fns/locale"
import {format} from "date-fns";

const fieldLabels: Partial<Record<keyof VinyleFormData, string>> = {
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
    sellingStatusId: "Statut de vente",
    sellingPlace: "Lieu de vente",
    sellingDate: "Date de vente",
    paymentStatus: "Statut du paiement",
    deliveryStatus: "État de la livraison",
    isReceived: "État de la réception",
    cdlpListingStatus: "Statut de l'annonce CD&LP",
    discogsSellingStatus: "Statut de l'annonce Discogs",
    ebayListingStatus: "Statut de l'annonce eBay",
    listingIssues: "Problèmes rencontrés",
    buyDeliveryFees: "Frais de livraison d'achat",
    netBuyPrice: "Prix d'achat",
    netSellingPrice: "Prix de vente",
    sellingCommission: "Commission du site de vente",
    paypalFees: "Frais Paypal",
    iebayFees: "Frais ieBay",
    sellingDeliveryFees: "Frais de livraison de vente",
    cdlpListingPrice: "Prix CD&LP",
    discogsSellingPrice: "Prix Discogs",
}


type SellingStatusOption = {
    id: number;
    label: string;
};

type Props = {
    register: UseFormRegister<VinyleFormData>
    errors: FieldErrors<VinyleFormData>
    watch: UseFormWatch<VinyleFormData>
    setValue: UseFormSetValue<VinyleFormData>
    filtersInit: {
        supports: string[]
        sellingStatuses: SellingStatusOption[]
    }
}

export const VinyleFormFields = ({
                                     register,
                                     errors,
                                     watch,
                                     setValue,
                                     filtersInit,
                                 }: Props) => {

    return (
        <>
            {orderedFields.map((key) => (
                <div key={key} className="flex flex-col gap-1">
                    <Label className="flex items-center gap-1">
                        {requiredFields.includes(key) && (
                            <span className="text-red-500">*</span>
                        )}
                        {fieldLabels[key] ?? key}
                        {key?.includes("Price") || key?.includes("Fees") || key?.includes("Commission") ? (
                            <Euro className="w-4 h-4 text-muted-foreground" />
                        ) : null}
                    </Label>

                    {key === "support" ? (
                        <Select
                            value={watch("support")}
                            onValueChange={(v) => setValue("support", v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filtersInit.supports.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : key === "sellingStatusId" ? (
                        <Select
                            value={watch("sellingStatusId")?.toString()}
                            onValueChange={(v) => setValue("sellingStatusId", Number(v))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filtersInit.sellingStatuses.map((status) => (
                                    <SelectItem key={status.id} value={status.id.toString()}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : key === "notes" || key === "listingIssues" ? (
                        <Textarea {...register(key)} />
                    ) : key === "buyDate" || key === "sellingDate" ? (() => {
                        const rawValue = watch(key);
                        return (
                            <DateTimePicker
                                granularity="day"
                                locale={fr}
                                displayFormat={{ hour24: "PPP", hour12: "PP" }}
                                value={rawValue && typeof rawValue === "string" && !isNaN(Date.parse(rawValue)) ? new Date(rawValue) : undefined}
                                onChange={(date) => {
                                    const formattedDate = date ? format(date, "yyyy-MM-dd", { locale: fr }) : "";
                                    setValue(key, formattedDate);
                                }}
                                className="cursor-pointer"
                            />
                        );
                    })() : (
                        <Input
                            type="text"
                            inputMode={
                                key.includes("Price") ||
                                key.includes("Fees") ||
                                key.includes("Commission")
                                    ? "decimal"
                                    : undefined
                            }
                            min={
                                key.includes("Price") ||
                                key.includes("Fees") ||
                                key.includes("Commission")
                                    ? 0
                                    : undefined
                            }
                            {...register(key)}
                        />
                    )}

                    {errors[key] && (
                        <p className="text-sm text-red-500">
                            {errors[key]?.message as string}
                        </p>
                    )}
                </div>
            ))}
        </>
    )
}
