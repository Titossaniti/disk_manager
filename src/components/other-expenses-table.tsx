"use client"

import React from "react"
import {OtherBuy, OtherBuyForm, otherBuyFormSchema, OtherBuyResponse} from "@/schema/otherBuy"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"
import { Euro } from "lucide-react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type Props = {
    expenses: OtherBuyResponse
    loading: boolean
    editMode: boolean
    updatedRows: Record<number, Partial<OtherBuy>>
    onUpdateRow: (id: number, data: Partial<OtherBuy>) => void
    onDelete: (id: number) => void
    onAddNew: (data: OtherBuyForm) => void
}

export function OtherExpensesTable({
                                       expenses,
                                       loading,
                                       editMode,
                                       updatedRows,
                                       onUpdateRow,
                                       onDelete,
                                       onAddNew,
                                   }: Props) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<OtherBuyForm>({
        resolver: zodResolver(otherBuyFormSchema),
        defaultValues: {
            buyDate: new Date().toISOString().split("T")[0],
        },
    })


    return (
        <Card className="p-4">
            {loading ? (
                <Skeleton className="w-full h-[200px]" />
            ) : (
                <div className="overflow-x-auto">
                    {expenses?.totals && (
                        <div className="mb-4">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm font-medium text-muted-foreground">
                                <div className="bg-muted px-4 py-2 rounded-md w-full sm:w-auto text-center sm:text-left">
                                    Total achats : <span className="text-foreground">{expenses.totals.totalBuyPrice.toFixed(2)} €</span>
                                </div>
                                <div className="bg-muted px-4 py-2 rounded-md w-full sm:w-auto text-center sm:text-left">
                                    Avec frais : <span className="text-foreground">{expenses.totals.totalBuyPriceWithFees.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <Table>
                        <TableHeader className="bg-muted/80">
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead><div className="flex items-center gap-1">Prix <Euro size={14}/></div></TableHead>
                                <TableHead><div className="flex items-center gap-1">Frais <Euro size={14}/></div></TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Catégorie</TableHead>
                                {editMode && <TableHead className="text-center">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>

                        <TableBody>

                            {expenses?.content?.map((e) => {
                                const updated = updatedRows[e.id] ?? {}
                                return (
                                    <TableRow key={e.id}>
                                        <TableCell className="capitalize">
                                            {editMode ? (
                                                <Input
                                                    defaultValue={updated.name ?? e.name}
                                                    onChange={(ev) => onUpdateRow(e.id, { name: ev.target.value })}
                                                />
                                            ) : (
                                                e.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editMode ? (
                                                <Input type="number" defaultValue={updated.buyPrice ?? e.buyPrice} onChange={(ev) => {
                                                    const value = ev.target.value
                                                    const num = value === "" ? 0 : parseFloat(value)
                                                    onUpdateRow(e.id, { buyPrice: num })
                                                }} />
                                            ) : `${Number(updated.buyPrice ?? e.buyPrice ?? 0).toFixed(2)}`}
                                        </TableCell>
                                        <TableCell>
                                            {editMode ? (
                                                <Input type="number" defaultValue={updated.buyFees ?? e.buyFees ?? 0} onChange={(ev) => {
                                                    const value = ev.target.value
                                                    const num = value === "" ? 0 : parseFloat(value)
                                                    onUpdateRow(e.id, { buyFees: num })
                                                }} />
                                            ) : `${Number(updated.buyFees ?? e.buyFees ?? 0).toFixed(2)}`}
                                        </TableCell>
                                        <TableCell>
                                            {editMode ? (
                                                <DateTimePicker
                                                    granularity="day"
                                                    locale={fr}
                                                    displayFormat={{ hour24: "PPP" }}
                                                    value={updated.buyDate ? new Date(updated.buyDate) : new Date(e.buyDate)}
                                                    onChange={(d) => onUpdateRow(e.id, { buyDate: d?.toISOString().split("T")[0] })}
                                                />
                                            ) : format(parseISO(e.buyDate), "dd MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {editMode ? (
                                                <Input defaultValue={updated.category ?? e.category} onChange={(ev) => onUpdateRow(e.id, { category: ev.target.value })} />
                                            ) : e.category}
                                        </TableCell>
                                        {editMode && (
                                            <TableCell className="text-center">
                                                <Button size="sm" variant="destructive" onClick={() => onDelete(e.id)}>Supprimer</Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )
                            })}

                            {editMode && (
                                <TableRow className="bg-muted/20">
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Input {...register("name")} placeholder="Nom" />
                                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Input type="number" step="0.01" {...register("buyPrice")} placeholder="Prix" />
                                            {errors.buyPrice && <p className="text-xs text-destructive">{errors.buyPrice.message}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Input type="number" step="0.01" {...register("buyFees")} placeholder="Frais" />
                                            {errors.buyFees && <p className="text-xs text-destructive">{errors.buyFees.message}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <DateTimePicker
                                                granularity="day"
                                                locale={fr}
                                                displayFormat={{ hour24: "PPP" }}
                                                value={watch("buyDate") ? new Date(watch("buyDate")) : new Date()}
                                                onChange={(d) => setValue("buyDate", d?.toISOString().split("T")[0] || "")}
                                            />
                                            {errors.buyDate && <p className="text-xs text-destructive">{errors.buyDate.message}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Input {...register("category")} placeholder="Catégorie" />
                                            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            onClick={handleSubmit((data) => {
                                                onAddNew(data)
                                                reset({ buyDate: new Date().toISOString().split("T")[0] })
                                            })}
                                        >
                                            Ajouter
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    )
}