import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";

interface FeaturedVideoManagementProps {
    open: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
}

export default function FeaturedVideoManagement({
    open, 
    onOpenChange, 
    form
}: FeaturedVideoManagementProps) {
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
        if (open) {
            const currentValue = form.getValues("videoSourceUrl");
            setInputValue(typeof currentValue === 'string' ? currentValue : "");
        }
    }, [open, form]);
    return <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[70vh] overflow-y-auto top-5 translate-y-0">
                <DialogHeader>
                    <DialogTitle>Featured Video</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="videoURL" className="text-sm font-medium">Video URL</label>
                        <input
                            id="videoURL"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter video URL here..."
                            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {inputValue && (
                            <div className="bg-accent aspect-video rounded-md overflow-hidden">

                                <ReactPlayer
                                    src={inputValue}
                                    width="100%"
                                    height="100%"
                                    controls
                                />
                            </div>
                        )}
                        <Button onClick={() => {
                            form.setValue("videoSourceUrl", inputValue);
                            onOpenChange(false);
                            toast.success("Success!", {
                                style: {
                                    background: "rgb(56, 142, 60)",
                                    color: "white",
                                    border: "none"
                                },
                                description: "Video URL saved successfully!",
                                duration: 5000
                            });
                        }}>
                            Save Video URL
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </>
}