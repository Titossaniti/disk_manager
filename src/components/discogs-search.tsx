"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDebounce } from "use-debounce";
import {
    Command,
    CommandItem,
    CommandEmpty,
    CommandGroup,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";

type DiscogsResult = {
    id: number;
    title: string;
    year?: string;
    country?: string;
    label?: string[];
    catno?: string;
    thumb?: string;
    formats?: { name: string; descriptions?: string[] }[];
    genre?: string[];
    style?: string[];
    uri?: string;
};

type Props = {
    onSelect: (releaseId: number) => void;
    onReset?: () => void;
};

export const DiscogsSearch = ({ onSelect, onReset }: Props) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 400);
    const [results, setResults] = useState<DiscogsResult[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [selectedDisc, setSelectedDisc] = useState<DiscogsResult | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasSelected, setHasSelected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const searchDiscogs = async () => {
            if (debouncedQuery.length < 3) {
                setResults([]);
                setOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const res = await axios.get("https://api.discogs.com/database/search", {
                    params: {
                        q: debouncedQuery,
                        type: "release",
                        token: process.env.NEXT_PUBLIC_DISCOGS_TOKEN,
                    },
                });

                setResults(res.data.results);
                if (!hasSelected) {
                    setOpen(true);
                }
            } catch (error) {
                setResults([]);
                setOpen(false);
            } finally {
                setIsLoading(false);
            }
        };

        searchDiscogs();
    }, [debouncedQuery, hasSelected]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (r: DiscogsResult) => {
        onSelect(r.id);
        const label = `${r.title} (${r.year || "?"}, ${r.label?.[0] || "?"})`;
        setQuery(label);
        setSelectedText(label);
        setSelectedDisc(r);
        setOpen(false);
        setHasSelected(true);
    };

    const handleReset = () => {
        setQuery("");
        setSelectedText("");
        setResults([]);
        setOpen(false);
        setSelectedDisc(null);
        setHasSelected(false);
        inputRef.current?.focus();
        onReset?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setHasSelected(false);
    };

    const handleInputFocus = () => {
        if (!hasSelected && results.length > 0 && query.length >= 3) {
            setOpen(true);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    placeholder="Rechercher un disque"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                />
                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 px-1">
                        <Loader2 className="animate-spin w-4 h-4" />
                    </div>
                )}
                {(selectedText || hasSelected) && (
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-w-full rounded-md border bg-white shadow-md max-h-96 overflow-auto">
                    <Command>
                        <CommandEmpty>Aucun résultat</CommandEmpty>
                        <CommandGroup>
                            {results.map((r) => (
                                <CommandItem
                                    key={r.id}
                                    onSelect={() => handleSelect(r)}
                                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center px-2 py-2 cursor-pointer"
                                >
                                    {r.thumb && (
                                        <Image
                                            src={r.thumb}
                                            alt="cover"
                                            width={40}
                                            height={40}
                                            className="rounded"
                                        />
                                    )}
                                    <div className="flex flex-col text-left w-full">
                                        <span className="font-semibold">{r.title}</span>
                                        <span className="text-xs text-muted-foreground">
                      {r.label?.[0]} | {r.formats?.[0]?.name}{" "}
                                            {r.formats?.[0]?.descriptions?.join(", ")} | {r.year} |{" "}
                                            {r.country} | {r.catno}
                    </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </div>
            )}

            {selectedDisc && (
                <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        {selectedDisc.thumb && (
                            <Image
                                src={selectedDisc.thumb}
                                alt="cover"
                                width={100}
                                height={100}
                                className="rounded shadow-md w-full sm:w-[100px] h-auto object-contain"
                            />
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Titre</span>
                                <span className="mt-1">{selectedDisc.title}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Année</span>
                                <span className="mt-1">{selectedDisc.year || "—"}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Pays</span>
                                <span className="mt-1">{selectedDisc.country || "—"}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Label</span>
                                <span className="mt-1">{selectedDisc.label?.join(", ") || "—"}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Référence</span>
                                <span className="mt-1">{selectedDisc.catno || "—"}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Formats</span>
                                <span className="mt-1">
                  {selectedDisc.formats
                      ?.map((f) => `${f.name}${f.descriptions ? ` (${f.descriptions.join(", ")})` : ""}`)
                      .join(" / ") || "—"}
                </span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Genres</span>
                                <span className="mt-1">{selectedDisc.genre?.join(", ") || "—"}</span>
                            </div>

                            <div className="flex flex-col border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Styles</span>
                                <span className="mt-1">{selectedDisc.style?.join(", ") || "—"}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full sm:w-fit mt-4"
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() =>
                            window.open(`https://www.discogs.com${selectedDisc?.uri}`, "_blank")
                        }
                        rel="noopener noreferrer"
                    >
                        🌐 Voir sur Discogs
                    </Button>
                </div>
            )}
        </div>
    );
};