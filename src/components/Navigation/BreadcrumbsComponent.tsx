"use client"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from "react"
const BreadcrumbsComponent = () => {

    const pathname = usePathname()
    const [display, setDisplay] = useState<string[]>([]);

    useEffect(() => {
        const paths = pathname.split("/")
        const formattedPaths = paths.map((path) => path.split("-").join(" ").split("_").join(" ")) //convert - and _ to spaces
        const filteredPaths = formattedPaths.filter((path) => path.length > 0) //remove empty values
        setDisplay(filteredPaths);
    }, [pathname])

    const showPaths = () => {
        return display.map((path, key) => {
            return <React.Fragment key={key}>
                {!!key && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={cn(key + 1 < display.length && 'hidden md:block')}>
                    <BreadcrumbPage className="capitalize font-semibold">{path}</BreadcrumbPage>
                </BreadcrumbItem>
            </React.Fragment>
        })
    }
    
    return <Breadcrumb>
        <BreadcrumbList>
            {showPaths()}
        </BreadcrumbList>
    </Breadcrumb>
}

export default BreadcrumbsComponent