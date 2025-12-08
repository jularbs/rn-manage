"use client";
import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { useParams } from "next/navigation";
import { getCookie } from "typescript-cookie";
import { IMessage } from "@/types/message";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EllipsisVerticalIcon, EyeIcon, EyeOffIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { markMessageAsRead, markMessageAsUnread } from "@/actions/message";
import { mutate } from "swr";
import RemoveInquiryComponent from "./RemoveInquiryComponent";
export default function ViewInquiryComponent() {
    const params = useParams<{ id: string }>()

    const [removeOpen, setRemoveOpen] = useState<boolean>(false);
    const { data, error, isLoading, mutate: messageMutate } = useSWR({ url: "v1/messages/" + params.id, token: getCookie("token") }, fetcher);
    const inquiryData: Partial<IMessage> = data?.data || {};

    useEffect(() => {
        if (error) {
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: error.message ||
                    "There was an error retrieving the inquiry details.",
                duration: 5000,
                position: "top-center"
            })
        }
    }, [error])

    const handleMarkAsUnread = () => {
        // Implement mark as read functionality here
        markMessageAsUnread({ token: getCookie("token"), messageId: params.id! }).then(res => {
            // Update the SWR cache with new data
            messageMutate({
                ...data,
                data: {
                    ...inquiryData,
                    status: "unread",
                    readAt: undefined,
                    readBy: undefined
                }
            }, false);
            // also mutate the unread count in the sidebar
            mutate({ url: "v1/messages/unread/count", token: getCookie("token") });

            toast.success("Inquiry marked as unread!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: res.message,
                duration: 5000,
                position: "top-center"
            })
        });

    }

    const handleMarkAsRead = () => {
        // Implement mark as read functionality here
        markMessageAsRead({ token: getCookie("token"), messageId: params.id! }).then(res => {
            // Update the SWR cache with new data
            messageMutate();

            // also mutate the unread count in the sidebar
            mutate({ url: "v1/messages/unread/count", token: getCookie("token") });
            toast.success("Inquiry marked as read!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: res.message,
                duration: 5000,
                position: "top-center"
            })
        });

    }

    return <>
        <RemoveInquiryComponent messageId={params.id!} open={removeOpen} onOpenChange={setRemoveOpen} />
        <div className="mb-2">
            <Link href="/dashboard/inquiry-management">
                <Button variant={"ghost"} className="cursor-pointer"><ArrowLeftIcon></ArrowLeftIcon> <span>Return</span></Button>
            </Link>
        </div>
        <Card>
            <CardContent>
                {isLoading && <p>Loading...</p>}
                <div className="flex justify-between mb-4">
                    <div>
                        <h1 className="text-lg font-bold">{inquiryData.fullName}</h1>
                        <p className="font-light text-sm text-muted-foreground">{inquiryData.emailAddress}</p>
                        <p className="font-light text-sm text-muted-foreground">{inquiryData.contactNumber}</p>
                    </div>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm"><EllipsisVerticalIcon /> Actions</Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-2 -translate-x-10">
                                <div className="grid gap-2">
                                    {inquiryData.status === "read" ?
                                        <Button variant={"ghost"}
                                            onClick={handleMarkAsUnread}
                                            size="sm" className="justify-start"
                                        >
                                            <EyeOffIcon />
                                            Mark as Unread
                                        </Button> : <Button variant={"ghost"}
                                            size="sm" className="justify-start"
                                            onClick={handleMarkAsRead}
                                        >
                                            <EyeIcon />
                                            Mark as Read
                                        </Button>
                                    }
                                    <Button variant="ghost" size="sm" className="justify-start text-destructive"
                                        onClick={() => {
                                            setRemoveOpen(true);
                                        }}
                                    ><TrashIcon /> Delete Inquiry</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="mb-3">
                    <Badge variant={"outline"}>{inquiryData.stationId?.name}</Badge>
                    <p className="font-bold text-lg leading-loose">{inquiryData.reason?.reason}</p>
                </div>
                <p className="whitespace-pre-wrap">{inquiryData.message}</p>
                {inquiryData.status === "read" ?
                    <Button variant={"outline"} className="mt-5 cursor-pointer"
                        onClick={handleMarkAsUnread}
                    >
                        <EyeOffIcon />
                        Mark as Unread
                    </Button> : <Button variant={"outline"} className="mt-5 cursor-pointer"
                        onClick={handleMarkAsRead}
                    >
                        <EyeIcon />
                        Mark as Read
                    </Button>
                }
            </CardContent>
            <CardFooter>
                <div>
                    <p className="text-xs text-muted-foreground">Received on: {new Date(inquiryData.createdAt || "").toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Last read: {inquiryData.readAt ? new Date(inquiryData.readAt || "").toLocaleString() : "Never"}</p>
                    <p className="text-xs text-muted-foreground">Read by: {inquiryData.readBy ? inquiryData.readBy.fullName : "N/A"}</p>
                </div>
            </CardFooter>
        </Card>
    </>
}