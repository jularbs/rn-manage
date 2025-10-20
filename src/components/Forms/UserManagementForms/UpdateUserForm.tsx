"use client";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useEffect, useState } from "react";

import { fetcher } from "@/actions/swr"
import useSWR, { mutate } from "swr";
import { LoaderCircle } from "lucide-react";
import { getCookie } from "typescript-cookie";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { ADMIN_ROLE, MANAGER_ROLE, MANAGING_EDITOR_ROLE, DIGITAL_CONTENT_PRODUCER_ROLE } from "@/lib/constants";
import { toast } from "sonner";
import { updateUser } from "@/actions/user";
const UpdateUserForm = ({ id = "", open, onOpenChange }:
    { id: string, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>> }) => {
    //Fetch all payment options
    const token = getCookie("token");
    const { data, isLoading } = useSWR(
        id && open ? { url: "v1/users/" + id, token } : null,
        fetcher
    );

    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        _id: z.string().min(1, { message: "User ID required" }),
        name: z.string().min(1, { message: "User name required" }),
        email: z.email({ message: "Please enter a valid email" }).min(1, { message: "Email required" }),
        role: z.string().min(1, { message: "User role required" }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            _id: "",
            name: "",
            email: "",
            role: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        updateUser({ data: { ...values, regStatus: 1 }, token: token }).then(() => {
            setLoading(false);
            onOpenChange(false);
            mutate({ url: "v1/users", params: { accountVerified: true }, token });
            mutate({ url: "v1/users", params: { accountVerified: false }, token });
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: "User has been updated successfully.",
                duration: 5000
            });

        }).catch((err: unknown) => {
            console.log("Error: ", err)
            setLoading(false);
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: "There was an error on updating user",
                duration: 5000
            });
        })
    }

    useEffect(() => {
        if (!isLoading)
            if (data) {
                form.setValue("_id", data.data._id);
                form.setValue("name", data.data.fullName);
                form.setValue("email", data.data.email);
                form.setValue("role", data.data.role);
            }
    }, [form, isLoading, data])

    useEffect(() => {
        if (!open) {
            form.reset({
                _id: "",
                name: "",
                email: "",
                role: ""
            },);
        }
    }, [open, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1">
                        <span>User Approval Form</span>
                        {isLoading && <LoaderCircle size={18} className="animate-spin" />}
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Full Name</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. Juan dela Cruz"
                                                disabled
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
                                            <span className="text-primary">Email</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...field}
                                                placeholder="e.g. info@starcity.com.ph"
                                                disabled
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel htmlFor="image"><span className="text-primary">Role</span></FormLabel>
                                        </div>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={cn(
                                                `w-full`,
                                                form.formState?.errors?.role?.message && "border-destructive"
                                            )}>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ADMIN_ROLE}>Administrator</SelectItem>
                                                <SelectItem value={MANAGER_ROLE}>Manager</SelectItem>
                                                <SelectItem value={MANAGING_EDITOR_ROLE}>Managing Editor</SelectItem>
                                                <SelectItem value={DIGITAL_CONTENT_PRODUCER_ROLE}>Digital Content Producer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs font-light text-destructive">{form.formState?.errors?.role?.message}</p>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => { onOpenChange(false) }}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Update User
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >

    );
};

export default UpdateUserForm;
