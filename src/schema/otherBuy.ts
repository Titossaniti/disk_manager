import { z } from "zod"

export const otherBuyFormSchema = z.object({
    name: z.string().min(1, "Nom requis"),
    buyPrice: z.coerce.number().min(0, "Prix requis"),
    buyFees: z.coerce.number().optional(),
    buyDate: z.string().min(1, "Date requise"),
    category: z.string().optional().nullable(),
})

export type OtherBuyForm = z.infer<typeof otherBuyFormSchema>

export type OtherBuy = OtherBuyForm & {
    id: number
}

export type OtherBuyResponse = {
    content: OtherBuy[]
    totals: {
        totalBuyPrice: number
        totalBuyPriceWithFees: number
    }
    pagination?: {
        page: number
        size: number
        totalElements: number
        totalPages: number
        first: boolean
        last: boolean
        sortBy: string | null
        direction: string | null
    }
}

