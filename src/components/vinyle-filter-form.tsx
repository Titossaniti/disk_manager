"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import MultipleSelector from "@/components/ui/multiple-selector";
import {Euro} from "lucide-react";
import React from "react";
import {DateTimePicker} from "@/components/ui/datetime-picker";
import {fr} from "date-fns/locale";

const sliderFields = [
    { name: "netBuyPrice", label: "Prix achat" },
    { name: "netSellingPrice", label: "Prix vente" },
    { name: "margin", label: "Marge" },
];

export const VinyleFiltersForm = ({
                                      filters,
                                      onChange,
                                      onDateChange,
                                      filtersInit,
                                  }: {
    filters: any;
    onChange: (name: string, value: any) => void;
    onDateChange: (name: string, date: Date | null) => void;
    filtersInit: any;
}) => {
    const sellingStatuses = filtersInit.sellingStatuses ?? [];

    return (
        <div className="space-y-6 rounded-lg shadow p-4 bg-muted">

            {/* Ligne 1 : artiste - titre - pressage */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Artiste */}
                <div className="space-y-1">
                    <Label htmlFor="artist">Artiste</Label>
                    <Input id="artist" value={filters.artist} onChange={(e) => onChange("artist", e.target.value)} />
                    <div className="flex items-center gap-2 mt-1">
                        <Checkbox
                            id="matchExactArtist"
                            checked={filters.matchExactArtist}
                            onCheckedChange={(checked) => onChange("matchExactArtist", checked)}
                        />
                        <Label htmlFor="matchExactArtist" className="text-sm">Rechercher uniquement ce titre exact</Label>
                    </div>
                </div>

                {/* Titre */}
                <div className="space-y-1">
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" value={filters.title} onChange={(e) => onChange("title", e.target.value)} />
                    <div className="flex items-center gap-2 mt-1">
                        <Checkbox
                            id="matchExactTitle"
                            checked={filters.matchExactTitle}
                            onCheckedChange={(checked) => onChange("matchExactTitle", checked)}
                        />
                        <Label htmlFor="matchExactTitle" className="text-sm">Rechercher uniquement ce titre exact</Label>
                    </div>
                </div>

                {/* Pressage */}
                <div className="space-y-1">
                    <Label htmlFor="countryYear">Pressage</Label>
                    <Input id="countryYear" value={filters.countryYear} onChange={(e) => onChange("countryYear", e.target.value)} />
                </div>
            </div>

            {/* Ligne 2 : label - état du disque - statut de vente */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Label */}
                <div className="space-y-1">
                    <Label htmlFor="label">Label</Label>
                    <Input id="label" value={filters.label} onChange={(e) => onChange("label", e.target.value)} />
                </div>

                {/* État disque */}
                <div className="space-y-1">
                    <Label htmlFor="diskCondition">État disque</Label>
                    <Input id="diskCondition" value={filters.diskCondition} onChange={(e) => onChange("diskCondition", e.target.value)} />
                </div>

                {/* Statut de vente */}
                <div className="relative space-y-1">
                    <Label>Statuts de vente</Label>
                    <MultipleSelector
                        options={sellingStatuses.map((status) => ({
                            key: status,
                            label: status,
                            value: status,
                        }))}
                        value={filters.sellingStatus.map((v: string) => ({ label: v, value: v }))}
                        onChange={(values) => onChange("sellingStatus", values.map(v => v.value))}
                        placeholder={filters.sellingStatus.length === 0 ? "Tous" : ""}
                        hidePlaceholderWhenSelected
                        className="bg-white/80 dark:bg-input/70 hover:bg-input hover:cursor-pointer h-[36px]"
                    />
                </div>
            </div>

            {/* Ligne 2 : Informations d'achat */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor="buyPlace">Lieu d'achat</Label>
                    <Input id="buyPlace" value={filters.buyPlace}
                           onChange={(e) => onChange("buyPlace", e.target.value)}/>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="buyDateFrom">Acheté après</Label>
                    <DateTimePicker
                        granularity="day"
                        locale={fr}
                        displayFormat={{ hour24: "PPP" }}
                        value={filters.buyDateFrom}
                        onChange={(date) => onDateChange("buyDateFrom", date ?? null)}
                        placeholder="Choisir une date"
                        className="cursor-pointer"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="buyDateTo">Acheté avant</Label>
                    <DateTimePicker
                        granularity="day"
                        locale={fr}
                        displayFormat={{ hour24: "PPP" }}
                        value={filters.buyDateTo}
                        onChange={(date) => onDateChange("buyDateTo", date ?? null)}
                        placeholder="Choisir une date"
                        className="cursor-pointer"
                    />
                </div>
            </div>

            {/* Ligne 3 : Informations de vente */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor="sellingPlace">Lieu de vente</Label>
                    <Input id="sellingPlace" value={filters.sellingPlace}
                           onChange={(e) => onChange("sellingPlace", e.target.value)}/>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="sellingDateFrom">Vendu après</Label>
                    <DateTimePicker
                        granularity="day"
                        locale={fr}
                        displayFormat={{ hour24: "PPP" }}
                        value={filters.sellingDateFrom}
                        onChange={(date) => onDateChange("sellingDateFrom", date ?? null)}
                        placeholder="Choisir une date"
                        className="cursor-pointer"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="sellingDateTo">Vendu avant</Label>
                    <DateTimePicker
                        granularity="day"
                        locale={fr}
                        displayFormat={{ hour24: "PPP" }}
                        value={filters.sellingDateTo}
                        onChange={(date) => onDateChange("sellingDateTo", date ?? null)}
                        placeholder="Choisir une date"
                        className="cursor-pointer"
                    />
                </div>
            </div>

            {/* Ligne 4 : Prix / marge */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sliderFields.map(({name, label}) => (
                    <div key={name} className="space-y-2">
                        <Label>{label} <Euro size={14}/></Label>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    step="1"
                                    className="w-28"
                                    value={filters[`${name}Min`] ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                            onChange(`${name}Min`, null);
                                        } else if (/^\d*\.?\d*$/.test(value)) {
                                            onChange(`${name}Min`, value);
                                        }
                                    }}
                                    placeholder="Min"
                                />
                                <Slider
                                    value={[
                                        filters[`${name}Min`] ?? filtersInit[`${name}Min`] ?? 0,
                                        filters[`${name}Max`] ?? filtersInit[`${name}Max`] ?? 1500,
                                    ]}
                                    min={filtersInit[`${name}Min`] ?? 0}
                                    max={filtersInit[`${name}Max`] ?? 1500}
                                    step={1}
                                    onValueChange={([min, max]) => {
                                        onChange(`${name}Min`, min);
                                        onChange(`${name}Max`, max);
                                    }}
                                />
                                <Input
                                    type="number"
                                    step="1"
                                    className="w-28"
                                    value={filters[`${name}Max`] ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                            onChange(`${name}Max`, null);
                                        } else if (/^\d*\.?\d*$/.test(value)) {
                                            onChange(`${name}Max`, value);
                                        }
                                    }}
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
};
