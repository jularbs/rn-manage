import { cn } from "@/lib/utils";
import { ConstructionIcon } from "lucide-react";

//Component where children is only shown in development environment.
//Shows a placeholder component when children is empty or in production environment
//Remove provider when feature is ready for production
const UnderConstruction = ({
    children,
    featureName = "this",
    className,
    show = true
}: {
    className?: string,
    children?: React.ReactNode
    featureName?: string,
    show?: boolean
}) => {
    if (process.env.NEXT_PUBLIC_ENV === "production" || !children || !show) {
        return <div className={cn("flex justify-center items-center w-full h-80", className)}>
            <div className="w-full h-full bg-accent animate-pulse rounded-md p-4">
            </div>
            <div className="absolute px-6 text-center flex flex-col justify-center items-center">
                <ConstructionIcon className="mb-1 size-10 md:size-15 lg:size-20" />
                <span className="text-sm font-bold"><span className="capitalize">{featureName}</span> feature is still under construction</span>
                <span className="text-xs font-light">Developer will give an update once {featureName} feature is ready</span>
            </div>
        </div>
    }

    return <>{children}</>



}

export default UnderConstruction;