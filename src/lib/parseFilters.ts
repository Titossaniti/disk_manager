import { Filters } from "@/types/filters";

export function parseFiltersFromURL(params: URLSearchParams): Filters {
    const filters: Filters = {
        artist: "",
        matchExactArtist: false,
        title: "",
        matchExactTitle: false,
        countryYear: "",
        support: "",
        diskCondition: "",
        sellingStatus: [],
        buyPlace: "",
        sellingPlace: "",
        label: "",
        buyDateFrom: null,
        buyDateTo: null,
        sellingDateFrom: null,
        sellingDateTo: null,
        netBuyPriceMin: null,
        netBuyPriceMax: null,
        netSellingPriceMin: null,
        netSellingPriceMax: null,
        marginMin: null,
        marginMax: null,
    };

    for (const [key, value] of params.entries()) {
        switch (key) {
            case "artist":
            case "title":
            case "countryYear":
            case "support":
            case "diskCondition":
            case "buyPlace":
            case "sellingPlace":
            case "label":
                filters[key] = value;
                break;
            case "matchExactArtist":
            case "matchExactTitle":
                filters[key] = value === "true";
                break;
            case "buyDateFrom":
            case "buyDateTo":
            case "sellingDateFrom":
            case "sellingDateTo":
                filters[key] = new Date(value);
                break;
            case "netBuyPriceMin":
            case "netBuyPriceMax":
            case "netSellingPriceMin":
            case "netSellingPriceMax":
            case "marginMin":
            case "marginMax":
                filters[key] = Number(value);
                break;
            case "sellingStatuses":
                filters.sellingStatus.push(value);
                break;
        }
    }

    return filters;
}
