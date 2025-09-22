import { cn } from "@/lib/utils";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export function AlertError({
    className,
    title,
    message,
}: {
    className?: string | undefined,
    title: string,
    message: string
}) {
    return (
        <Alert variant="destructive" className={cn("border-red-600", className)}>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="text-xs">
                {message}
            </AlertDescription>
        </Alert>
    );
}
