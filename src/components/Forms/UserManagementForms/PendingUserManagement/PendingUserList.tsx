"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import { fetcher } from "@/actions/swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import PendingUserForm from "./PendingUserForm";
import RemoveUserComponent from "../RemoveUserForm";

const PendingUserList = () => {
    const token = getCookie("token")
    const { data, isLoading } = useSWR({ url: "v1/users", params: { accountVerified: false }, token: token }, fetcher)

    const [acceptOpen, setAcceptOpen] = useState<boolean>(false)
    const [removeOpen, setRemoveOpen] = useState<boolean>(false)
    const [currentId, setCurrentId] = useState("")


    const showData = () => {
        if (isLoading)
            return new Array(1).fill(0).map((item, key) => {
                return <TableRow key={key}>
                    <TableCell>
                        <Skeleton className="w-50 h-6" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="w-60 h-6" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="w-50 h-6" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="w-50 h-6" />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Skeleton className="w-30 h-6" />
                            <Skeleton className="w-30 h-6" />
                        </div>
                    </TableCell>
                </TableRow>
            })

        if (!isLoading && data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.data.map((item: any, key: Key) => {
                return <TableRow key={key}>
                    <TableCell>
                        {item.fullName}
                    </TableCell>
                    <TableCell>
                        {item.email}
                    </TableCell>
                    <TableCell>
                        {format(new Date(item.createdAt), "PPP p")}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Button onClick={() => {
                                setCurrentId(item._id);
                                setAcceptOpen(true);
                            }}>Accept</Button>
                            <Button variant="destructive"
                                onClick={() => {
                                    setCurrentId(item._id);
                                    setRemoveOpen(true);
                                }}
                            >Reject</Button>
                        </div>
                    </TableCell>
                </TableRow>
            })
        }
    }

    return <>
        <RemoveUserComponent id={currentId} open={removeOpen} onOpenChange={setRemoveOpen} type="reject" />
        <PendingUserForm id={currentId} open={acceptOpen} onOpenChange={setAcceptOpen} />
        <Card className="p-0 !gap-0">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Pending Users</div>
            </CardHeader>
            <CardContent className="p-0 grow-1">
                {(!isLoading && data.data.length > 0) ?
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Date Registered</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {showData()}
                        </TableBody>
                    </Table> :
                    <div className="p-4 text-center">No Pending Users</div>
                }
            </CardContent>
        </Card>
    </>
}

export default PendingUserList;