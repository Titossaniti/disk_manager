"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { VinyleFiltersForm } from "./vinyle-filter-form";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const fetchVinyles = async (params: any) => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params.page);
    queryParams.append("size", params.size);
    queryParams.append("sortBy", "artist");
    queryParams.append("direction", "asc");

    if (params.artist) queryParams.append("artist", params.artist);
    if (params.matchExactArtist) queryParams.append("matchExact", "true");
    if (params.title) queryParams.append("title", params.title);
    if (params.matchExactTitle) queryParams.append("matchExactTitle", "true");
    if (params.countryYear) queryParams.append("countryYear", params.countryYear);
    if (params.support) queryParams.append("support", params.support);
    if (params.diskCondition) queryParams.append("diskCondition", params.diskCondition);
    if (params.sellingStatus) queryParams.append("sellingStatus", params.sellingStatus);
    if (params.buyDateFrom) queryParams.append("buyDateFrom", format(params.buyDateFrom, "yyyy-MM-dd"));
    if (params.buyDateTo) queryParams.append("buyDateTo", format(params.buyDateTo, "yyyy-MM-dd"));
    if (params.netBuyPriceMin !== null) queryParams.append("netBuyPriceMin", params.netBuyPriceMin.toString());
    if (params.netBuyPriceMax !== null) queryParams.append("netBuyPriceMax", params.netBuyPriceMax.toString());
    if (params.netSellingPriceMin !== null) queryParams.append("netSellingPriceMin", params.netSellingPriceMin.toString());
    if (params.netSellingPriceMax !== null) queryParams.append("netSellingPriceMax", params.netSellingPriceMax.toString());
    if (params.marginMin !== null) queryParams.append("marginMin", params.marginMin.toString());
    if (params.marginMax !== null) queryParams.append("marginMax", params.marginMax.toString());

    const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vinyles/lite?${queryParams}`,
        { withCredentials: true }
    );
    return response.data;
};

const defaultFilters = {
    artist: "",
    matchExactArtist: false,
    title: "",
    matchExactTitle: false,
    countryYear: "",
    support: "",
    diskCondition: "",
    sellingStatus: "",
    buyDateFrom: null as Date | null,
    buyDateTo: null as Date | null,
    netBuyPriceMin: null as number | null,
    netBuyPriceMax: null as number | null,
    netSellingPriceMin: null as number | null,
    netSellingPriceMax: null as number | null,
    marginMin: null as number | null,
    marginMax: null as number | null,
};

const LiteVinylesTable = () => {
    const [filters, setFilters] = useState({ ...defaultFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...defaultFilters });

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["vinyles", { ...appliedFilters, page, size }],
        queryFn: () => fetchVinyles({ ...appliedFilters, page, size }),
        keepPreviousData: true,
    });

    const handleChange = (name: string, value: any) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setPage(0);
        setAppliedFilters({ ...filters });
    };

    const resetFilters = () => {
        setPage(0);
        setFilters({ ...defaultFilters });
        setAppliedFilters({ ...defaultFilters });
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (isError) return <div className="p-4 text-red-600">Erreur lors du chargement.</div>;
    if (!data) return null;

    const rows = data.content;
    const pagination = data.pagination;

    return (
        <div className="p-4 space-y-4">
            <VinyleFiltersForm
                filters={filters}
                onChange={handleChange}
                onDateChange={handleDateChange}
            />

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Support</TableHead>
                        <TableHead>Artiste</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Pays/Année</TableHead>
                        <TableHead>État</TableHead>
                        <TableHead>Scan</TableHead>
                        <TableHead>Prix (€)</TableHead>
                        <TableHead>Frais</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Réf</TableHead>
                        <TableHead>Vente (€)</TableHead>
                        <TableHead>Marge (€)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((disk: any) => (
                        <TableRow key={disk.id}>
                            <TableCell>{disk.id}</TableCell>
                            <TableCell>{disk.support}</TableCell>
                            <TableCell>{disk.artist}</TableCell>
                            <TableCell>{disk.title}</TableCell>
                            <TableCell>{disk.countryYear}</TableCell>
                            <TableCell>{disk.diskCondition}</TableCell>
                            <TableCell>{disk.scanStatus}</TableCell>
                            <TableCell>{disk.netBuyPrice}</TableCell>
                            <TableCell>{disk.buyDeliveryFees}</TableCell>
                            <TableCell>{disk.sellingStatus}</TableCell>
                            <TableCell>{disk.ref}</TableCell>
                            <TableCell>{disk.netSellingPrice ?? "-"}</TableCell>
                            <TableCell>{disk.margin ?? "-"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center pt-2">
                <Button
                    disabled={pagination.first}
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    size="sm"
                >
                    Précédent
                </Button>
                <div className="flex items-center gap-2 text-sm">
                    Page {pagination.page + 1} / {pagination.totalPages}
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="select select-sm"
                    >
                        {[50, 100, 150, 200].map((val) => (
                            <option key={val} value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <Button
                    disabled={pagination.last}
                    onClick={() => setPage((p) => p + 1)}
                    size="sm"
                >
                    Suivant
                </Button>
            </div>
        </div>
    );
};

export default LiteVinylesTable;