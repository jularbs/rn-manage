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
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import AddStationComponent from "./AddStationComponent";
import ViewStationComponent from "./ViewStationComponent";

const CategoryManagementForm = () => {
    const token = getCookie("token")
    const [selected, setSelected] = useState<string | null>(null);
    const { data: stations, isLoading, error } = useSWR({ url: "v1/stations", token }, fetcher)

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
        return stations?.data?.map((item: any, key: Key) => {
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
        <AddStationComponent open={addOpen} onOpenChange={setAddOpen} />
        <div className="grid xl:grid-cols-4 p-2 pt-0 -mt-2">
            <div className="xl:col-span-1 p-2">
                <Card className="p-0 !gap-0 overflow-hidden">
                    <CardContent className="p-0 grow-1">
                        <div className="max-h-[200px] lg:max-h-[500px] overflow-x-scroll">
                            {stations?.[0]?.count == 0 ?
                                <div className="text-center py-4 font-bold">No Stations Found</div> :
                                <Table className="w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="flex justify-between items-center">
                                                <span>Stations</span>
                                                <Button size="sm" className="h-6 rounded-sm cursor-pointer"
                                                    onClick={() => { setAddOpen(true) }}
                                                > <PlusIcon /><span className="text-xs">New Station</span></Button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showData()}
                                    </TableBody>
                                </Table>
                            }

                        </div>
                    </CardContent>
                </Card>
            </div>
            <ViewStationComponent selectedStationId={selected as string} className="xl:col-span-3 p-2" />
        </div>
    </>
}

export default CategoryManagementForm;