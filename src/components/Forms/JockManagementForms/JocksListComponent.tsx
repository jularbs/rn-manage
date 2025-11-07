"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
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
import { LoaderCircle, PlusIcon } from "lucide-react";
import AddJockComponent from "./AddJockComponent";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import ViewJockComponent from "./ViewJockComponent";

const JocksListComponent = () => {
    const token = getCookie("token")
    const [selected, setSelected] = useState<string | null>(null);
    const [selectedStation, setSelectedStation] = useState("");

    const { data: stations, isLoading: isStationsLoading } = useSWR({ url: "v1/stations", token }, fetcher)

    const { data: jocks, isLoading, error } = useSWR(
        selectedStation ? {
            url: "v1/jocks",
            params: {
                station: selectedStation
            },
            token
        } : null, fetcher)

    const [isAddOpen, setIsAddOpen] = useState(false);

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
        return jocks?.data?.map((item: any, key: Key) => {
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
        <AddJockComponent open={isAddOpen} onOpenChange={setIsAddOpen} defaultStation={selectedStation} />
        <div className="grid xl:grid-cols-3 p-2 pt-0 -mt-2">
            <div className="xl:col-span-1 p-2">
                <Card className="p-0 !gap-0 overflow-hidden">
                    <CardHeader className="flex justify-between items-center p-2">
                        <Select onValueChange={(value) => setSelectedStation(value)} value={selectedStation}
                        >
                            <SelectTrigger className="w-full max-w-md relative">
                                <SelectValue placeholder="Select Station" />
                                <LoaderCircle className={cn("animate-spin w-4 absolute right-8",
                                    isStationsLoading ? "block" : "hidden"
                                )} />
                            </SelectTrigger>
                            <SelectContent>
                                {stations?.data?.map((station: { _id: string; name: string }) => (
                                    <SelectItem key={station._id} value={station._id}>{station.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => {
                                setIsAddOpen(true)
                            }}
                            className="cursor-pointer"><PlusIcon /></Button>
                    </CardHeader>
                    <CardContent className="p-0 grow-1">
                        <div className="max-h-[200px] lg:max-h-[500px] overflow-x-scroll">
                            {selectedStation ?
                                jocks?.data.length == 0 ?
                                    <div className="text-center py-4 font-bold">No jocks found</div> :
                                    <>
                                        <Table className="w-full">
                                            <TableBody>
                                                {showData()}
                                            </TableBody>
                                        </Table>
                                    </>
                                : <div className="text-center py-4 font-bold">Select Station to View Jocks</div>
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="xl:col-span-2 p-2">
                <ViewJockComponent selected={selected as string} setSelected={setSelected} />
            </div>
        </div>
    </>
}

export default JocksListComponent;