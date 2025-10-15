//TODOS: implement pagination
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
import { obscureEmail, unslugify } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import RemoverUserForm from "./RemoveUserForm";
import UpdateUserForm from "./UpdateUserForm";
const UserListComponent = () => {
    const token = getCookie("token")
    const { data, isLoading } = useSWR({ url: "v1/users", params: { accountVerified: true }, token }, fetcher)

    const [updateOpen, setUpdateOpen] = useState<boolean>(false)
    const [removeOpen, setRemoveOpen] = useState<boolean>(false)
    const [currentId, setCurrentId] = useState("")

    const showData = () => {
        if (isLoading)
            return new Array(10).fill(0).map((item, key) => {
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
            return data?.data?.map((item: any, key: Key) => {
                return <TableRow key={key}>
                    <TableCell>
                        {item.fullName}
                    </TableCell>
                    <TableCell>
                        {obscureEmail(item.email)}
                    </TableCell>
                    <TableCell className="capitalize">
                        {unslugify(item.role)}
                    </TableCell>
                    <TableCell>
                        {format(new Date(item.createdAt), "PPP p")}
                    </TableCell>
                    <TableCell>
                        {item.lastLogin ? format(new Date(item.lastLogin), "PPP p") : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Button size="icon"
                                onClick={() => {
                                    setCurrentId(item._id);
                                    setUpdateOpen(true);
                                }}><Edit /></Button>
                            <Button variant="destructive" size="icon"
                                onClick={() => {
                                    setCurrentId(item._id);
                                    setRemoveOpen(true);
                                }}
                            ><Trash /></Button>
                        </div>
                    </TableCell>
                </TableRow>
            })
        }
    }

    return <>
        <UpdateUserForm id={currentId} open={updateOpen} onOpenChange={setUpdateOpen} />
        <RemoverUserForm id={currentId} open={removeOpen} onOpenChange={setRemoveOpen} type="remove" />
        <Card className="p-0 !gap-0">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Manage Users</div>
            </CardHeader>
            <CardContent className="p-0 grow-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Date Registered</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showData()}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
}

export default UserListComponent;