"use client"

import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { fetchMe as fetchMeThunk } from "@/store/slices/auth-slice"
import * as examsApi from "@/lib/exams"

export default function AssessmentHeader() {
    const dispatch = useDispatch()
    const { attempts, progress } = useSelector((s: RootState) => s.assessment)
    const perStep = useSelector((s: RootState) => (s as any)?.auth?.user?.assessment?.perStep)
    const [counts, setCounts] = useState<{ s1: number | null; s2: number | null; s3: number | null }>({ s1: null, s2: null, s3: null })
    useEffect(() => {
        // sync latest profile so header shows server numbers
        // @ts-ignore
        dispatch(fetchMeThunk())
            ; (async () => {
                try {
                    const [p1, p2, p3] = await Promise.all([
                        examsApi.plan(1 as any), examsApi.plan(2 as any), examsApi.plan(3 as any)
                    ])
                    setCounts({ s1: p1?.data?.questionCount ?? null, s2: p2?.data?.questionCount ?? null, s3: p3?.data?.questionCount ?? null })
                } catch {
                    setCounts({ s1: null, s2: null, s3: null })
                }
            })()
    }, [dispatch])
    return (
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
                <h2 className="text-xl font-semibold">3-Step Assessment</h2>
                <p className="text-sm text-muted-foreground">
                    {counts.s1 && counts.s2 && counts.s3
                        ? `Questions per step: ${counts.s1}, ${counts.s2}, ${counts.s3}.`
                        : `Questions are determined dynamically from the database.`}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={perStep?.step1?.attempted || attempts.step1 ? "secondary" : "outline"}>
                    Step 1: {perStep?.step1?.attempted && typeof perStep?.step1?.percent === 'number' ? `${perStep.step1.percent.toFixed(1)}%` : "Pending"}
                </Badge>
                <Badge variant={perStep?.step2?.attempted || attempts.step2 ? "secondary" : "outline"}>
                    Step 2: {perStep?.step2?.attempted && typeof perStep?.step2?.percent === 'number' ? `${perStep.step2.percent.toFixed(1)}%` : "Pending"}
                </Badge>
                <Badge variant={perStep?.step3?.attempted || attempts.step3 ? "secondary" : "outline"}>
                    Step 3: {perStep?.step3?.attempted && typeof perStep?.step3?.percent === 'number' ? `${perStep.step3.percent.toFixed(1)}%` : "Pending"}
                </Badge>
                {progress.lockedStep1 ? <Badge variant="destructive">Step 1 locked</Badge> : null}
            </div>
        </div>
    )
}
