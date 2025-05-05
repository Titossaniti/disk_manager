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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { VinyleTablePagination } from "@/components/vinyle-table-pagination";
import { useTableFiltersValues } from "@/hooks/table-filters-values";

import { useRouter } from "next/navigation";

const fetchVinyles = async (params: any) => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params.page);
    queryParams.append("size", params.size);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortDirection) queryParams.append("direction", params.sortDirection);

    if (params.artist) queryParams.append("artist", params.artist);
    if (params.matchExactArtist) queryParams.append("matchExactArtist", "true");
    if (params.title) queryParams.append("title", params.title);
    if (params.matchExactTitle) queryParams.append("matchExactTitle", "true");
    if (params.countryYear) queryParams.append("countryYear", params.countryYear);
    if (params.support) queryParams.append("support", params.support);
    if (params.diskCondition) queryParams.append("diskCondition", params.diskCondition);
    if (params.sellingStatus?.length) {
        for (const status of params.sellingStatus) {
            queryParams.append("sellingStatuses", status);
        }
    }
    if (params.buyPlace) queryParams.append("buyPlace", params.buyPlace);
    if (params.sellingPlace) queryParams.append("sellingPlace", params.sellingPlace);
    if (params.label) queryParams.append("label", params.label);
    if (params.buyDateFrom) queryParams.append("buyDateFrom", format(params.buyDateFrom, "yyyy-MM-dd"));
    if (params.buyDateTo) queryParams.append("buyDateTo", format(params.buyDateTo, "yyyy-MM-dd"));
    if (params.sellingDateFrom) queryParams.append("sellingDateFrom", format(params.sellingDateFrom, "yyyy-MM-dd"));
    if (params.sellingDateTo) queryParams.append("sellingDateTo", format(params.sellingDateTo, "yyyy-MM-dd"));
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
    sellingStatus: [],
    buyPlace: "",
    sellingPlace: "",
    label: "",
    buyDateFrom: null as Date | null,
    buyDateTo: null as Date | null,
    sellingDateFrom: null as Date | null,
    sellingDateTo: null as Date | null,
    netBuyPriceMin: null as number | null,
    netBuyPriceMax: null as number | null,
    netSellingPriceMin: null as number | null,
    netSellingPriceMax: null as number | null,
    marginMin: null as number | null,
    marginMax: null as number | null,
};

const LiteVinylesTable = () => {
    const router = useRouter();
    const { data: filtersInit, isLoading: isLoadingFiltersInit } = useTableFiltersValues();
    const [filters, setFilters] = useState({ ...defaultFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...defaultFilters });

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);

    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["vinyles", { ...appliedFilters, page, size, sortBy, sortDirection }],
        queryFn: () => fetchVinyles({ ...appliedFilters, page, size, sortBy, sortDirection }),
        keepPreviousData: true,
    });

    const handleSort = (column: string) => {
        if (sortBy !== column) {
            setSortBy(column);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else if (sortDirection === 'desc') {
            setSortBy(null);
            setSortDirection(null);
        }
    };

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
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    if (isError) return <div className="p-4 text-red-600">Erreur lors du chargement.</div>;
    if (!data || !filtersInit) return null;

    const rows = data.content;
    const pagination = data.pagination;

    return (
        <div className="p-4 space-y-6">
            <VinyleFiltersForm
                filters={filters}
                onChange={handleChange}
                onDateChange={handleDateChange}
                filtersInit={filtersInit}
            />

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
            </div>

            {isFetching && (
                <div className="text-center text-sm text-muted-foreground animate-pulse">
                    Mise à jour...
                </div>
            )}

            <VinyleTablePagination
                pagination={pagination}
                page={page}
                setPage={setPage}
                size={size}
                setSize={setSize}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Support</TableHead>
                            <TableHead>Artiste</TableHead>
                            <TableHead>Titre</TableHead>
                            <TableHead>Pressage</TableHead>
                            <TableHead>État</TableHead>
                            <TableHead>Scan</TableHead>
                            <TableHead>Frais</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Réf</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Vente</TableHead>
                            <TableHead>Marge</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Acheté le</TableHead>
                            <TableHead>Vendu le</TableHead>
                            <TableHead>Lieu achat</TableHead>
                            <TableHead>Lieu vente</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((disk: any) => (
                            <TableRow
                                key={disk.id}
                                onClick={() => {
                                    const artistUrl = encodeURIComponent(disk.artist.replace(/\s+/g, "-").replace(/["']/g, ""));
                                    const titleUrl = encodeURIComponent(disk.title.replace(/\s+/g, "-").replace(/["']/g, ""));
                                    router.push(`/detail/${disk.id}-${artistUrl}-${titleUrl}`);
                                }}
                                className="cursor-pointer hover:bg-muted"
                            >
                                <TableCell>{disk.support}</TableCell>
                                <TableCell>{disk.artist}</TableCell>
                                <TableCell>{disk.title}</TableCell>
                                <TableCell>{disk.countryYear}</TableCell>
                                <TableCell>{disk.diskCondition}</TableCell>
                                <TableCell>{disk.scanStatus}</TableCell>
                                <TableCell>{disk.buyDeliveryFees}</TableCell>
                                <TableCell>{disk.sellingStatus}</TableCell>
                                <TableCell>{disk.ref}</TableCell>
                                <TableCell>{disk.netBuyPrice}</TableCell>
                                <TableCell>{disk.netSellingPrice ?? "-"}</TableCell>
                                <TableCell>{disk.margin ?? "-"}</TableCell>
                                <TableCell>{disk.label ?? "-"}</TableCell>
                                <TableCell>{disk.buyDate ? format(new Date(disk.buyDate), "dd/MM/yyyy") : "-"}</TableCell>
                                <TableCell>{disk.sellingDate ? format(new Date(disk.sellingDate), "dd/MM/yyyy") : "-"}</TableCell>
                                <TableCell>{disk.buyPlace ?? "-"}</TableCell>
                                <TableCell>{disk.sellingPlace ?? "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <VinyleTablePagination
                pagination={pagination}
                page={page}
                setPage={setPage}
                size={size}
                setSize={setSize}
            />
        </div>
    );
};

export default LiteVinylesTable;
