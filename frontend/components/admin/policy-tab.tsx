"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as api from "@/lib/api"

export default function PolicyTab() {
    const [doc, setDoc] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const load = () => {
        setLoading(true)
        api.apiFetch('/api/policy').then(r => r.json()).then(j => setDoc(j?.data ?? null)).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const save = async () => {
        await api.apiFetch('/api/policy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc || {}) })
        load()
    }

    const ensure = (path: ('step1' | 'step2' | 'step3')) => {
        setDoc((d: any) => ({ ...(d || {}), [path]: d?.[path] || { thresholds: [{ min: 0, award: null }, { min: 50, award: null }, { min: 75, award: null }], lockStep1Below: 0 } }))
    }

    return (
        <Card>
            <CardHeader><CardTitle>Eligibility Policy {loading && '(Loading...)'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {(['step1', 'step2', 'step3'] as const).map((s) => (
                    <div key={s} className="space-y-2">
                        <div className="font-medium">{s.toUpperCase()}</div>
                        <Button variant="outline" size="sm" onClick={() => ensure(s)}>Ensure Section</Button>
                        <div className="grid gap-2 md:grid-cols-3">
                            {(doc?.[s]?.thresholds ?? []).map((t: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input type="number" className="w-24" value={t.min ?? 0} onChange={(e) => {
                                        const v = Number(e.target.value); setDoc((d: any) => { const nd = { ...(d || {}) }; nd[s].thresholds[i].min = v; return { ...nd }; })
                                    }} />
                                    <Select value={t.award ?? 'NONE'} onValueChange={(v) => {
                                        setDoc((d: any) => { const nd = { ...(d || {}) }; nd[s].thresholds[i].award = (v === 'NONE' ? null : v); return { ...nd }; })
                                    }}>
                                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Award level" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">None</SelectItem>
                                            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                        {s === 'step1' ? (
                            <div className="flex items-center gap-2">
                                <div className="text-sm">Lock Step 1 below</div>
                                <Input type="number" className="w-24" value={doc?.step1?.lockStep1Below ?? 0} onChange={(e) => setDoc((d: any) => ({ ...(d || {}), step1: { ...(d?.step1 || {}), lockStep1Below: Number(e.target.value) } }))} />
                            </div>
                        ) : null}
                    </div>
                ))}
                <div>
                    <Button onClick={save}>Save Policy</Button>
                </div>
            </CardContent>
        </Card>
    )
}
