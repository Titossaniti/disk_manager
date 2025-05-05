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

const sliderFields = [
    { name: "netBuyPrice", label: "Prix achat (€)" },
    { name: "netSellingPrice", label: "Prix vente (€)" },
    { name: "margin", label: "Marge (€)" },
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
    const supports = filtersInit.supports ?? [];
    const sellingStatuses = filtersInit.sellingStatuses ?? [];
    // const diskConditions = filtersInit.diskConditions ?? [];
    // const labels = filtersInit.labels ?? [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-lg shadow p-4 bg-muted">
            <div className="space-y-1">
                <Label htmlFor="artist">Artiste</Label>
                <Input id="artist" value={filters.artist} onChange={(e) => onChange("artist", e.target.value)}/>
                <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                        id="matchExactArtist"
                        checked={filters.matchExactArtist}
                        onCheckedChange={(checked) => onChange("matchExactArtist", checked)}
                    />
                    <Label htmlFor="matchExactArtist" className="text-sm">Rechercher uniquement ce titre exact</Label>
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" value={filters.title} onChange={(e) => onChange("title", e.target.value)}/>
                <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                        id="matchExactTitle"
                        checked={filters.matchExactTitle}
                        onCheckedChange={(checked) => onChange("matchExactTitle", checked)}
                    />
                    <Label htmlFor="matchExactTitle" className="text-sm">Rechercher uniquement ce titre exact</Label>
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="countryYear">Pressage</Label>
                <Input id="countryYear" value={filters.countryYear}
                       onChange={(e) => onChange("countryYear", e.target.value)}/>
            </div>

            <div className="space-y-1">
                <Label>Support</Label>
                <Select
                    value={filters.support || "__ALL__"}
                    onValueChange={(v) => onChange("support", v === "__ALL__" ? "" : v)}
                >
                    <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Tous"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__ALL__">Tous</SelectItem>
                        {supports.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="diskCondition">État disque</Label>
                <Input id="diskCondition" value={filters.diskCondition}
                       onChange={(e) => onChange("diskCondition", e.target.value)}/>
            </div>

            <div className={"relative space-y-1"} >
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
                    className="bg-input/30 hover:bg-input/50 hover:cursor-pointer h-[36px]"
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="buyPlace">Lieu d'achat</Label>
                <Input id="buyPlace" value={filters.buyPlace} onChange={(e) => onChange("buyPlace", e.target.value)}/>
            </div>

            <div className="space-y-1">
                <Label htmlFor="sellingPlace">Lieu de vente</Label>
                <Input id="sellingPlace" value={filters.sellingPlace}
                       onChange={(e) => onChange("sellingPlace", e.target.value)}/>
            </div>

            <div className="space-y-1">
                <Label htmlFor="sellingDateFrom">Vendu après</Label>
                <Input
                    type="date"
                    id="sellingDateFrom"
                    value={filters.sellingDateFrom ? format(filters.sellingDateFrom, "yyyy-MM-dd") : ""}
                    onChange={(e) => onDateChange("sellingDateFrom", e.target.value ? new Date(e.target.value) : null)}
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="sellingDateTo">Vendu avant</Label>
                <Input
                    type="date"
                    id="sellingDateTo"
                    value={filters.sellingDateTo ? format(filters.sellingDateTo, "yyyy-MM-dd") : ""}
                    onChange={(e) => onDateChange("sellingDateTo", e.target.value ? new Date(e.target.value) : null)}
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="label">Label</Label>
                <Input id="label" value={filters.label} onChange={(e) => onChange("label", e.target.value)}/>
            </div>

            {sliderFields.map(({name, label}) => (
                <div key={name} className="col-span-1 md:col-span-2 space-y-2">
                    <Label>{label}</Label>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="1"
                                className="w-28"
                                value={filters[`${name}Min`] !== null && filters[`${name}Min`] !== undefined
                                    ? filters[`${name}Min`]
                                    : ""}
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
                                value={filters[`${name}Max`] !== null && filters[`${name}Max`] !== undefined
                                    ? filters[`${name}Max`]
                                    : ""}
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
    );
};
