"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import SecureExamGuard from "@/components/secure-exam-guard"
import Timer from "@/components/timer"
import QuestionCard from "@/components/question-card"
// no local progression reads; backend is source of truth
import * as examsApi from "@/lib/exams"
import { me as apiMe } from "@/lib/api"
import { fetchMe as fetchMeThunk } from "@/store/slices/auth-slice"
// policy and scoring are enforced on the backend; frontend reflects server state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function StepPanel({ step }: { step: 1 | 2 | 3 }) {
    const dispatch = useDispatch()
    const config = useSelector((s: RootState) => s.assessment.config)


    // progression should come from server, not local persisted state
    const [serverLockedStep1, setServerLockedStep1] = useState(false)
    const [serverHighestLevel, setServerHighestLevel] = useState<string | null>(null)
    const [started, setStarted] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [examId, setExamId] = useState<string | null>(null)
    const [questions, setQuestions] = useState<Array<{ id: string; competency: string; level: string; text: string; options: Array<{ key: string; text: string }> }>>([])
    const [myExams, setMyExams] = useState<any[]>([])
    const [totalSecondsOverride, setTotalSecondsOverride] = useState<number | null>(null)
    const [plannedCount, setPlannedCount] = useState<number | null>(null)
    const [plannedSecondsPerQ, setPlannedSecondsPerQ] = useState<number | null>(null)
    const [unlockNextAt, setUnlockNextAt] = useState<number | null>(null)
    const [congratsOpen, setCongratsOpen] = useState(false)
    const answeredCount = useMemo(() => {
        if (!questions.length) return 0
        let n = 0
        for (const q of questions) {
            if (answers[q.id] !== undefined) n++
        }
        return n
    }, [answers, questions])

    const totalSeconds = useMemo(() => {
        const secsPerQ = plannedSecondsPerQ ?? config.secondsPerQuestion
        const count = questions.length > 0 ? questions.length : (plannedCount ?? 0)
        return totalSecondsOverride ?? (count * secsPerQ)
    }, [questions.length, config.secondsPerQuestion, totalSecondsOverride, plannedCount, plannedSecondsPerQ])

    // Derive eligibility and attempt status from backend records
    const hasSubmitted = (s: 1 | 2 | 3) => myExams.some((e: any) => e.step === s && (e.status === 'SUBMITTED' || e.status === 'AUTO_SUBMITTED' || e.status === 'EXPIRED'))
    const unlockedNextFrom = (s: 1 | 2) => myExams.some((e: any) => e.step === s && (e.status === 'SUBMITTED' || e.status === 'AUTO_SUBMITTED') && e.nextStepUnlocked)

    const alreadyAttempted = hasSubmitted(step)
    const canStart =
        (step === 1 && !serverLockedStep1) ||
        (step === 2 && unlockedNextFrom(1)) ||
        (step === 3 && unlockedNextFrom(2))
    const completedThisStep = myExams.some((e: any) => e.step === step && (e.status === 'SUBMITTED' || e.status === 'AUTO_SUBMITTED'))

    // derive submitted summary for this step from server exams
    const serverSubmittedExamForStep = useMemo(() => {
        return myExams.find((e: any) => e.step === step && (e.status === 'SUBMITTED' || e.status === 'AUTO_SUBMITTED'))
    }, [myExams, step])


    const serverSummary = useMemo(() => {
        if (!serverSubmittedExamForStep) return null as null | { total: number; correct: number; percent: number }
        const total = Array.isArray(serverSubmittedExamForStep.questions) ? serverSubmittedExamForStep.questions.length : 0
        const correct = Array.isArray(serverSubmittedExamForStep.attempts) ? serverSubmittedExamForStep.attempts.filter((a: any) => a.isCorrect).length : 0
        const percent = total ? (correct / total) * 100 : 0
        return { total, correct, percent }
    }, [serverSubmittedExamForStep])


    const nextStep: 2 | 3 | null = step === 1 ? 2 : step === 2 ? 3 : null
    const isEligibleForNext = nextStep === 2 ? unlockedNextFrom(1) : nextStep === 3 ? unlockedNextFrom(2) : false

    async function submitNow() {
        if (submitted || !examId) return
        setSubmitted(true)
        try {
            const resp = await examsApi.submit(examId)
            const summary = resp.summary || { total: questions.length, correct: 0, percent: 0 }
            const assignedLevel = resp.data?.awardedLevel as any
            // refresh exams from backend to reflect eligibility/attempts
            let latestExams: any[] = []
            try {
                const res = await examsApi.listMine()
                latestExams = res?.data || []
                setMyExams(latestExams)
            } catch { }
            // refresh lock state from backend policy (post-submit Step 1 may lock user)
            try {
                // Use thunk to hydrate assessment progress and lock state
                // @ts-ignore
                await (dispatch as any)(fetchMeThunk())
            } catch { }
            // also update local server-derived progression
            try {
                const me = await apiMe()
                setServerLockedStep1(!!me?.data?.step1LockedAt)
                setServerHighestLevel(((me?.data?.assessment?.highestLevel as any) ?? null))
            } catch { }
            // Open congratulations dialog ONLY if student is eligible to claim (has any awarded level)
            if (step === 3) {
                const hasAwardNow = Boolean(assignedLevel) || latestExams.some((e: any) => !!e.awardedLevel)
                if (hasAwardNow) setCongratsOpen(true)
            }
        } catch {
            // ignore; UI will reflect best-effort
        }
    }

    useEffect(() => {
        // reset on step change
        setStarted(false)
        setSubmitted(false)
        setAnswers({})
        setExamId(null)
        setQuestions([])
        setTotalSecondsOverride(null)
        setPlannedCount(null)
        setPlannedSecondsPerQ(null)
    }, [step])

    // Sync lock status and eligibility from server
    useEffect(() => {
        (async () => {
            try {
                // @ts-ignore
                await (dispatch as any)(fetchMeThunk())
            } catch {
                // ignore
            }
            // keep local server snapshot for this view
            try {
                const me = await apiMe()
                setServerLockedStep1(!!me?.data?.step1LockedAt)
                setServerHighestLevel(((me?.data?.assessment?.highestLevel as any) ?? null))
            } catch { }
        })()
        // run on mount and when step changes back to 1
    }, [dispatch, step])

    // Fetch planned question count, seconds per question, and dynamic unlock threshold from server
    useEffect(() => {
        (async () => {
            try {
                const r = await examsApi.plan(step)
                const d = r?.data || {}
                setPlannedCount(typeof d.questionCount === 'number' ? d.questionCount : null)
                setPlannedSecondsPerQ(typeof d.secondsPerQuestion === 'number' ? d.secondsPerQuestion : null)
                setUnlockNextAt(typeof d.unlockNextAt === 'number' ? d.unlockNextAt : null)
            } catch {
                setPlannedCount(null)
                setPlannedSecondsPerQ(null)
                setUnlockNextAt(null)
            }
        })()
    }, [step])

    // Load my exams from backend for status/eligibility
    useEffect(() => {
        (async () => {
            try {
                const res = await examsApi.listMine()
                setMyExams(res?.data || [])
            } catch {
                setMyExams([])
            }
        })()
    }, [step])

    // React to admin-side reset broadcasts (if same browser session)
    useEffect(() => {
        const handler = (e: any) => {
            // Always re-hydrate from server to sync lock and eligibility
            // @ts-ignore
            ; (dispatch as any)(fetchMeThunk())
                // also refresh exams after an admin reset
                ; (async () => { try { const res = await examsApi.listMine(); setMyExams(res?.data || []) } catch { } })()
                ; (async () => { try { const me = await apiMe(); setServerLockedStep1(!!me?.data?.step1LockedAt); setServerHighestLevel(((me?.data?.assessment?.highestLevel as any) ?? null)) } catch { } })()
        }
        window.addEventListener('ts-student-updated', handler)
        return () => window.removeEventListener('ts-student-updated', handler)
    }, [dispatch])

    if (serverLockedStep1 && step === 1) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Retake not allowed</AlertTitle>
                <AlertDescription>Per policy, a failed Step 1 cannot be retaken.</AlertDescription>
            </Alert>
        )
    }

    return (
        <>
            <Card className="mt-4">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="cursor-pointer">
                        Step {step} {step === 1 ? "(A1–A2)" : step === 2 ? "(B1–B2)" : "(C1–C2)"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{(questions.length || plannedCount || 0)} questions</Badge>
                        <Badge variant="outline">{(plannedSecondsPerQ ?? config.secondsPerQuestion)} sec/question</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {!started ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You will have a countdown timer. The test auto-submits on expiration. Ensure a stable environment and
                                avoid switching tabs.
                            </p>
                            <Separator />
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm">
                                    Total time: <span className="font-medium">{Math.ceil(totalSeconds / 60)} minutes</span>
                                </div>
                                <Button
                                    disabled={!canStart || completedThisStep}
                                    onClick={async () => {
                                        setStarted(true)
                                        // Start exam on server
                                        const resp = await examsApi.startExam(step)
                                        const data = resp.data
                                        setExamId(data._id)
                                        const mapped = (data.questions || []).map((q: any) => ({
                                            id: q._id,
                                            competency: q.competency,
                                            level: q.level,
                                            text: q.text,
                                            options: (q.options || []).map((o: any) => ({ key: o.key ?? String(o?.text ?? ''), text: o.text ?? String(o) })),
                                        }))
                                        setQuestions(mapped)
                                        // compute time from backend fields if present
                                        const startedAt = data.startedAt ? new Date(data.startedAt).getTime() : null
                                        const expiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : null
                                        if (startedAt && expiresAt && expiresAt > startedAt) {
                                            setTotalSecondsOverride(Math.ceil((expiresAt - startedAt) / 1000))
                                        } else {
                                            setTotalSecondsOverride(null)
                                        }
                                    }}
                                >
                                    Start Step
                                </Button>
                            </div>
                            {alreadyAttempted ? (
                                <Alert>
                                    <ShieldCheck className="h-4 w-4" />
                                    <AlertTitle>Attempt exists</AlertTitle>
                                    <AlertDescription>You have past attempts for this step. You may start a new one if allowed by policy.</AlertDescription>
                                </Alert>
                            ) : null}
                            {completedThisStep ? (
                                <Alert>
                                    <ShieldCheck className="h-4 w-4" />
                                    <AlertTitle>Step completed</AlertTitle>
                                    <AlertDescription>You have already completed this step. Retakes are not allowed.</AlertDescription>
                                </Alert>
                            ) : null}
                            {!canStart ? (
                                <Alert>
                                    <ShieldCheck className="h-4 w-4" />
                                    <AlertTitle>Locked</AlertTitle>
                                    <AlertDescription>
                                        You are not eligible to start this step yet. Complete the previous step with the required score.
                                    </AlertDescription>
                                </Alert>
                            ) : null}
                        </div>
                    ) : (
                        <>
                            <SecureExamGuard />
                            <Timer totalSeconds={totalSeconds} running={!submitted} onExpire={submitNow} />
                            <div className="mt-4 grid gap-4">
                                {questions.map((q, idx) => (
                                    <QuestionCard
                                        key={q.id}
                                        q={q}
                                        index={idx}
                                        value={answers[q.id]}
                                        onChange={async (v) => {
                                            setAnswers((prev) => ({ ...prev, [q.id]: v }))
                                            if (examId) {
                                                try { await examsApi.answer(examId, q.id, v) } catch { }
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            {(submitted || !!serverSubmittedExamForStep) && (
                                <div className="mt-6 space-y-3">
                                    <Separator />
                                    {step === 3 ? (
                                        <Alert>
                                            <ShieldCheck className="h-4 w-4" />
                                            <AlertTitle>Assessment complete</AlertTitle>
                                            <AlertDescription>
                                                {serverSummary ? `You scored ${serverSummary.correct}/${serverSummary.total} (${serverSummary.percent.toFixed(1)}%). ` : null}
                                                {serverHighestLevel ? `Highest level awarded: ${serverHighestLevel}.` : "Results recorded."}
                                            </AlertDescription>
                                        </Alert>
                                    ) : isEligibleForNext ? (
                                        <Alert>
                                            <ShieldCheck className="h-4 w-4" />
                                            <AlertTitle>Eligible for Step {nextStep}</AlertTitle>
                                            <AlertDescription>
                                                {serverSummary ? `You scored ${serverSummary.correct}/${serverSummary.total} (${serverSummary.percent.toFixed(1)}%). ` : ""}
                                                Open the Step {nextStep} tab above to continue.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Not eligible for Step {nextStep}</AlertTitle>
                                            <AlertDescription>
                                                {serverSummary ? `You scored ${serverSummary.correct}/${serverSummary.total} (${serverSummary.percent.toFixed(1)}%). ` : ""}
                                                {typeof unlockNextAt === 'number' ? `A minimum of ${unlockNextAt}% is required to unlock the next step.` : 'You have not met the required score to unlock the next step yet.'}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {answeredCount} / {started ? questions.length : (plannedCount || 0)} answered
                    </div>
                    {started ? (
                        <Button
                            onClick={async () => {
                                await submitNow()
                            }}
                            disabled={submitted}
                        >
                            {submitted ? "Submitted" : "Submit"}
                        </Button>
                    ) : null}
                </CardFooter>
            </Card>
            {/* Congratulations dialog for final step completion */}
            <Dialog open={congratsOpen && step === 3} onOpenChange={setCongratsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Congratulations!</DialogTitle>
                        <DialogDescription>
                            {serverHighestLevel
                                ? `You've completed the assessment. Your highest awarded level is ${serverHighestLevel}.`
                                : `You've completed the assessment. Your results have been recorded.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        {serverHighestLevel ? (
                            <a href="/certificate">
                                <Button>Claim Certificate</Button>
                            </a>
                        ) : null}
                        <Button variant="outline" onClick={() => setCongratsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
