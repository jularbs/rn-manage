"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { getCookie } from "typescript-cookie"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"
import { changePassword } from "@/actions/auth"

export function ChangePasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const token = getCookie("token");
    const [loading, setLoading] = useState(false);
    // const [showPassword, setShowPassword] = useState(false);
    // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formSchema = z.object({
        currentPassword: z.string()
            .min(1, { message: "Current password is required" }),
        password: z.string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
        confirm: z.string()
            .min(1, { message: "Confirm password is required" }),
    }).superRefine(({ password, confirm }, ctx) => {
        if (password !== confirm) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirm"],
            });
        }
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            password: "",
            confirm: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Handle password change logic here
        setLoading(true);
        changePassword({
            token: token,
            data: {
                currentPassword: data.currentPassword,
                password: data.password
            }
        }).then(res => {
            setLoading(false);
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
        }).catch(err => {
            setLoading(false);
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: err.message,
                duration: 5000,
                position: "top-center"
            })
        });
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your current password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>

                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your new password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>

                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm your new password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>

                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    <LoaderCircle className={cn("animate-spin", loading ? "inline-block" : "hidden")} />
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
