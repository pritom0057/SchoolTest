"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import CreateForm from "@/components/admin/questions/create-form"
import QuestionsTable from "@/components/admin/questions/questions-table"
import * as svc from "@/lib/services/questions"
import { LEVELS } from "@/lib/levels"

export default function QuestionsTab() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [competencies, setCompetencies] = useState<any[]>([])
    const [filterLevel, setFilterLevel] = useState<'ALL' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('ALL')
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(20)
    const [form, setForm] = useState({ competency: "", level: "A1", text: "", options: [{ key: "A", text: "" }, { key: "B", text: "" }], correctKey: "A", tags: "" })
    const [editOpen, setEditOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ competency: "", level: "A1", text: "", options: [{ key: "A", text: "" }, { key: "B", text: "" }], correctKey: "A", tags: "" })
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selectedToDelete, setSelectedToDelete] = useState<any | null>(null)
    const levels = useMemo(() => LEVELS, [])
    const [seedCompLoading, setSeedCompLoading] = useState(false)
    const [seedQLoading, setSeedQLoading] = useState(false)
    const [seedAllLoading, setSeedAllLoading] = useState(false)

    const load = () => {
        setLoading(true)
        svc
            .listQuestions({ page, limit: pageSize, level: filterLevel })
            .then((j) => { setRows(j?.data ?? []); setPages(j?.pages ?? 1); setTotal(j?.total ?? 0) })
            .finally(() => setLoading(false))
    }
    const loadCompetencies = () => {
        svc
            .listCompetencies()
            .then((arr) => setCompetencies(arr))
            .catch(() => setCompetencies([]))
    }
    useEffect(() => { load(); loadCompetencies() }, [])
    useEffect(() => { setPage(1) }, [filterLevel])
    useEffect(() => { setPage(1) }, [pageSize])
    useEffect(() => { load() }, [filterLevel, page, pageSize])

    const create = async () => {
        const payload = {
            competency: form.competency,
            level: form.level as any,
            text: form.text,
            options: form.options,
            correctKey: form.correctKey,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }
        await svc.createQuestion(payload)
        setForm({ competency: "", level: form.level, text: "", options: [{ key: "A", text: "" }, { key: "B", text: "" }], correctKey: "A", tags: "" })
        load()
    }

    const toggleActive = async (id: string, active: boolean) => {
        await svc.setQuestionActive(id, active)
        setRows((rows) => rows.map((q) => (q._id === id ? { ...q, active } : q)))
    }

    const openEdit = (q: any) => {
        setEditId(q._id)
        setEditForm({
            competency: q.competency || "",
            level: q.level || "A1",
            text: q.text || "",
            options: (q.options && q.options.length ? q.options : [{ key: "A", text: "" }, { key: "B", text: "" }]).map((o: any) => ({ key: o.key || "", text: o.text || "" })),
            correctKey: q.correctKey || "",
            tags: Array.isArray(q.tags) ? q.tags.join(", ") : (q.tags || ""),
        })
        setEditOpen(true)
    }

    const saveEdit = async () => {
        if (!editId) return
        const payload = {
            competency: editForm.competency,
            level: editForm.level as any,
            text: editForm.text,
            options: editForm.options,
            correctKey: editForm.correctKey,
            tags: editForm.tags ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }
        await svc.updateQuestion(editId, payload)
        setEditOpen(false)
        setEditId(null)
        load()
    }

    const onOpenDelete = (q: any) => {
        setSelectedToDelete(q)
        setDeleteOpen(true)
    }

    const onConfirmDelete = async () => {
        if (!selectedToDelete) return
        setDeleting(true)
        try {
            await svc.deleteQuestion(selectedToDelete._id)
            setRows((rows) => rows.filter((r) => r._id !== selectedToDelete._id))
            toast({ title: 'Question deleted' })
            setDeleteOpen(false)
            setSelectedToDelete(null)
        } catch (e: any) {
            toast({ title: 'Delete failed', description: e?.message ?? 'Unable to delete question' })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Sidebar: compact create form */}
            <CreateForm
                form={form as any}
                setForm={setForm}
                competencies={competencies}
                seedLoading={{ comp: seedCompLoading, q: seedQLoading, all: seedAllLoading }}
                setSeedLoading={(next) => {
                    if (typeof next.comp === 'boolean') setSeedCompLoading(next.comp)
                    if (typeof next.q === 'boolean') setSeedQLoading(next.q)
                    if (typeof next.all === 'boolean') setSeedAllLoading(next.all)
                    if (next.comp === false) loadCompetencies()
                    if (next.q === false || next.all === false) load()
                }}
                onCreated={() => load()}
            />


            {/* Main: existing questions with improved visuals */}
            <section className="flex-1">
                <Card className="h-full">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle>Existing Questions {loading ? "(Loading...)" : `(${total})`}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <QuestionsTable
                            rows={rows as any}
                            loading={loading}
                            total={total}
                            page={page}
                            pages={pages}
                            pageSize={pageSize}
                            filterLevel={filterLevel as any}
                            levels={levels as any}
                            onEdit={(q) => openEdit(q)}
                            onToggleActive={(id, active) => toggleActive(id, active)}
                            onDelete={(q) => onOpenDelete(q)}
                            setPage={setPage}
                            setPageSize={setPageSize}
                            setFilterLevel={(l) => setFilterLevel(l as any)}
                        />
                    </CardContent>
                </Card>
            </section>

            {/* Delete dialog */}
            <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o) { setDeleteOpen(false); setSelectedToDelete(null) } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete question?</DialogTitle>
                        <DialogDescription>
                            {selectedToDelete ? (
                                <>
                                    You are about to permanently delete this question:
                                    <br />
                                    <span className="text-muted-foreground">{selectedToDelete.text}</span>
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

            {/* Edit dialog */}
            <Dialog open={editOpen} onOpenChange={(o) => setEditOpen(o)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs mb-1">Competency</div>
                            <Select
                                value={editForm.competency}
                                onValueChange={(v) => setEditForm({ ...editForm, competency: v })}
                            >
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select a competency" /></SelectTrigger>
                                <SelectContent>
                                    {competencies.map((c: any) => (
                                        <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="text-xs mb-1">Level</div>
                            <Select value={editForm.level} onValueChange={(v) => setEditForm({ ...editForm, level: v })}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Level" /></SelectTrigger>
                                <SelectContent>
                                    {levels.map((l) => (
                                        <SelectItem key={l} value={l}>{l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="text-xs mb-1">Question</div>
                            <Input value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Options</div>
                            {editForm.options.map((o, i) => {
                                const resolvedKey = o.key || `OPT${i + 1}`
                                return (
                                    <div key={i} className="flex items-center gap-2">
                                        <Input
                                            className="w-20"
                                            value={o.key}
                                            placeholder={`Key (${resolvedKey})`}
                                            required
                                            onChange={(e) => {
                                                const prevKey = editForm.options[i].key
                                                const nextKey = e.target.value
                                                const opts = [...editForm.options]
                                                opts[i] = { ...opts[i], key: nextKey }
                                                const nextState: any = { ...editForm, options: opts }
                                                if ((prevKey || resolvedKey) === editForm.correctKey) {
                                                    nextState.correctKey = nextKey || resolvedKey
                                                }
                                                setEditForm(nextState)
                                            }}
                                        />
                                        <Input
                                            className="flex-1"
                                            value={o.text}
                                            placeholder="Option text"
                                            onChange={(e) => {
                                                const opts = [...editForm.options]
                                                opts[i] = { ...opts[i], text: e.target.value }
                                                setEditForm({ ...editForm, options: opts })
                                            }}
                                        />
                                        <div className="flex items-center gap-1">
                                            <Checkbox
                                                id={`edit-opt-${i}-correct`}
                                                checked={editForm.correctKey === resolvedKey}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        const opts = [...editForm.options]
                                                        if (!opts[i].key) {
                                                            opts[i] = { ...opts[i], key: resolvedKey }
                                                        }
                                                        setEditForm({ ...editForm, options: opts, correctKey: opts[i].key || resolvedKey })
                                                    } else {
                                                        if (editForm.correctKey === resolvedKey) {
                                                            setEditForm({ ...editForm, correctKey: "" })
                                                        }
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`edit-opt-${i}-correct`} className="text-xs text-muted-foreground">
                                                Correct
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditForm({ ...editForm, options: [...editForm.options, { key: "", text: "" }] })}
                                >
                                    Add Option
                                </Button>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs mb-1">Tags (comma separated)</div>
                            <Input placeholder="(Optional)" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={saveEdit} disabled={!editForm.competency || !editForm.text.trim() || !editForm.correctKey || editForm.options.some((o) => !o.key || !o.key.trim())}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
