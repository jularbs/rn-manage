"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getCookie } from "typescript-cookie";
import z from "zod";

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { createRecepient } from "@/actions/recepient";

import { toast } from "sonner";
import { mutate } from "swr";
export default function AddRecepientForm({ open, onOpenChange }:
    { open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) {
    const token = getCookie("token");

    const [loading, setLoading] = useState(false)


    const formSchema = z.object({
        reason: z.string().min(1, { message: "Reason is required" }),
        email: z.string().optional().refine((value) => {
            if (!value || value.trim() === '') return true;
            const emails = value.split(',').map(email => email.trim());
            return emails.every(email => z.email().safeParse(email).success);
        }, { message: "Please provide valid email address(es). Multiple emails should be separated by commas" }),
        description: z.string().optional(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
            email: "",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        createRecepient({ data: values, token }).then(() => {
            setLoading(false)
            onOpenChange(false)
            mutate({ url: "v1/recepients", params: { limit: 0 }, token })
            form.reset()
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: "New recepient has been added.",
                duration: 5000
            });
        }).catch((err: { message: unknown; }) => {
            setLoading(false)
            toast.error("Invalid Request", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: err.message as string,
                duration: 5000
            });
            console.error("Error adding recepient:", err.message);
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add new recepient</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="reason">
                                            <span className="text-primary">Reason</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="reason"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. General Inquiry"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">
                                            <span className="text-primary">Email (Optional)</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="text"
                                                {...field}
                                                placeholder="email1@example.com, email2@example.com"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="description">
                                            <span className="text-primary">Description (Optional)</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="description"
                                                type="text"
                                                {...field}
                                                placeholder="Additional details"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => { onOpenChange(false) }}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Add Recepient
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}   