import { useQuery } from "@tanstack/react-query";

const extractYear = (cy: string | null | undefined): string | undefined => {
    const match = cy?.match(/\d{2}$/);
    return match ? `19${match[0]}` : undefined;
};

export const useDiscogsData = ({
                                   artist,
                                   title,
                                   countryYear,
                               }: {
    artist?: string;
    title?: string;
    countryYear?: string;
}) => {
    const year = extractYear(countryYear);

    return useQuery({
        queryKey: ["discogs", artist, title, year],
        queryFn: async () => {
            if (!artist || !title) return null;

            const token = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;
            const url = new URL("https://api.discogs.com/database/search");
            url.searchParams.set("q", `${artist} ${title}`);
            url.searchParams.set("type", "release");
            url.searchParams.set("format", "Vinyl");
            url.searchParams.set("per_page", "1");
            if (year) url.searchParams.set("year", year);
            url.searchParams.set("token", token ?? "");

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Erreur Discogs");
            const json = await res.json();
            return json.results?.[0] || null;
        },
        enabled: !!artist && !!title,
        staleTime: 1000 * 60 * 5,
    });
};
