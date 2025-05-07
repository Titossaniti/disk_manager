import { z } from "zod";

const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

const flexibleNumber = () =>
    z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            if (typeof val === "string") return parseFloat(val.replace(",", "."));
            return val;
        },
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
    sellingDate: z
        .union([
            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : yyyy-MM-dd"),
            z.literal(""),
            z.null()
        ])
        .optional().nullable(),
    netSellingPrice: flexibleNumber(),
    buyDeliveryFees: flexibleNumber(),
    sellingDeliveryFees: flexibleNumber(),
    sellingCommission: flexibleNumber(),
    paypalFees: flexibleNumber(),
    iebayFees: flexibleNumber(),
    paymentStatus: z.string().nullable().optional(),
    deliveryStatus: z.string().nullable().optional(),
    isReceived: z.string().nullable().optional(),
    scanStatus: z.string().nullable().optional(),
    ref: z.string().nullable().optional(),
    cdlpListingPrice: flexibleNumber(),
    cdlpListingStatus: z.string().nullable().optional(),
    discogsSellingPrice: flexibleNumber(),
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
).superRefine((data, ctx) => {
    const isVendu = data.sellingStatus === "vendu";
    const isPasEnVente = data.sellingStatus === "pas encore en vente" || data.sellingStatus === "en vente";

    if (isVendu) {
        if (!data.sellingDate || data.sellingDate === "") {
            ctx.addIssue({
                path: ["sellingDate"],
                code: z.ZodIssueCode.custom,
                message: "La date de vente est requise si le disque est indiqué comme vendu.",
            });
        }

        if (data.netSellingPrice == null || isNaN(data.netSellingPrice)) {
            ctx.addIssue({
                path: ["netSellingPrice"],
                code: z.ZodIssueCode.custom,
                message: "Le prix de vente est requis si le disque est indiqué comme vendu.",
            });
        }
    }

    if (isPasEnVente) {
        if (data.sellingDate && data.sellingDate !== "") {
            ctx.addIssue({
                path: ["sellingDate"],
                code: z.ZodIssueCode.custom,
                message: "La date de vente ne doit pas être remplie si le disque n'est pas encore vendu.",
            });
        }

        if (data.netSellingPrice > 0) {
            ctx.addIssue({
                path: ["netSellingPrice"],
                code: z.ZodIssueCode.custom,
                message: "Le prix de vente ne doit pas être rempli si le disque n'est pas encore vendu.",
            });
        }

        if (data.sellingPlace && data.sellingPlace !== "") {
            ctx.addIssue({
                path: ["sellingPlace"],
                code: z.ZodIssueCode.custom,
                message: "Le lieu de vente ne doit pas être rempli si le disque n'est pas encore vendu.",
            });
        }
    }
});

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
