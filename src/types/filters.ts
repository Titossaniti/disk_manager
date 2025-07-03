export type Filters = {
    artist: string;
    matchExactArtist: boolean;
    title: string;
    matchExactTitle: boolean;
    countryYear: string;
    support: string[];
    diskCondition: string;
    sellingStatus: string[];
    buyPlace: string;
    sellingPlace: string;
    label: string;
    buyDateFrom: Date | null;
    buyDateTo: Date | null;
    sellingDateFrom: Date | null;
    sellingDateTo: Date | null;
    netBuyPriceMin: number | null;
    netBuyPriceMax: number | null;
    netSellingPriceMin: number | null;
    netSellingPriceMax: number | null;
    marginMin: number | null;
    marginMax: number | null;
};

export type TableFiltersInit = {
    supports: string[];
    sellingStatuses: { id: number; label: string }[];
};

export type SellingStatus = {
    id: number;
    label: string;
};