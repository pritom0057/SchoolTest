"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"
import type { Level } from "@/lib/levels"
import { LEVELS } from "@/lib/levels"
import * as svc from "@/lib/services/questions"

export type Option = { key: string; text: string }

export default function CreateForm(props: {
    form: { competency: string; level: Level; text: string; options: Option[]; correctKey: string; tags: string }
    setForm: (f: any) => void
    competencies: Array<{ _id: string; name: string }>
    seedLoading: { comp: boolean; q: boolean; all: boolean }
    setSeedLoading: (next: Partial<{ comp: boolean; q: boolean; all: boolean }>) => void
    onCreated: () => void
}) {
    const { form, setForm, competencies, seedLoading, setSeedLoading, onCreated } = props
    const levels = useMemo(() => LEVELS, [])
    const [open, setOpen] = useState(false)

    const create = async () => {
        const payload = {
            competency: form.competency,
            level: form.level,
            text: form.text,
            options: form.options,
            correctKey: form.correctKey,
            tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        }
        await svc.createQuestion(payload)
        setForm({ competency: "", level: form.level, text: "", options: [{ key: "A", text: "" }, { key: "B", text: "" }], correctKey: "A", tags: "" })
        onCreated()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Question
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create Question</DialogTitle>
                </DialogHeader>
                <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="md:col-span-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                        These controls are for testing only. They seed sample competencies and questions.
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm" disabled={seedLoading.comp} onClick={async () => {
                                setSeedLoading({ comp: true })
                                try {
                                    await svc.seedCompetencies()
                                    toast({ title: "Seeded competencies" })
                                } catch {
                                    toast({ title: "Failed to seed competencies" })
                                } finally {
                                    setSeedLoading({ comp: false })
                                }
                            }}>{seedLoading.comp ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Seeding…</span>) : 'Seed Competencies'}</Button>
                            <Button variant="secondary" size="sm" disabled={seedLoading.q} onClick={async () => {
                                setSeedLoading({ q: true })
                                try {
                                    await svc.seedQuestions()
                                    toast({ title: "Seeded questions" })
                                    onCreated()
                                } catch {
                                    toast({ title: "Failed to seed questions" })
                                } finally {
                                    setSeedLoading({ q: false })
                                }
                            }}>{seedLoading.q ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Seeding…</span>) : 'Seed Questions'}</Button>
                            <Button size="sm" disabled={seedLoading.all} onClick={async () => {
                                setSeedLoading({ all: true })
                                try {
                                    await svc.seedAll()
                                    toast({ title: "Seeded questions and competencies" })
                                    onCreated()
                                } catch {
                                    toast({ title: "Failed to seed all" })
                                } finally {
                                    setSeedLoading({ all: false })
                                }
                            }}>{seedLoading.all ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Seeding…</span>) : 'Seed All'}</Button>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs mb-1">Competency</div>
                        <Select value={form.competency} onValueChange={(v) => setForm({ ...form, competency: v })}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select a competency" /></SelectTrigger>
                            <SelectContent>
                                {competencies.map((c) => (
                                    <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div className="text-xs mb-1">Level</div>
                        <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as Level })}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Level" /></SelectTrigger>
                            <SelectContent>
                                {levels.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-2">
                        <div className="text-xs mb-1">Question</div>
                        <Input className="w-full" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <div className="text-sm font-medium">Options</div>
                        {form.options.map((o, i) => {
                            const resolvedKey = o.key || `OPT${i + 1}`
                            return (
                                <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <Input
                                        className="w-full sm:w-24"
                                        value={o.key}
                                        placeholder={`Key`}
                                        required
                                        onChange={(e) => {
                                            const prevKey = form.options[i].key
                                            const nextKey = e.target.value
                                            const opts = [...form.options]
                                            opts[i] = { ...opts[i], key: nextKey }
                                            const nextState: any = { ...form, options: opts }
                                            if ((prevKey || resolvedKey) === form.correctKey) {
                                                nextState.correctKey = nextKey || resolvedKey
                                            }
                                            setForm(nextState)
                                        }}
                                    />
                                    <Input
                                        className="flex-1"
                                        value={o.text}
                                        placeholder="Option text"
                                        onChange={(e) => {
                                            const opts = [...form.options]
                                            opts[i] = { ...opts[i], text: e.target.value }
                                            setForm({ ...form, options: opts })
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`opt-${i}-correct`}
                                            checked={form.correctKey === resolvedKey}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const opts = [...form.options]
                                                    if (!opts[i].key) opts[i] = { ...opts[i], key: resolvedKey }
                                                    setForm({ ...form, options: opts, correctKey: opts[i].key || resolvedKey })
                                                } else if (form.correctKey === resolvedKey) {
                                                    setForm({ ...form, correctKey: "" })
                                                }
                                            }}
                                        />
                                        <label htmlFor={`opt-${i}-correct`} className="text-xs text-muted-foreground">Correct</label>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setForm({ ...form, options: [...form.options, { key: "", text: "" }] })}>
                                Add Option
                            </Button>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="text-xs mb-1">Tags (comma separated)</div>
                        <Input className="w-full" placeholder="(Optional)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                    </div>
                </div>
                <DialogFooter className="pt-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={async () => { await create(); setOpen(false) }}
                        disabled={!form.competency || !form.text.trim() || !form.correctKey || form.options.some((o) => !o.key || !o.key.trim())}
                    >
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
