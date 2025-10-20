// TODOS: Check filters if applicable to API
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Film, Images, Newspaper, Search, SlidersHorizontal, Trash, XIcon } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ARTICLE_TYPE_BASIC, ARTICLE_TYPE_PHOTO, ARTICLE_TYPE_VIDEO } from "@/lib/constants";

//Date Picker Components
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { getCookie } from "typescript-cookie";
import { cn } from "@/lib/utils";

// import RemovePostComponent from "@/components/Forms/PostManagementForms/RemovePostComponent";
import Link from "next/link";

const PostListComponent = ({ preselectedTags, preselectedCategories }: { preselectedTags?: string[], preselectedCategories?: string[] }) => {
    const token = getCookie("token");
    const [skip, setSkip] = useState(0);
    const [limit,] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [tags, setTags] = useState<string[]>([]); //Use Slug of the tag
    const [categories, setCategories] = useState<string[]>([]); //Use Slug of the category
    const [removePostOpen, setRemovePostOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Record<string, string | undefined> | undefined>(undefined);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filters, setFilters] = useState<{
        keywords: string | undefined;
        status: string | undefined;
        startDate: string | undefined;
        endDate: string | undefined;
        type: string | undefined;
        author: string | undefined;
    }>({
        keywords: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        type: undefined,
        author: undefined,
    });
    const [activePage, setActivePage] = useState(1);
    const { data: userData, isLoading: isUserLoading } = useSWR(filterDialogOpen ? { url: "v1/users", params: { accountVerified: true }, token } : null, fetcher)

    const postSwrKey = {
        url: "v1/posts",
        params: {
            limit, skip, searchQuery,
            ...(tags.length > 0 && { tags: tags }),
            ...(categories.length > 0 && { category: categories }),
            author: filters.author ? filters.author : "",
            status: filters.status ? filters.status : "",
            postType: filters.type ? filters.type : "",
            startDate: filters.startDate ? filters.startDate : "",
            endDate: filters.endDate ? filters.endDate : "",
        },
        token
    };
    const { data, isLoading } = useSWR(postSwrKey, fetcher);

    useEffect(() => {
        if (preselectedTags) {
            setTags([...preselectedTags])
            setSkip(0);
            setActivePage(1)
        }

        if (preselectedCategories) {
            setCategories([...preselectedCategories])
            setSkip(0);
            setActivePage(1)
        }

    }, [preselectedTags, preselectedCategories]);

    const showData = () => {
        if (isLoading) return new Array(limit).fill(0).map((item, key) => {
            return <TableRow key={key}>
                <TableCell><Skeleton className="w-[67px] h-5" /></TableCell>
                <TableCell><Skeleton className="w-[350px] h-5" /></TableCell>
                <TableCell><Skeleton className="w-[100px] h-5" /></TableCell>
                <TableCell><Skeleton className="w-[100px] h-5" /></TableCell>
                <TableCell><Skeleton className="w-[90px] h-5" /></TableCell>
                <TableCell><Skeleton className="w-[100px] h-5" /></TableCell>
            </TableRow>
        })
        if (!data) return <TableRow><TableCell colSpan={6} className="text-center p-4">No posts found</TableCell></TableRow>;
        if (data.data && data.data.length === 0) {
            return <TableRow><TableCell colSpan={6} className="text-center p-4">No posts available</TableCell></TableRow>;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.data.map((item: any) => {
            return (
                <TableRow key={item._id}>
                    <TableCell className="text-right w-0">
                        <div className="flex items-center justify-between gap-2">
                            <Badge
                                className={cn(
                                    "grow uppercase text-[10px]",
                                    item.status === "published" ? "bg-green-100 text-green-800" : "bg-orange-300 text-orange-900")}
                                variant="outline">
                                {item.status === "published" ? "Published" : "Draft"}
                            </Badge>
                            {item.postType === ARTICLE_TYPE_VIDEO && <Film size={12} />}
                            {item.postType === ARTICLE_TYPE_BASIC && <Newspaper size={12} />}
                            {item.postType === ARTICLE_TYPE_PHOTO && <Images size={12} />}
                        </div>

                    </TableCell>
                    <TableCell className="text-left max-w-[400px] truncate pl-0">
                        <Link href={`/dashboard/post-management/manage-post?slug=${item.slug}`} className="cursor-pointer">
                            <span className="hover:underline">{item.title}</span>
                        </Link>
                    </TableCell>
                    <TableCell className="text-left">{item.author.fullName}</TableCell>
                    <TableCell className="text-left">{item.categories[0].name}</TableCell>
                    <TableCell className="text-left">{item.publishedAt ? format(new Date(item.publishedAt), "PP p") : "N/A"}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Link href={`/dashboard/post-management/manage-post?slug=${item.slug}`} className="cursor-pointer">
                                <Edit size={15} />
                            </Link>
                            <Trash size={15} onClick={() => {
                                setSelectedPost(item);
                                setRemovePostOpen(true);
                            }} />
                        </div>
                    </TableCell>
                </TableRow>
            );
        });
    }

    //Pagination Handlers
    const [totalPages, setTotalPages] = useState(0);
    const [activePageInput, setActivePageInput] = useState<number>(1);

    useEffect(() => {
        if (data) {
            if (data.count) {
                setTotalPages(Math.ceil(data.count / limit));
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
        setSkip((activePageInput - 1) * limit);
    }

    const showPagination = () => {
        return (
            <div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem className="cursor-pointer">
                            <PaginationPrevious onClick={() => {
                                if (skip - limit < 0) return;
                                setSkip(skip - limit)
                                setActivePage(activePage - 1);
                            }} />
                        </PaginationItem>

                        {activePage > 2 &&
                            <PaginationItem>
                                <PaginationLink href="#" onClick={() => {
                                    if (activePage - 1 < 1) return;
                                    setActivePage(1);
                                    setSkip(0);
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
                                    setSkip(skip - limit);
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
                                    setSkip(skip + limit);
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
                                    setSkip((totalPages - 1) * limit);
                                }}>{totalPages}</PaginationLink>
                            </PaginationItem>
                        }

                        <PaginationItem className="cursor-pointer">
                            <PaginationNext onClick={() => {
                                if (skip + limit >= data?.count) return;
                                setSkip(skip + limit)
                                setActivePage(activePage + 1);
                            }} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    }

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setSkip(0);
        setActivePage(1);
    }

    return <>
        {/* <RemovePostComponent post={selectedPost} open={removePostOpen} onOpenChange={setRemovePostOpen} swrKey={postSwrKey} /> */}
        <Card className="p-0 !gap-0">
            <CardContent className="p-0">
                <form action={handleSearch}>
                    <div className="flex w-full p-2">
                        <Input className="mr-1" placeholder="Search Articles..." onChange={(e) => setSearchInput(e.target.value)} />
                        <Button size="icon"
                            type="button"
                            className="mr-1 border-neutral-300 bg-neutral-300 text-neutral-900 hover:bg-neutral-100"
                            onClick={() => {
                                setFilterDialogOpen(true)
                            }}>
                            <SlidersHorizontal />
                        </Button>
                        <Button size="icon" type="submit">
                            <Search />
                        </Button>
                    </div>
                </form>
                <div className="px-2">
                    <span className="text-xs">Showing {data?.count > limit && <span>{skip + 1} to {data?.count < activePage * limit ? data?.count : activePage * limit} of </span>} {data?.count} article/s</span>
                </div>
                <div className="px-2 mb-2">
                    {searchQuery && <Badge className="cursor-pointer mr-1" onClick={() => {
                        setSearchQuery("");
                        setSearchInput("");
                        setSkip(0);
                        setActivePage(1);
                    }}>
                        {searchQuery} <XIcon />
                    </Badge>}

                </div>
                <div className="flex">
                    <div className="w-0 grow overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead className="pl-0">Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Publish Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {showData()}
                            </TableBody>
                        </Table>
                    </div>

                </div>

            </CardContent>
            {data && data.data.length > 0 && (
                <CardFooter className="p-2 justify-center">
                    {showPagination()}
                </CardFooter>
            )}

        </Card>
        {/* Filter Modal */}
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    <div>
                        <Label className="font-semibold text-xs mb-1">Author</Label>
                        <Select value={filters.author} onValueChange={(value) => {
                            setFilters({ ...filters, author: value });
                            setSkip(0);
                            setActivePage(1);
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Author" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any */}
                                {isUserLoading ? <SelectItem value="loading">Loading...</SelectItem> : userData?.data?.map((user: any) => (
                                    <SelectItem key={user._id} value={user._id}>{user.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-semibold text-xs mb-1">Type</Label>
                            <Select value={filters.type} onValueChange={(value) => {
                                setFilters({ ...filters, type: value });
                                setSkip(0);
                                setActivePage(1);
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ARTICLE_TYPE_BASIC}>Basic Article</SelectItem>
                                    <SelectItem value={ARTICLE_TYPE_VIDEO}>Video Article</SelectItem>
                                    <SelectItem value={ARTICLE_TYPE_PHOTO}>Photo Bucket</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="font-semibold text-xs mb-1">Status</Label>
                            <Select value={filters.status} onValueChange={(value) => {
                                setFilters({ ...filters, status: value });
                                setSkip(0);
                                setActivePage(1);
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label className="font-semibold text-xs mb-1">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!filters.startDate}
                                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon />
                                    {filters.startDate ? format(filters.startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={filters.startDate ? new Date(filters.startDate) : undefined} onSelect={(date) => {
                                    setFilters({ ...filters, startDate: date?.toLocaleDateString() })
                                    setSkip(0);
                                    setActivePage(1);
                                }} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label className="font-semibold text-xs mb-1">End date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!filters.endDate}
                                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon />
                                    {filters.endDate ? format(filters.endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={filters.endDate ? new Date(filters.endDate) : undefined} onSelect={(date) => {
                                    setFilters({ ...filters, endDate: date?.toLocaleDateString() })
                                    setSkip(0);
                                    setActivePage(1);
                                }} />
                            </PopoverContent>
                        </Popover>
                    </div>

                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline"
                        onClick={() => {
                            setFilterDialogOpen(false)
                            setFilters({
                                keywords: undefined,
                                status: undefined,
                                startDate: undefined,
                                endDate: undefined,
                                type: undefined,
                                author: undefined,
                            });
                        }}
                    >Cancel</Button>
                    <Button onClick={() => {
                        setFilterDialogOpen(false);
                    }}>
                        Apply Filters
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        {/* <pre>
            {JSON.stringify(data, null, 2)}
        </pre> */}
    </>
}

export default PostListComponent;