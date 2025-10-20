"use client"
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import useSWRInfinite from "swr/infinite";
import { getCookie } from "typescript-cookie";
import { fetcher } from "@/actions/swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import _ from "lodash";
import { LoaderCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import PostListComponent from "../PostManagementForms/PostListComponent";
import { cn } from "@/lib/utils";

const TagListComponent = () => {
    const { ref, inView } = useInView({ threshold: .9 });

    const token = getCookie("token")
    const [selected, setSelected] = useState<string | null>(null);
    const [limit,] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAllFetched, setIsAllFetched] = useState(false);
    const {
        data,
        size,
        setSize,
        isLoading,
        error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useSWRInfinite((index: number, previous: any) => {
        if (previous && previous.pagination && !previous.pagination.hasNextPage) {
            setIsAllFetched(true);
            return null; // No more data to fetch
        }
        return {
            url: "v1/tags",
            params: {
                page: index + 1,
                limit,
                search: searchQuery
            },
            token
        }
    },
        fetcher,
        {
            revalidateFirstPage: false
        }
    );

    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

    useEffect(() => {
        if (inView) {
            if (!isLoadingMore)
                setSize(size + 1);
        }
    }, [inView, setSize, size, isLoadingMore]);

    useEffect(() => {
        if (error && error.message) {
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: error.message,
                duration: 5000
            });
        }
    }, [error]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsAllFetched(false);
    };

    const debouncedOnChange = _.debounce(handleSearchChange, 400);

    const skeleton = () => {
        return new Array(limit).fill(0).map((_item, key) => {
            return <TableRow key={key}>
                <TableCell>
                    <Skeleton className="w-50 h-6" />
                </TableCell>
            </TableRow>
        })
    }
    const showData = () => {
        return data?.map(page => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return page.data?.map((item: any, key: Key) => {
                return <TableRow key={key} onClick={() => {
                    if (selected === item._id) {
                        setSelected("");
                        return;
                    }
                    setSelected(item._id);
                }}>
                    <TableCell className={cn(`cursor-pointer`,
                        selected === item._id ? "bg-blue-500 text-white" : "hover:bg-neutral-200"
                    )}>
                        {item.name}
                    </TableCell>
                </TableRow>
            })
        })
    }

    return <>
        <div className="flex flex-row flex-1 p-2 pt-0 -mt-2 flex-wrap">
            <div className="w-full lg:w-1/4 p-2">
                <Card className="p-0 !gap-0">
                    <CardContent className="p-0 grow-1">
                        <div className="p-2 relative">
                            <Input type="text" placeholder="Search Tag" onChange={debouncedOnChange} />
                            <LoaderCircle className={`w-4 h-4 text-black animate-spin absolute right-5 top-1/2 -translate-y-1/2
                        ${isLoading ? "inline-block" : "hidden"}`} />
                        </div>
                        <div className="max-h-[200px] lg:max-h-[500px] overflow-x-scroll">
                            {data?.[0]?.count == 0 ?
                                <div className="text-center py-4 font-bold">No Tags Found</div> :
                                <>
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tag Name</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {showData()}
                                            {isLoadingMore && !isAllFetched && !error && skeleton()}
                                        </TableBody>
                                    </Table>
                                    {isAllFetched ?
                                        <div className="bg-transparent rounded-sm text-neutral-500 text-sm p-2 text-center font-bold">- All Tags Displayed -</div>
                                        : null}
                                    {!isAllFetched && !isLoadingMore && !error &&
                                        <div ref={ref} className="text-sm p-2 text-center">Loading more...</div>
                                    }
                                </>
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="w-full lg:w-3/4 p-2">
                <PostListComponent preselectedTags={selected ? [selected] : []} />
            </div>
        </div>
    </>
}

export default TagListComponent;