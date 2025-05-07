"use client"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {ChevronsUpDown, Check, Loader2, Delete} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type ComboboxProps = {
    label: string
    fetchUrl: string
    value: string
    onValueChange: (v: string) => void
    strictList?: boolean
}

export function CustomCombobox({
                             label,
                             fetchUrl,
                             value,
                             onValueChange,
                             strictList = false,
                         }: ComboboxProps) {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState("")
    const [options, setOptions] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const cacheRef = useRef<Map<string, string[]>>(new Map())

    useEffect(() => {
        if (!input) return
        if (strictList && input.length < 3) return

        const key = `${fetchUrl}::${input.toLowerCase()}`
        if (cacheRef.current.has(key)) {
            setOptions(cacheRef.current.get(key) || [])
            return
        }

        const fetchOptions = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${fetchUrl}`, {
                    credentials: "include",
                })

                const text = await res.text()
                if (!text) {
                    setOptions([])
                    return
                }

                const data = JSON.parse(text)
                const filtered = data.filter((item: string) =>
                    item.toLowerCase().includes(input.toLowerCase())
                )

                cacheRef.current.set(key, filtered)
                setOptions(filtered)
            } catch (e) {
                console.error("Erreur chargement options:", e)
                setOptions([])
            } finally {
                setLoading(false)
            }
        }

        fetchOptions()
    }, [input, fetchUrl, strictList])

    return (
        <div className="relative w-[220px]">
            {value && (
                <button
                    type="button"
                    onClick={() => onValueChange("")}
                    className="absolute right-9 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-destructive"
                >
                    <Delete className="h-4 w-4" />
                </button>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", value && "pr-8")}
                    >
                        <span className="truncate max-w-[140px] text-left">
                            {value || label}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[220px] p-0">
                    <Command>
                        <CommandInput
                            placeholder={`Chercher ${label.toLowerCase()}...`}
                            value={input}
                            onValueChange={setInput}
                        />
                        <CommandList>
                            {loading && (
                                <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Chargement...
                                </div>
                            )}
                            <CommandEmpty>Aucun résultat.</CommandEmpty>
                            <CommandGroup>
                                {!strictList && input.length >= 3 && (
                                    <CommandItem onSelect={() => { onValueChange(input); setOpen(false) }}>
                                        {input}
                                        <Check className="ml-auto opacity-50" />
                                    </CommandItem>
                                )}
                                {options.map((option) => (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => {
                                            onValueChange(option)
                                            setOpen(false)
                                        }}
                                    >
                                        {option}
                                        {option === value && <Check className="ml-auto opacity-100" />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
