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

import { getCookie } from "typescript-cookie";
import { fetcher } from "@/actions/swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, useEffect, useState } from "react";
import { toast } from "sonner";
import PostListComponent from "../PostManagementForms/PostListComponent";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import AddCategoryForm from "./AddCategoryForm";

const CategoryManagementForm = () => {
    const token = getCookie("token")
    const [selected, setSelected] = useState<string | null>(null);
    const { data: categories, isLoading, error } = useSWR({ url: "v1/categories", token }, fetcher)

    const [addOpen, setAddOpen] = useState<boolean>(false)

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

    const showData = () => {
        if (isLoading) {
            return (
                <>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                        </TableRow>
                    ))}
                </>
            );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return categories?.data?.map((item: any, key: Key) => {
            return <TableRow key={key} onClick={() => {
                if (selected === item._id) {
                    setSelected(null);
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
    }

    return <>
        <AddCategoryForm open={addOpen} onOpenChange={setAddOpen} />
        <div className="flex flex-row flex-1 p-2 pt-0 -mt-2 flex-wrap">
            <div className="w-full lg:w-1/4 p-2">
                <Card className="p-0 !gap-0 overflow-hidden">
                    <CardContent className="p-0 grow-1">
                        <div className="max-h-[200px] lg:max-h-[500px] overflow-x-scroll">
                            {categories?.[0]?.count == 0 ?
                                <div className="text-center py-4 font-bold">No Categories Found</div> :
                                <>
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="flex justify-between items-center">
                                                    <span>Category</span>
                                                    <Button className="h-6 w-6 bg-accent text-black border-1 border-black hover:text-white cursor-pointer"
                                                        onClick={() => { setAddOpen(true) }}
                                                    ><PlusIcon /></Button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {showData()}
                                        </TableBody>
                                    </Table>
                                </>
                            }

                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="w-full lg:w-3/4 p-2">
                <PostListComponent preselectedCategories={selected ? [selected] : []} />
            </div>
        </div>
    </>
}

export default CategoryManagementForm;