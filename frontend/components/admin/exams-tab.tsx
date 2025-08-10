"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import * as examsApi from "@/lib/exams"
import { me as fetchMe } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ExamsTab() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pending, setPending] = useState(false)
    const [selected, setSelected] = useState<any | null>(null)
    const load = () => {
        setLoading(true)
        examsApi.listAll().then((j: any) => setRows(j?.data ?? [])).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])
    const onReset = async (id: string) => {
        try {
            const res = await examsApi.resetExam(id)
            // After reset, backend deletes ALL exams for that user; reload for accuracy
            load()
            toast({ title: 'Exam reset', description: res?.clearedAll ? 'All attempts for this student were cleared.' : 'The selected exam was cleared.' })
            // Broadcast a custom event so student clients can optionally react if open
            try {
                const profile = await fetchMe()
                const ev = new CustomEvent('ts-student-updated', { detail: { user: profile?.data } })
                window.dispatchEvent(ev)
            } catch { /* ignore */ }
        } catch (e: any) {
            toast({ title: 'Reset failed', description: e?.message ?? 'Failed to reset exam' })
        }
    }
    const onOpenConfirm = (exam: any) => {
        setSelected(exam)
        setConfirmOpen(true)
    }
    const onConfirm = async () => {
        if (!selected) return
        setPending(true)
        try {
            await onReset(selected._id)
            setConfirmOpen(false)
            setSelected(null)
        } finally {
            setPending(false)
        }
    }
    return (
        <Card>
            <CardHeader><CardTitle>All Exams {loading ? '(Loading...)' : `(${rows.length})`}</CardTitle></CardHeader>
            <CardContent>
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
                        {rows.map((e: any) => (
                            <TableRow key={e._id}>
                                <TableCell>{e.userId?.name ?? '—'}</TableCell>
                                <TableCell>{e.userId?.email ?? '—'}</TableCell>
                                <TableCell>{e.userId?.role ?? '—'}</TableCell>
                                <TableCell>{e.step}</TableCell>
                                <TableCell>{e.status}</TableCell>
                                <TableCell>{e.correct}/{e.total}</TableCell>
                                <TableCell>{e.percent.toFixed(1)}%</TableCell>
                                <TableCell>{e.awardedLevel ?? '—'}</TableCell>
                                <TableCell>{new Date(e.updatedAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => onOpenConfirm(e)}>Reset</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o) { setConfirmOpen(false); setSelected(null) } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset exam?</DialogTitle>
                        <DialogDescription>
                            {selected ? (
                                <>
                                    You are about to reset the Step {selected.step} exam for {selected.userId?.name ?? 'this student'} ({selected.userId?.email ?? 'no email'}).
                                    This will remove the selected attempt{selected.step === 1 ? ' and clear any Step 1 lock.' : '.'}
                                </>
                            ) : 'This will remove the selected exam attempt.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" disabled={pending} onClick={() => { setConfirmOpen(false); setSelected(null) }}>Cancel</Button>
                        <Button variant="destructive" disabled={pending} onClick={onConfirm}>{pending ? 'Resetting…' : 'Reset'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
