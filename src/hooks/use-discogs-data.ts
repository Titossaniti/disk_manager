import { useQuery } from "@tanstack/react-query";

export const useDiscogsData = ({
                                   artist,
                                   title,
                                   label,
                                   ref,
                               }: {
    artist?: string;
    title?: string;
    countryYear?: string;
    label?: string;
    ref?: string;
}) => {

    return useQuery({
        queryKey: ["discogs", artist, title, label, ref ],
        queryFn: async () => {
            if (!artist || !title) return null;

            const token = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;
            const url = new URL("https://api.discogs.com/database/search");
            const q = `${artist} ${title} ${label ?? ""} ${ref ?? ""}`.trim();

            url.searchParams.set("q", q);
            url.searchParams.set("type", "release");
            url.searchParams.set("format", "Vinyl");
            url.searchParams.set("per_page", "1");
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
