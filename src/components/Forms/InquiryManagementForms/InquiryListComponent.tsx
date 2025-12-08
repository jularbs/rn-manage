//TODOS: implement pagination
"use client"
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@/components/ui/table"

import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import { fetcher } from "@/actions/swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, useEffect, useState } from "react";
//Pagination and Popover components
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EyeIcon, Search, Trash, XIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { IMessage } from "@/types/message";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import RemoveInquiryComponent from "./RemoveInquiryComponent";
const InquiryListComponent = () => {
    const token = getCookie("token")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchInput, setSearchInput] = useState("")

    //Pagination states
    const [totalPages, setTotalPages] = useState(0);
    const [activePageInput, setActivePageInput] = useState<number>(1);
    const [activePage, setActivePage] = useState(1);
    const [limit] = useState(10);

    const { data, isLoading } = useSWR({
        url: "v1/messages",
        params: { search: searchQuery, page: activePage, limit },
        token
    }, fetcher)

    const [removeOpen, setRemoveOpen] = useState<boolean>(false)
    const [currentId, setCurrentId] = useState("")


    const showData = () => {
        if (isLoading)
            return new Array(limit).fill(0).map((item, key) => {
                return <TableRow key={key}>
                    <TableCell>
                        <Skeleton className="w-50 h-6" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="w-full h-6" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="w-50 h-6" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="w-50 h-6" />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Skeleton className="w-10 h-6" />
                            <Skeleton className="w-10 h-6" />
                        </div>
                    </TableCell>
                </TableRow>
            })

        if (!isLoading && data) {
            return data?.data?.map((item: Partial<IMessage>, key: Key) => {
                return <TableRow className={cn(item.status === "unread" && "font-bold")} key={key}>
                    <TableCell>
                        {item.fullName}
                    </TableCell>
                    <TableCell
                        className={"max-w-[450px] truncate"}
                    >
                        <Link href={`/dashboard/inquiry-management/${item._id}`}>{item.excerpt}</Link>
                    </TableCell>
                    <TableCell>
                        {item.stationId.name}
                    </TableCell>
                    <TableCell>
                        {item.createdAt && format(new Date(item.createdAt), "PPP p")}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Link href={`/dashboard/inquiry-management/${item._id}`}>
                                <Button size="icon"><EyeIcon /></Button>
                            </Link>
                            <Button variant="destructive" size="icon"
                                onClick={() => {
                                    setCurrentId(item._id);
                                    setRemoveOpen(true);
                                }}
                            ><Trash /></Button>
                        </div>
                    </TableCell>
                </TableRow>
            })
        }
    }

    //Pagination Handlers
    useEffect(() => {
        if (data) {
            if (data.pagination.totalPages) {
                setTotalPages(data.pagination.totalPages);
            } else {
                setTotalPages(0);
            }
        }
    }, [data, limit])

    const pageSelector = () => {
        if (activePageInput < 1 || activePageInput > totalPages) {
            return;
        }
        setActivePage(activePageInput);
    }

    const showPagination = () => {
        return (
            <div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem className="cursor-pointer">
                            <PaginationPrevious onClick={() => {
                                if (activePage - 1 < 1) return;
                                setActivePage(activePage - 1);
                            }} />
                        </PaginationItem>

                        {activePage > 2 &&
                            <PaginationItem>
                                <PaginationLink href="#" onClick={() => {
                                    if (activePage - 1 < 1) return;
                                    setActivePage(1);
                                }}>1</PaginationLink>
                            </PaginationItem>
                        }

                        {totalPages > 3 && activePage > 3 &&
                            <Popover>
                                <PopoverTrigger>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <form action={pageSelector}>
                                        <div className="flex items-center gap-2">
                                            <span className="whitespace-nowrap">Go to</span>
                                            <Input type="number" min={1} max={totalPages} onChange={(e) => setActivePageInput(Number(e.target.value))} />
                                            <Button size={"icon"} type="submit">Go</Button>
                                        </div>
                                    </form>
                                </PopoverContent>
                            </Popover>
                        }

                        {activePage !== 1 &&
                            <PaginationItem>
                                <PaginationLink href="#" onClick={() => {
                                    if (activePage - 1 < 1) return;
                                    setActivePage(activePage - 1);
                                }}>{activePage - 1}</PaginationLink>
                            </PaginationItem>
                        }
                        <PaginationItem>
                            <PaginationLink href="#" isActive>{activePage}</PaginationLink>
                        </PaginationItem>
                        {activePage < totalPages &&
                            <PaginationItem>
                                <PaginationLink href="#" onClick={() => {
                                    if (activePage + 1 > totalPages) return;
                                    setActivePage(activePage + 1);
                                }}>{activePage + 1}</PaginationLink>
                            </PaginationItem>}

                        {totalPages > 3 && activePage < totalPages - 2 &&
                            <Popover>
                                <PopoverTrigger>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <form action={pageSelector}>
                                        <div className="flex items-center gap-2">

                                            <span className="whitespace-nowrap">Go to</span>
                                            <Input type="number" min={1} max={totalPages} onChange={(e) => setActivePageInput(Number(e.target.value))} />
                                            <Button size={"icon"} type="submit">Go</Button>
                                        </div>
                                    </form>
                                </PopoverContent>
                            </Popover>
                        }

                        {totalPages > 3 && activePage < totalPages - 1 &&
                            <PaginationItem>
                                <PaginationLink href="#" onClick={() => {
                                    setActivePage(totalPages);
                                }}>{totalPages}</PaginationLink>
                            </PaginationItem>
                        }

                        <PaginationItem className="cursor-pointer">
                            <PaginationNext onClick={() => {
                                if (activePage + 1 > totalPages) return;
                                setActivePage(activePage + 1);
                            }} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    }

    return <>
        <RemoveInquiryComponent messageId={currentId} open={removeOpen} onOpenChange={setRemoveOpen} swrKey={{ url: "v1/messages", params: { search: searchQuery, page: activePage, limit }, token }} />
        <div className="grow-0">
            <Card className="p-0 !gap-0">
                <CardContent className="p-0">
                    <form action={() => { setSearchQuery(searchInput) }}>
                        <div className="flex w-full p-2">
                            <Input className="mr-1" placeholder="Search Inquiries..." onChange={(e) => setSearchInput(e.target.value)} />
                            {/* <Button size="icon"
                                type="button"
                                className="mr-1 border-neutral-300 bg-neutral-300 text-neutral-900 hover:bg-neutral-100"
                                onClick={() => {
                                    setFilterDialogOpen(true)
                                }}>
                                <SlidersHorizontal />
                            </Button> */}
                            <Button size="icon" type="submit">
                                <Search />
                            </Button>
                        </div>
                    </form>

                    <div className="px-2 mb-2">
                        {searchQuery && <Badge className="cursor-pointer mr-1" onClick={() => {
                            setSearchQuery("");
                            setSearchInput("");
                            setActivePage(1);
                        }}>
                            {searchQuery} <XIcon />
                        </Badge>}

                    </div>
                    <div className="flex">
                        {data && data.data.length === 0 ?
                            <p className="p-5 text-center w-full font-bold">No inquiries found</p>
                            :
                            <div className="w-0 px-2 grow overflow-x-auto">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Station</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableBody>
                                    <TableBody>
                                        {showData()}
                                    </TableBody>
                                </Table>
                            </div>
                        }

                    </div>

                </CardContent>
                {data && data.data.length > 0 && (
                    <CardFooter className="p-2 justify-center">
                        {showPagination()}
                    </CardFooter>
                )}
            </Card>
        </div>
    </>
}

export default InquiryListComponent;