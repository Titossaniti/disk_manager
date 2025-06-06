// "use client";
//
// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { useDebounce } from "use-debounce";
// import {
//     Command,
//     CommandItem,
//     CommandEmpty,
//     CommandGroup,
// } from "@/components/ui/command";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { X, Loader2 } from "lucide-react";
//
// type DiscogsResult = {
//     id: number;
//     title: string;
//     year?: string;
//     country?: string;
//     label?: string[];
//     catno?: string;
//     thumb?: string;
//     formats?: { name: string; descriptions?: string[] }[];
// };
//
// type Props = {
//     onSelect: (releaseId: number) => void;
//     onReset?: () => void;
// };
//
// export const DiscogsSearch = ({ onSelect, onReset }: Props) => {
//     const [query, setQuery] = useState("");
//     const [debouncedQuery] = useDebounce(query, 400);
//     const [results, setResults] = useState<DiscogsResult[]>([]);
//     const [open, setOpen] = useState(false);
//     const [selectedText, setSelectedText] = useState("");
//
//     const inputRef = useRef<HTMLInputElement>(null);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const [isLoading, setIsLoading] = useState(false);
//
//     useEffect(() => {
//         const searchDiscogs = async () => {
//             if (debouncedQuery.length < 3) {
//                 setResults([]);
//                 setOpen(false);
//                 return;
//             }
//
//             setIsLoading(true);
//             try {
//                 const res = await axios.get("https://api.discogs.com/database/search", {
//                     params: {
//                         q: debouncedQuery,
//                         type: "release",
//                         token: process.env.NEXT_PUBLIC_DISCOGS_TOKEN,
//                         // per_page: 8,
//                     },
//                 });
//
//                 setResults(res.data.results);
//                 setOpen(true);
//             } catch (error) {
//                 setResults([]);
//                 setOpen(false);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//
//         searchDiscogs();
//     }, [debouncedQuery]);
//
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 containerRef.current &&
//                 !containerRef.current.contains(event.target as Node)
//             ) {
//                 setOpen(false);
//                 if (selectedText) {
//                     setQuery(selectedText);
//                 }
//             }
//         };
//
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, [selectedText]);
//
//     const handleReset = () => {
//         setQuery("");
//         setSelectedText("");
//         setResults([]);
//         setOpen(false);
//         inputRef.current?.focus();
//         onReset?.();
//     };
//
//     return (
//         <div ref={containerRef} className="relative w-full">
//             <div className="flex items-center gap-2">
//                 <Input
//                     ref={inputRef}
//                     placeholder="Rechercher un disque"
//                     value={query}
//                     onChange={(e) => {
//                         setQuery(e.target.value);
//                     }}
//                     onFocus={() => {
//                         if (results.length > 0) setOpen(true);
//                     }}
//                 />
//                 {isLoading && (
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 px-1">
//                         <Loader2 className="animate-spin w-4 h-4" />
//                     </div>
//                 )}
//                 {selectedText && (
//                     <Button variant="ghost" size="icon" onClick={handleReset}>
//                         <X className="w-4 h-4" />
//                     </Button>
//                 )}
//             </div>
//
//             {open && results.length > 0 && (
//                 <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-96 overflow-auto">
//                     <Command>
//                         <CommandEmpty>Aucun résultat</CommandEmpty>
//                         <CommandGroup>
//                             {results.map((r) => (
//                                 <CommandItem
//                                     key={r.id}
//                                     onSelect={() => {
//                                         onSelect(r.id);
//                                         const label = `${r.title} (${r.year || "?"}, ${r.label?.[0] || "?"})`;
//                                         setQuery(label);
//                                         setSelectedText(label);
//                                         setOpen(false);
//                                         inputRef.current?.blur();
//                                     }}
//                                     className="flex gap-3 items-center px-2 py-2"
//                                 >
//                                     {r.thumb && (
//                                         <Image
//                                             src={r.thumb}
//                                             alt="cover"
//                                             width={40}
//                                             height={40}
//                                             className="rounded"
//                                         />
//                                     )}
//                                     <div className="flex flex-col text-left">
//                                         <span className="font-semibold">{r.title}</span>
//                                         <span className="text-xs text-muted-foreground">
//                                         {r.label?.[0]} | {r.formats?.[0]?.name}{" "}
//                                         {r.formats?.[0]?.descriptions?.join(", ")} | {r.year} |{" "}
//                                         {r.country} | {r.catno}
//                                         </span>
//                                     </div>
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </Command>
//                 </div>
//             )}
//         </div>
//     );
// };
///// AFFICHAGE DISQUE TOUTE INFO
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
    const preventReopenRef = useRef(false);
    const [selectedText, setSelectedText] = useState("");
    const [selectedDisc, setSelectedDisc] = useState<DiscogsResult | null>(null);

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
        setSelectedDisc(null);
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
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (!preventReopenRef.current && results.length > 0) {
                            setOpen(true);
                        }
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
                                        preventReopenRef.current = true;
                                        setOpen(false);
                                        const label = `${r.title} (${r.year || "?"}, ${r.label?.[0] || "?"})`;
                                        setQuery(label);
                                        setSelectedText(label);
                                        setSelectedDisc(r);
                                        inputRef.current?.blur();

                                        setTimeout(() => {
                                            preventReopenRef.current = false;
                                        }, 300);
                                    }}
                                    className="flex gap-3 items-center px-2 py-2 cursor-pointer"
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
            {selectedDisc && (
                <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
                    <div className="flex items-start gap-4">
                        {selectedDisc.thumb && (
                            <Image
                                src={selectedDisc.thumb}
                                alt="cover"
                                width={100}
                                height={100}
                                className="rounded shadow-md"
                            />
                        )}
                        <div className="flex flex-col gap-1">
                            <div className="text-lg font-semibold">{selectedDisc.title}</div>

                            <div className="text-muted-foreground">
                                <strong>Labels :</strong> {selectedDisc.label?.join(", ") || "—"}
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Pays / Année :</strong> {selectedDisc.country || "?"} / {selectedDisc.year || "?"}
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Référence (catno) :</strong> {selectedDisc.catno || "—"}
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Formats :</strong>{" "}
                                {selectedDisc.formats
                                    ?.map((f) => `${f.name}${f.descriptions ? " (" + f.descriptions.join(", ") + ")" : ""}`)
                                    .join(" / ") || "—"}
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Genres :</strong> {selectedDisc.genre?.join(", ") || "—"}
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Styles :</strong> {selectedDisc.style?.join(", ") || "—"}
                            </div>
                            {/*<div className="text-muted-foreground">*/}
                            {/*    <strong>Barcode?? :</strong><br />*/}
                            {/*    {selectedDisc.barcode?.length*/}
                            {/*        ? selectedDisc.barcode.map((b, i) => <div key={i}>• {b}</div>)*/}
                            {/*        : "—"}*/}
                            {/*</div>*/}
                            <Button
                                className="mt-2 w-fit"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    window.open(`https://www.discogs.com${selectedDisc.uri}`, "_blank")
                                }
                                rel="noopener noreferrer"
                            >
                                🌐 Voir sur Discogs
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
