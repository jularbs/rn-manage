import { cn } from "@/lib/utils";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export function AlertSuccess({
    className,
    title,
    message,
}: {
    className?: string | undefined,
    title: string,
    message: string
}) {
    return (
        <Alert className={cn("border-green-700 bg-green-700/20", className)}>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="text-xs text-black">
                {message}
            </AlertDescription>
        </Alert>
    );
}
