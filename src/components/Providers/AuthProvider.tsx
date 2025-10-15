'use client';
import { redirect } from "next/navigation";
import { validateToken } from "@/actions/auth";
import { getCookie } from 'typescript-cookie'
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePathname } from 'next/navigation'

export function AuthProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname()
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = getCookie('token');
        validateToken(token).then(data => {
            if (data) {
                setAuthenticated(true)
            } else {
                redirect("/auth/login")
            }
        }).catch((err) => {
            console.log(err)
            toast.error("Authentication Error!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: err.error,
                duration: 5000
            });
            redirect("/auth/login")
        })
    }, [pathname])

    if (authenticated)
        return <>{children}</>
}