"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

//FORMS
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { LoaderCircle } from "lucide-react";

import { AlertError } from "@/components/AlertError";
import { AlertSuccess } from "@/components/AlertSuccess";

export function RegistrationForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        success: "",
        error: ""
    })
    //FORMS
    const formSchema = z.object({
        name: z.string()
            .min(2, { message: "Name must be at least 2 characters." })
            .max(50, { message: "Name must be at most 50 characters." }),
        email: z.email("This is not a valid email."),
        password: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(50, { message: "Password must be at most 50 characters." }),
        confirmPassword: z.string()
            .min(8, { message: "Password must be at least 8 characters." })
            .max(50, { message: "Password must be at most 50 characters." }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create new account</CardTitle>
                    <CardDescription>
                        Register to start accessing management pages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {message.error && <AlertError title="Request Invalid" message={message.error} />}
                                {message.success && <AlertSuccess title="Success!" message={message.success} />}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="name">
                                                <span className="text-primary">Name</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="name"
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
                                                <span className="text-primary">Email</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...field}
                                                    placeholder="m@example.com"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="password">
                                                <span className="text-primary">Password</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    {...field}
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="confirmPassword">
                                                <span className="text-primary">Confirm Password</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    {...field}
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    Create Account
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                            <div className="mt-4 text-sm text-center">
                                Already have an account?{" "}
                                <a href="/auth/login" className="underline underline-offset-4">
                                    Log in
                                </a>
                            </div>
                        </form>
                    </Form>

                </CardContent>
            </Card>
        </div>
    )
}
