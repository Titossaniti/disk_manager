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

const getStatusLabelById = (id: number | undefined): string | undefined => {
    switch (id) {
        case 1: return "réceptionné";
        case 2: return "à mettre en vente";
        case 3: return "pas encore en vente";
        case 4: return "en vente";
        case 5: return "vendu";
        default: return undefined;
    }
};

export const vinyleSchema = z.object({
    // Champs requis
    artist: z.string().min(1, "Champ requis"),
    title: z.string().min(1, "Champ requis"),
    support: z.string().min(1, "Champ requis"),
    countryYear: z.string().min(1, "Champ requis"),
    buyPlace: z.string().min(1, "Champ requis"),
    netBuyPrice: flexibleNumber(),
    buyDate: z.string({ required_error: "Champ requis", invalid_type_error: "La date doit être une chaîne" }).regex(dateFormat, "Date requise ou invalide"),
    sellingStatusId: z.number({
        required_error: "Champ requis",
        invalid_type_error: "Statut de vente requis ou invalide"
    }).min(1, "Champ requis"),
    diskCondition: z.string().min(1, "Champ requis"),

    // Champs optionnels
    label: z.string().nullable().optional(),
    genre: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    sellingPlace: z.string().nullable().optional(),
    sellingDate: z
        .union([
            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date nécessaire"),
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
}).superRefine((data, ctx) => {
    const statusLabel = getStatusLabelById(data.sellingStatusId);

    if (!statusLabel) return;

    const isVendu = statusLabel === "vendu";

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

    } else {
        // cas contraire : tout ce qui n’est pas "vendu"
        if (data.sellingDate && data.sellingDate !== "") {
            ctx.addIssue({
                path: ["sellingDate"],
                code: z.ZodIssueCode.custom,
                message: "La date de vente ne doit pas être remplie si le disque n'est pas vendu.",
            });
        }

        if (data.netSellingPrice > 0) {
            ctx.addIssue({
                path: ["netSellingPrice"],
                code: z.ZodIssueCode.custom,
                message: "Le prix de vente ne doit pas être rempli si le disque n'est pas vendu.",
            });
        }

        if (data.sellingPlace && data.sellingPlace.trim() !== "") {
            ctx.addIssue({
                path: ["sellingPlace"],
                code: z.ZodIssueCode.custom,
                message: "Le lieu de vente ne doit pas être rempli si le disque n'est pas vendu.",
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
    "sellingStatusId",
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
    "sellingStatusId",
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
