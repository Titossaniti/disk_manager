import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SellingStatus } from "@/types/filters";

export const useSellingStatuses = () => {
    return useQuery<SellingStatus[]>({
        queryKey: ["selling-statuses"],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/selling-statuses`, {
                withCredentials: true,
            });
            return res.data;
        },
    });
};