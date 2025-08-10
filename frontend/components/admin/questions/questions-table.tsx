"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import type { Level } from "@/lib/levels"

export type Row = {
    _id: string
    competency: string
    level: Level
    text: string
    options: Array<{ key: string; text: string }>
    correctKey: string
    active: boolean
    tags?: string[]
}

export default function QuestionsTable(props: {
    rows: Row[]
    loading: boolean
    total: number
    page: number
    pages: number
    pageSize: number
    filterLevel: Level | "ALL"
    levels: Level[]
    onEdit: (q: Row) => void
    onToggleActive: (id: string, active: boolean) => void
    onDelete: (q: Row) => void
    setPage: (p: number | ((p: number) => number)) => void
    setPageSize: (n: number) => void
    setFilterLevel: (l: Level | "ALL") => void
}) {
    const { rows, loading, total, page, pages, pageSize, filterLevel, levels, onEdit, onToggleActive, onDelete, setPage, setPageSize, setFilterLevel } = props

    return (
        <div className="h-full">
            <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="text-xs">Filter by level</div>
                    <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as any)}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="All levels" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            {levels.map((l) => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs">Per page</div>
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                        <SelectTrigger className="w-[120px]"><SelectValue placeholder="20" /></SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map(n => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="sticky top-0 bg-background z-10">
                            <TableHead className="min-w-[140px]">Competency</TableHead>
                            <TableHead className="w-[72px]">Level</TableHead>
                            <TableHead className="min-w-[360px]">Text</TableHead>
                            <TableHead className="min-w-[220px]">Correct</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading questions…</span>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10">
                                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="text-sm font-medium">No questions found</div>
                                        <div className="text-xs text-muted-foreground">Try adjusting filters or seeding sample data.</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && rows.map((q) => (
                            <TableRow key={q._id}>
                                <TableCell>{q.competency}</TableCell>
                                <TableCell>{q.level}</TableCell>
                                <TableCell className="max-w-[520px] truncate" title={q.text}>{q.text}</TableCell>
                                <TableCell className="max-w-[360px] truncate" title={`${q.correctKey}: ${(q.options || []).find((o: any) => o.key === q.correctKey)?.text ?? ''}`}>
                                    {q.correctKey}
                                    {(() => { const m = (q.options || []).find((o: any) => o.key === q.correctKey); return m?.text ? ` — ${m.text}` : '' })()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={q.active ? 'default' : 'secondary'}>{q.active ? 'Active' : 'Inactive'}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button className="cursor-pointer" variant="ghost" size="sm" onClick={() => onEdit(q)} aria-label="Edit question" title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button className="cursor-pointer" variant="ghost" size="sm" onClick={() => onToggleActive(q._id, !q.active)} aria-label={q.active ? 'Disable' : 'Enable'} title={q.active ? 'Disable' : 'Enable'}>
                                            {q.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button className="cursor-pointer" variant="ghost" size="sm" onClick={() => onDelete(q)} aria-label="Delete question" title="Delete">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">Page {page} of {pages} • Total {total}</div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</Button>
                </div>
            </div>
        </div>
    )
}
