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
import { LoaderCircle, Eye, EyeOff } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { toast } from "sonner"

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
import Link from "next/link"

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formSchema = z.object({
        email: z.email({ message: "Invalid email address" })
            .min(1, { message: "Email is required" }),
        token: z.string()
            .min(1, { message: "Token is required" }),
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
            email: searchParams.get("e") || "",
            password: "",
            token: searchParams.get("t") || "",
            confirm: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="!gap-0">
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Please enter your new password.
                        <br />
                        Make sure to remember it for future logins.
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        {...field}
                                                        placeholder="********"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {!showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
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
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        {...field}
                                                        placeholder="********"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {!showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    <LoaderCircle className={cn("animate-spin", loading ? "inline-block" : "hidden")} />
                                    Reset Password
                                </Button>

                                <Link href="/auth/login" className="text-sm text-center hover:underline">
                                    Remembered your password? Log in here.
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
