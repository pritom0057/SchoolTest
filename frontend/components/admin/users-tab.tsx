"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as api from "@/lib/api"

export default function UsersTab() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        api
            .apiFetch("/api/users")
            .then((r) => r.json())
            .then((j) => mounted && setRows(j?.data ?? []))
            .finally(() => mounted && setLoading(false))
        return () => {
            mounted = false
        }
    }, [])

    const changeRole = async (userId: string, role: string) => {
        await api.apiFetch("/api/users/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, role }),
        })
        setRows((rows) => rows.map((u) => (u._id === userId ? { ...u, role } : u)))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users {loading ? "(Loading...)" : `(${rows.length})`}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((u) => (
                            <TableRow key={u._id}>
                                <TableCell>{u.name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.phone ?? "—"}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.emailVerifiedAt ? "Yes" : "No"}</TableCell>
                                <TableCell>
                                    <Select value={u.role} onValueChange={(v) => changeRole(u._id, v)}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STUDENT">STUDENT</SelectItem>
                                            <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
