
"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { mutate } from "swr";
import { toast } from "sonner";
import { getCookie } from "typescript-cookie";
import { removeProgram } from "@/actions/program";

const RemoveProgramComponent = ({ id = "", open, onOpenChange, onUpdateOpenChange, stationMutateId }:
    { id: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>>, onUpdateOpenChange: React.Dispatch<React.SetStateAction<boolean>>, stationMutateId: string }) => {
    const token = getCookie("token");

    const [loading, setLoading] = useState(false)

    const handleDelete = () => {
        setLoading(true);
        removeProgram({ id, token }).then((response: unknown) => {
            setLoading(false);
            onOpenChange(false);
            onUpdateOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                position: "top-center",
                description: (response as { message: string }).message,
                duration: 5000
            });
            mutate({ url: "v1/programs/schedule/station/" + stationMutateId, token: getCookie("token") })
        }).catch((err: { message: unknown; }) => {
            setLoading(false);
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: String(err.message),
                duration: 5000
            });
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>Do you really want to remove this program? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                        }}
                    >Cancel</Button>
                    <Button variant="destructive" onClick={() => {
                        handleDelete()
                    }}>
                        {loading && <LoaderCircle className="animate-spin" />}
                        <span className="capitalize">remove program</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RemoveProgramComponent;
