"use client";
import { fetcher } from "@/actions/swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import AddRecepientForm from "./AddRecepientForm";
import { Switch } from "@/components/ui/switch";
import { toggleRecepientStatus } from "@/actions/recepient";
import { toast } from "sonner";
import RemoveRecepientComponent from "./RemoveRecepientComponent";
import UpdateRecepientForm from "./UpdateRecepientForm";

export default function RecepientListComponent() {
    const { data, isLoading, error, mutate } = useSWR({
        url: "v1/recepients",
        params: { limit: 0 },
        token: getCookie("token")
    }, fetcher)
    const recepientData = data?.data || [];

    const [addOpen, setAddOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedRecepientId, setSelectedRecepientId] = useState<string | null>(null);

    const showSkeleton = () => {
        return new Array(5).fill(0).map((item, key) => {
            return <TableRow key={key}>
                <TableCell>
                    <div className="w-full h-6 mb-2 bg-gray-200 rounded animate-pulse" />
                    <div className="w-60 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                    <div className="w-full h-6 mb-2 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="w-full h-6 mb-2 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <div className="w-30 h-6 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
            </TableRow>
        });
    }

    const handleToggleStatus = (recepientId: string) => {
        // Implement status toggle logic here
        toggleRecepientStatus({ token: getCookie("token"), recepientId }).then((res) => {
            toast.success("Recepient status updated", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: res.message || "The recepient status has been updated.",
                duration: 5000
            });
            mutate();

            // Optionally, you can refresh the data here using mutate from SWR  
        }).catch((err: { message: unknown; }) => {
            console.error("Error toggling recepient status:", err.message);
        });
    }

    const showData = () => {
        if (isLoading) return showSkeleton();

        return recepientData.map((recepient: { _id: string; reason: string; email: string, description: string, isActive: boolean }) => {
            return <TableRow key={recepient._id}>
                <TableCell>
                    <p className="font-bold mb-1">{recepient.reason}</p>
                    <p className="text-xs text-muted-foreground font-light">{recepient.email ? recepient.email : "No email provided"}</p>
                </TableCell>
                <TableCell>
                    <p>{recepient.description}</p>
                </TableCell>
                <TableCell className="text-right">
                    <Switch checked={recepient.isActive}
                        onCheckedChange={() => handleToggleStatus(recepient._id)}
                    />
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                    <Button size={"sm"} variant={"outline"}
                        onClick={() => {
                            setSelectedRecepientId(recepient._id);
                            setUpdateOpen(true);
                        }}
                    >
                        <EditIcon />
                        Edit
                    </Button>
                    <Button size={"sm"} variant={"destructive"}
                        onClick={() => {
                            setSelectedRecepientId(recepient._id);
                            setRemoveOpen(true);
                        }}
                    >
                        <TrashIcon />
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
        });

    }

    useEffect(() => {
        if (error) {
            toast.error("Error loading recepients", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: error.message || "There was an error loading the recepient list.",
                duration: 5000
            });
        }
    }, [error])

    return <>
        <UpdateRecepientForm open={updateOpen} onOpenChange={setUpdateOpen} recepientId={selectedRecepientId!} />
        <AddRecepientForm open={addOpen} onOpenChange={setAddOpen} />
        <RemoveRecepientComponent open={removeOpen} onOpenChange={setRemoveOpen} recepientId={selectedRecepientId!} />
        <Card className="p-0 !gap-0">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Recepients</div>
                <Button size={"sm"} variant={"outline"}
                    className="cursor-pointer"
                    onClick={() => {
                        setAddOpen(true);
                    }}
                ><PlusIcon /> Add Recepient</Button>
            </CardHeader>
            <CardContent className="p-0 grow-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reasons</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Visibility</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showData()}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
}