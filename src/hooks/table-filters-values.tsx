"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTableFiltersValues = () => {
    return useQuery({
        queryKey: ["table-filters-values"],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/filters/initialization`, {
                withCredentials: true,
            });
            return data;
        },
        staleTime: Infinity,
        cacheTime: Infinity,
    });
};
