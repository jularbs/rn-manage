"use client";
import { fetcher } from "@/actions/swr";
import { updateUser } from "@/actions/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getInitials, unslugify } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { EditIcon, EllipsisVerticalIcon, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import { useLocalStorage } from "usehooks-ts";
import z from "zod";


export default function UserProfileForm() {
    const token = getCookie("token");
    const [user, setUser] = useLocalStorage("user", { _id: "", fullName: "", email: "", role: "" })
    const [loading, setLoading] = useState(false);
    const [isFormActive, setIsFormActive] = useState(false);

    const { data, isLoading: userDataLoading, mutate } = useSWR(
        user && user._id ? { url: "v1/users/" + user._id, token } : null,
        fetcher
    );
    const userData = data ? data.data : null;

    const formSchema = z.object({
        fullName: z.string().min(2, "Full Name must be at least 2 characters long"),
        email: z.email("Invalid email address"),
        role: z.string().min(1, "Role is required"),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: user.fullName || "",
            email: user.email || "",
            role: user.role || "",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        updateUser({ token: token, data: values, id: userData._id }).then((res) => {
            setIsFormActive(false);
            mutate();
            setUser((prev) => {
                return {
                    ...prev,
                    fullName: values.fullName,
                    email: values.email,
                    role: values.role,
                }
            });
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: res.message,
                duration: 5000,
                position: "top-center"
            })
        }).catch(e => {
            console.log("Error at createStation: ", e)
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: e.message,
                duration: 5000,
                position: "top-center"
            })
        }).finally(() => {
            setLoading(false);
        })
    }

    const showForm = () => {
        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="fullName">
                                    <span className="text-primary">Full Name</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        {...field}
                                        placeholder="Juan Dela Cruz"
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
                                    <span className="text-primary">Email Address</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled
                                        id="email"
                                        type="text"
                                        {...field}
                                        placeholder="juandlc@yahoo.com"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-light" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="role">
                                    <span className="text-primary">Role</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled
                                        id="role"
                                        type="text"
                                        {...field}
                                        placeholder="Administrator"
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-light" />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col gap-2 mt-2">
                        <Button variant={"outline"}
                            onClick={() => {
                                setIsFormActive(false);
                                form.reset();
                            }}
                            type="button"
                        >Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <LoaderCircle className="animate-spin w-4" /> : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Form>
        )
    }

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <h2 className="font-bold uppercase text-xl flex items-center gap-2">User Profile {userDataLoading && <LoaderCircle className="animate-spin w-4" />}</h2>
                <div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm"><EllipsisVerticalIcon /> Actions</Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 -translate-x-10">
                            <div className="grid gap-2">
                                <Button variant="ghost" size="sm" className="justify-start"
                                    onClick={() => {
                                        setIsFormActive(true);
                                    }}
                                ><EditIcon /> Edit Profile</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                {isFormActive ? showForm() : <div className="flex gap-4 items-center">
                    <Avatar className="w-15 h-15 rounded-lg">
                        <AvatarFallback className="rounded-lg text-[28px]">{getInitials(userData?.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-sm leading-tight text-left">
                        <span className="text-xl font-bold">{userData?.fullName}</span>
                        <span className="capitalize mb-2">{unslugify(userData?.role)}</span>
                        <span className="">{userData?.email}</span>
                    </div>
                </div>
                }
            </CardContent>
        </Card>
    );
}