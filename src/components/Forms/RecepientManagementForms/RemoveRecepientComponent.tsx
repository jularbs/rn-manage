"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { mutate } from "swr";
import { toast } from "sonner";
import { getCookie } from "typescript-cookie";
import { deleteRecepient } from "@/actions/recepient";

const RemoveRecepientComponent = ({ recepientId, open, onOpenChange }:
    {
        recepientId: string,
        open: boolean,
        onOpenChange: React.Dispatch<React.SetStateAction<boolean>>,
        swrKey?: Record<string, string | undefined | Record<string, string | string[] | number | undefined>>
    }) => {

    const token = getCookie("token");
    const [loading, setLoading] = useState(false)

    const handleDelete = () => {
        setLoading(true);
        deleteRecepient({ recepientId: recepientId, token }).then((response) => {
            setLoading(false);
            onOpenChange(false);
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                position: "top-center",
                description: response.message,
                duration: 5000
            });
            mutate({ url: "v1/recepients", params: { limit: 0 }, token });
        }).catch((err) => {
            setLoading(false);
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: err.message,
                duration: 5000
            });
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. You are about to remove inquiry recepient.
                    </DialogDescription>
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
                        Delete Recepient
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RemoveRecepientComponent;
