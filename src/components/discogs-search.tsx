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

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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
                        // per_page: 8,
                    },
                });

                setResults(res.data.results);
                setOpen(true);
            } catch (error) {
                setResults([]);
                setOpen(false);
            } finally {
                setIsLoading(false);
            }
        };

        searchDiscogs();
    }, [debouncedQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
                if (selectedText) {
                    setQuery(selectedText);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedText]);

    const handleReset = () => {
        setQuery("");
        setSelectedText("");
        setResults([]);
        setOpen(false);
        inputRef.current?.focus();
        onReset?.();
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    placeholder="Rechercher un disque"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setOpen(true);
                    }}
                />
                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 px-1">
                        <Loader2 className="animate-spin w-4 h-4" />
                    </div>
                )}
                {selectedText && (
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-96 overflow-auto">
                    <Command>
                        <CommandEmpty>Aucun résultat</CommandEmpty>
                        <CommandGroup>
                            {results.map((r) => (
                                <CommandItem
                                    key={r.id}
                                    onSelect={() => {
                                        onSelect(r.id);
                                        const label = `${r.title} (${r.year || "?"}, ${r.label?.[0] || "?"})`;
                                        setQuery(label);
                                        setSelectedText(label);
                                        setOpen(false);
                                        inputRef.current?.blur();
                                    }}
                                    className="flex gap-3 items-center px-2 py-2"
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
                                    <div className="flex flex-col text-left">
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
        </div>
    );
};
