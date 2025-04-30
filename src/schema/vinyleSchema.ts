import { z } from "zod";

const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

const flexibleNumber = () =>
    z.preprocess(
        (val) => typeof val === "string" ? parseFloat(val.replace(",", ".")) : val,
        z.number().nonnegative("Doit être positif")
    );

export const vinyleSchema = z.object({
    // Required fields
    artist: z.string().min(1, "Champ requis"),
    title: z.string().min(1, "Champ requis"),
    support: z.string().min(1, "Champ requis"),
    countryYear: z.string().min(1, "Champ requis"),
    buyPlace: z.string().min(1, "Champ requis"),
    netBuyPrice: flexibleNumber(),
    buyDate: z.string({ required_error: "Champ requis", invalid_type_error: "La date doit être une chaîne"}).regex(dateFormat, "Format attendu : yyyy-MM-dd"),
    sellingStatus: z.string().min(1, "Champ requis"),
    diskCondition: z.string().min(1, "Champ requis"),
    // Optional fields
    label: z.string().nullable().optional(),
    genre: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    sellingPlace: z.string().nullable().optional(),
    // sellingDate: z.string().regex(dateFormat, "Format attendu : yyyy-MM-dd").nullable().optional(),
    sellingDate: z
        .union([
            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : yyyy-MM-dd"),
            z.literal(""),
            z.null()
        ])
        .optional().nullable(),
    netSellingPrice: flexibleNumber().nullable().optional(),
    buyDeliveryFees: flexibleNumber().nullable().optional(),
    sellingDeliveryFees: flexibleNumber().nullable().optional(),
    sellingCommission: flexibleNumber().nullable().optional(),
    paypalFees: flexibleNumber().nullable().optional(),
    iebayFees: flexibleNumber().nullable().optional(),
    paymentStatus: z.string().nullable().optional(),
    deliveryStatus: z.string().nullable().optional(),
    isReceived: z.string().nullable().optional(),
    scanStatus: z.string().nullable().optional(),
    ref: z.string().nullable().optional(),
    cdlpListingPrice: flexibleNumber().nullable().optional(),
    cdlpListingStatus: z.string().nullable().optional(),
    discogsSellingPrice: flexibleNumber().nullable().optional(),
    discogsSellingStatus: z.string().nullable().optional(),
    listingIssues: z.string().nullable().optional(),
    ebayListingStatus: z.string().nullable().optional(),
}).refine(
    (data) => {
        if (!data.sellingDate || data.sellingDate === "") return true;
        return new Date(data.sellingDate) >= new Date(data.buyDate);
    },
    {
        message: "La date de vente ne peut pas être antérieure à la date d'achat.",
        path: ["sellingDate"],
    }
);

export type VinyleFormData = z.infer<typeof vinyleSchema>;

export const requiredFields: (keyof VinyleFormData)[] = [
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

export const orderedFields: (keyof VinyleFormData)[] = [
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
