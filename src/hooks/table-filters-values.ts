import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TableFiltersInit } from "@/types/filters";

export const useTableFiltersValues = () => {
    return useQuery<TableFiltersInit, Error, TableFiltersInit>({
        queryKey: ["table-filters-values"],
        queryFn: async () => {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/filters/initialization`, {
                withCredentials: true,
            });
            return data;
        },
        staleTime: Infinity,
    });
};

