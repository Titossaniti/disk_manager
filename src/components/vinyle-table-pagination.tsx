"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface VinyleTablePaginationProps {
    pagination: {
        page: number;
        totalPages: number;
        first: boolean;
        last: boolean;
    };
    page: number;
    setPage: (page: number) => void;
    size: number;
    setSize: (size: number) => void;
}

export function VinyleTablePagination({
                                          pagination,
                                          page,
                                          setPage,
                                          size,
                                          setSize,
                                      }: VinyleTablePaginationProps) {
    return (
        <div className="flex flex-col items-center justify-between gap-4 pt-4 md:flex-row">
            <Pagination>
                <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage(Math.max(page - 1, 0))}
                            className={pagination.first ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>

                    {Array.from({ length: pagination.totalPages }, (_, index) => {
                        if (
                            index === 0 ||
                            index === pagination.totalPages - 1 ||
                            Math.abs(index - pagination.page) <= 1
                        ) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        isActive={index === pagination.page}
                                        onClick={() => setPage(index)}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        }
                        if (
                            (index === 1 && pagination.page > 2) ||
                            (index === pagination.totalPages - 2 && pagination.page < pagination.totalPages - 3)
                        ) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        return null;
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage(page + 1)}
                            className={pagination.last ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            <div className="w-[100px]">
                <Select
                    value={size.toString()}
                    onValueChange={(value) => {
                        setSize(Number(value));
                        setPage(0);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Taille" />
                    </SelectTrigger>
                    <SelectContent>
                        {[50, 100, 150, 200].map((val) => (
                            <SelectItem key={val} value={val.toString()}>
                                {val}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
