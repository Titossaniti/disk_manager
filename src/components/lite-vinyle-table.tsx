"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";

import { VinyleFiltersForm } from "./vinyle-filter-form";
import { VinyleTablePagination } from "@/components/vinyle-table-pagination";
import EditableInputCell from "@/components/editable-input-cell";
import EditableNumberCell from "@/components/editable-number-cell";
import EditableSelectCell from "@/components/editable-select-cell";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useTableFiltersValues } from "@/hooks/table-filters-values";
import { CircleCheckBig, CircleSlash, Euro } from "lucide-react";

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

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vinyles/lite?${queryParams}`, {
        withCredentials: true,
    });
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

const LiteVinylesTable = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [editableMode, setEditableMode] = useState(false);
    useEffect(() => {
        const isEditMode = searchParams.get("edit") === "true";
        setEditableMode(isEditMode);
    }, [searchParams]);

    const { data: filtersInit } = useTableFiltersValues();
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

    const toggleEditMode = () => {
        const newMode = !editableMode;
        const params = new URLSearchParams(window.location.search);
        if (newMode) {
            params.set("edit", "true");
        } else {
            params.delete("edit");
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.replace(newUrl);
    };

    const handleSort = (column: string) => {
        if (sortBy !== column) {
            setSortBy(column);
            setSortDirection("asc");
        } else if (sortDirection === "asc") {
            setSortDirection("desc");
        } else {
            setSortBy(null);
            setSortDirection(null);
        }
    };

    const handleChange = (name: string, value: any) => setFilters((prev) => ({ ...prev, [name]: value }));
    const handleDateChange = (name: string, date: Date | null) => setFilters((prev) => ({ ...prev, [name]: date }));
    const applyFilters = () => { setPage(0); setAppliedFilters({ ...filters }); };
    const resetFilters = () => { setPage(0); setFilters({ ...defaultFilters }); setAppliedFilters({ ...defaultFilters }); };

    if (isLoading) return <Skeleton className="h-40 w-full" />;
    if (isError || !data || !filtersInit) return <div className="p-4 text-red-600">Erreur lors du chargement.</div>;

    const rows = data.content;
    const pagination = data.pagination;

    const sellingStatusBadgeColor = (status: string) => {
        switch (status) {
            case "vendu": return "bg-green-700 text-zinc";
            case "en vente": return "bg-emerald-900 text-zinc";
            case "pas encore en vente": return "bg-orange-400 text-zinc";
            case "à mettre en vente": return "bg-red-800 text-zinc";
            default: return "bg-muted text-zinc";
        }
    };

    const renderScanStatus = (status: string | null | undefined) => {
        if (!status || status.trim() === "") return <CircleSlash size={16} className="text-destructive" />;
        if (status.toLowerCase() === "ok") return <CircleCheckBig className="text-green-700" size={16} />;
        return <Badge className="bg-yellow-500 text-black">{status}</Badge>;
    };

    return (
        <div className="p-4 space-y-6">
            <VinyleFiltersForm filters={filters} onChange={handleChange} onDateChange={handleDateChange}
                               filtersInit={filtersInit}/>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
            </div>

            {isFetching &&
                <p className="text-center text-sm text-muted-foreground animate-pulse">Mise à jour du tableau...</p>}

            <VinyleTablePagination pagination={pagination} page={page} setPage={setPage} size={size} setSize={setSize}/>

            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {editableMode ? "Mode édition activé" : "Mode lecture seule"}
                </div>
                <Button variant="outline" onClick={toggleEditMode} className={"cursor-pointer"}>
                    {editableMode ? "Désactiver l'édition" : "Activer l'édition"}
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => handleSort("support")} className="cursor-pointer">
                                Support {sortBy === 'support' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("artist")} className="cursor-pointer">
                                Artiste {sortBy === 'artist' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("title")} className="cursor-pointer">
                                Titre {sortBy === 'title' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("sellingStatus")} className="cursor-pointer">
                                Statut {sortBy === 'sellingStatus' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("label")} className="cursor-pointer">
                                Label {sortBy === 'label' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("ref")} className="cursor-pointer">
                                Réf {sortBy === 'ref' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("countryYear")} className="cursor-pointer">
                                Pressage {sortBy === 'countryYear' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("diskCondition")} className="cursor-pointer">
                                État {sortBy === 'diskCondition' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("scanStatus")} className="cursor-pointer">
                                Scan {sortBy === 'scanStatus' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("netBuyPrice")} className="cursor-pointer">
                                <div className="flex items-center gap-1">
                                    Achat <Euro size={14}/>
                                    {sortBy === 'netBuyPrice' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("netSellingPrice")} className="cursor-pointer">
                                <div className="flex items-center gap-1">
                                    Vente <Euro size={14}/>
                                    {sortBy === 'netSellingPrice' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("margin")} className="cursor-pointer">
                                <div className="flex items-center gap-1">
                                    Marge <Euro size={14}/>
                                    {sortBy === 'margin' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("buyDate")} className="cursor-pointer">
                                Date achat {sortBy === 'buyDate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("sellingDate")} className="cursor-pointer">
                                Date vente {sortBy === 'sellingDate' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("buyPlace")} className="cursor-pointer">
                                Lieu achat {sortBy === 'buyPlace' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                            <TableHead onClick={() => handleSort("sellingPlace")} className="cursor-pointer">
                                Lieu vente {sortBy === 'sellingPlace' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rows.map((disk: any) => (
                            <TableRow
                                key={disk.id}
                                onClick={
                                    !editableMode
                                        ? () => {
                                            const artistUrl = encodeURIComponent(disk.artist?.replace(/\s+/g, "-").replace(/["']/g, ""));
                                            const titleUrl = encodeURIComponent(disk.title?.replace(/\s+/g, "-").replace(/["']/g, ""));
                                            router.push(`/detail/${disk.id}-${artistUrl}-${titleUrl}`);
                                        }
                                        : undefined
                                }
                                className={editableMode ? "" : "cursor-pointer hover:bg-muted"}
                            >
                                <TableCell>
                                    {editableMode
                                        ? <EditableSelectCell initialValue={disk.support} field="support" id={disk.id}
                                                              options={filtersInit.supports}/>
                                        : disk.support}
                                </TableCell>

                                <TableCell className="max-w-[120px]">
                                    {editableMode ? (
                                        <EditableInputCell initialValue={disk.artist} field="artist" id={disk.id}/>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="truncate">{disk.artist}</div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <span>{disk.artist}</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </TableCell>

                                <TableCell className="max-w-[180px]">
                                    {editableMode ? (
                                        <EditableInputCell initialValue={disk.title} field="title" id={disk.id}/>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="truncate">{disk.title}</div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <span>{disk.title}</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ? <EditableSelectCell initialValue={disk.sellingStatus} field="sellingStatus"
                                                              id={disk.id} options={filtersInit.sellingStatuses}/>
                                        : <Badge
                                            className={sellingStatusBadgeColor(disk.sellingStatus)}>{disk.sellingStatus}</Badge>}
                                </TableCell>

                                <TableCell className="max-w-[160px]">
                                    {editableMode ? (
                                        <EditableInputCell initialValue={disk.label} field="label" id={disk.id}/>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="truncate">{disk.label}</div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <span>{disk.label}</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ? <EditableInputCell initialValue={disk.ref} field="ref" id={disk.id}/>
                                        : disk.ref}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ? <EditableInputCell initialValue={disk.countryYear} field="countryYear"
                                                             id={disk.id}/>
                                        : disk.countryYear}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ? <EditableInputCell initialValue={disk.diskCondition} field="diskCondition"
                                                             id={disk.id}/>
                                        : disk.diskCondition}
                                </TableCell>

                                <TableCell>{renderScanStatus(disk.scanStatus)}</TableCell>

                                <TableCell>
                                    {editableMode
                                        ? <EditableNumberCell initialValue={disk.netBuyPrice} field="netBuyPrice"
                                                              id={disk.id}/>
                                        : disk.netBuyPrice}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ?
                                        <EditableNumberCell initialValue={disk.netSellingPrice} field="netSellingPrice"
                                                            id={disk.id}/>
                                        : disk.netSellingPrice}
                                </TableCell>

                                <TableCell>{disk.margin}</TableCell>

                                <TableCell>{format(new Date(disk.buyDate), "dd/MM/yyyy")}</TableCell>

                                <TableCell>
                                    {disk.sellingDate
                                        ? format(new Date(disk.sellingDate), "dd/MM/yyyy")
                                        : <CircleSlash size={16} color="#90A1B9"/>}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ?
                                        <EditableInputCell initialValue={disk.buyPlace} field="buyPlace" id={disk.id}/>
                                        : disk.buyPlace}
                                </TableCell>

                                <TableCell>
                                    {editableMode
                                        ? <EditableInputCell initialValue={disk.sellingPlace} field="sellingPlace"
                                                             id={disk.id}/>
                                        : disk.sellingPlace}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </div>

            <VinyleTablePagination pagination={pagination} page={page} setPage={setPage} size={size} setSize={setSize}/>
        </div>
    );
};

export default LiteVinylesTable;