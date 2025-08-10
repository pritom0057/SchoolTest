"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as examsApi from "@/lib/exams"
import { useToast } from "@/hooks/use-toast"

export default function SupervisorPanel() {
    const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    useLoadExams(isAuthenticated && user?.role === "SUPERVISOR", setRows, setLoading)

    if (!isAuthenticated || user?.role !== "SUPERVISOR") {
        return (
            <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Access restricted</AlertTitle>
                <AlertDescription>Supervisor role is required to view this page.</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Exam Attempts Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    {loading ? "Loading exams..." : `Found ${rows.length} exams`}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Step</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Correct/Total</TableHead>
                            <TableHead>Percent</TableHead>
                            <TableHead>Awarded</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                                    No exams yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((e: any) => (
                                <TableRow key={e._id}>
                                    <TableCell>{e.userId?.name ?? "—"}</TableCell>
                                    <TableCell>{e.userId?.email ?? "—"}</TableCell>
                                    <TableCell>{e.userId?.role ?? "—"}</TableCell>
                                    <TableCell>{e.step}</TableCell>
                                    <TableCell>{e.status}</TableCell>
                                    <TableCell>{e.correct}/{e.total}</TableCell>
                                    <TableCell>{e.percent.toFixed(1)}%</TableCell>
                                    <TableCell>{e.awardedLevel ?? "—"}</TableCell>
                                    <TableCell>{new Date(e.updatedAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={async () => { if (!confirm('Reset this exam?')) return; try { await examsApi.resetExam(e._id); setRows(rows => rows.filter(r => r._id !== e._id)); toast({ title: 'Exam reset' }); } catch (e: any) { toast({ title: 'Reset failed', description: e?.message ?? 'Unable to reset' }) } }}>Reset</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function useLoadExams(enabled: boolean, setRows: (rows: any[]) => void, setLoading: (b: boolean) => void) {
    useEffect(() => {
        if (!enabled) return
        let mounted = true
        setLoading(true)
        examsApi
            .listAll()
            .then((res: any) => {
                if (!mounted) return
                setRows(res?.data ?? [])
            })
            .finally(() => mounted && setLoading(false))
        return () => {
            mounted = false
        }
    }, [enabled, setRows, setLoading])
}
