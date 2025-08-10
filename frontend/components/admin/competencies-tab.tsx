"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import * as api from "@/lib/api"

export default function CompetenciesTab() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [editOpen, setEditOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ name: string; description?: string; active: boolean }>({ name: "", description: "", active: true })
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selectedToDelete, setSelectedToDelete] = useState<any | null>(null)

    const load = () => {
        setLoading(true)
        api.apiFetch('/api/competencies').then(r => r.json()).then(j => setRows(j?.data ?? [])).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const create = async () => {
        await api.apiFetch('/api/competencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) })
        setName(""); setDescription(""); load()
        try { toast({ title: 'Competency created' }) } catch { }
    }
    const toggle = async (id: string, active: boolean) => {
        await api.apiFetch(`/api/competencies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) })
        setRows(rows => rows.map(c => c._id === id ? { ...c, active } : c))
    }

    const openEdit = (c: any) => {
        setEditId(c._id)
        setEditForm({ name: c.name ?? '', description: c.description ?? '', active: !!c.active })
        setEditOpen(true)
    }
    const saveEdit = async () => {
        if (!editId) return
        const res = await api.apiFetch(`/api/competencies/${editId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editForm.name, description: editForm.description, active: editForm.active })
        })
        if (!res.ok) {
            try { toast({ title: 'Update failed' }) } catch { }
            return
        }
        const j = await res.json()
        setRows(rows => rows.map(r => r._id === editId ? j.data : r))
        setEditOpen(false)
        setEditId(null)
        try { toast({ title: 'Competency updated' }) } catch { }
    }

    const onOpenDelete = (c: any) => { setSelectedToDelete(c); setDeleteOpen(true) }
    const onConfirmDelete = async () => {
        if (!selectedToDelete) return
        setDeleting(true)
        try {
            const res = await api.apiFetch(`/api/competencies/${selectedToDelete._id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            setRows(rows => rows.filter(r => r._id !== selectedToDelete._id))
            try { toast({ title: 'Competency deleted' }) } catch { }
            setDeleteOpen(false)
            setSelectedToDelete(null)
        } catch (e: any) {
            try { toast({ title: 'Delete failed', description: e?.message ?? 'Unable to delete' }) } catch { }
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle>Create Competency</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <div className="text-xs mb-1">Name</div>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <div className="text-xs mb-1">Description</div>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <Button onClick={create} disabled={!name.trim()}>Create</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Competencies {loading ? '(Loading...)' : `(${rows.length})`}</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((c: any) => (
                                <TableRow key={c._id}>
                                    <TableCell>{c.name}</TableCell>
                                    <TableCell className="max-w-[360px] truncate" title={c.description}>{c.description ?? '—'}</TableCell>
                                    <TableCell>{c.active ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="default" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                                            <Button variant="outline" size="sm" onClick={() => toggle(c._id, !c.active)}>{c.active ? 'Disable' : 'Enable'}</Button>
                                            <Button variant="destructive" size="sm" onClick={() => onOpenDelete(c)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Edit dialog */}
            <Dialog open={editOpen} onOpenChange={(o) => setEditOpen(o)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Competency</DialogTitle>
                        <DialogDescription>Update name, description, and active status.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs mb-1">Name</div>
                            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        </div>
                        <div>
                            <div className="text-xs mb-1">Description</div>
                            <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="edit-active" checked={!!editForm.active} onCheckedChange={(v) => setEditForm({ ...editForm, active: !!v })} />
                            <label htmlFor="edit-active" className="text-sm">Active</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={saveEdit} disabled={!editForm.name.trim()}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Delete confirm */}
            <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o) { setDeleteOpen(false); setSelectedToDelete(null) } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete competency?</DialogTitle>
                        <DialogDescription>
                            {selectedToDelete ? (
                                <>
                                    You are about to delete:
                                    <br />
                                    <span className="text-muted-foreground">{selectedToDelete.name}</span>
                                </>
                            ) : 'This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" disabled={deleting} onClick={() => { setDeleteOpen(false); setSelectedToDelete(null) }}>Cancel</Button>
                        <Button variant="destructive" disabled={deleting} onClick={onConfirmDelete}>{deleting ? 'Deleting…' : 'Delete'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
