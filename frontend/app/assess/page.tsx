"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AssessmentHeader from "../../components/assessment/header"
import StepPanel from "../../components/assessment/step-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <AssessmentRoot />
    </main>
  )
}

function AssessmentRoot() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const router = useRouter()
  useEffect(() => {
    if (user?.role === "ADMIN") router.replace("/admin")
    else if (user?.role === "SUPERVISOR") router.replace("/supervisor")
  }, [user?.role, router])
  const progress = useSelector((s: RootState) => s.assessment.progress)
  const [activeTab, setActiveTab] = useState<string>(() => `step${Math.max(1, Math.min(3, progress.eligibleStep || 1))}`)
  const prevEligibleRef = useRef(progress.eligibleStep)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [unlockedStep, setUnlockedStep] = useState<number | null>(null)

  // Keep active tab in sync with current eligibility on first load
  useEffect(() => {
    setActiveTab(`step${Math.max(1, Math.min(3, progress.eligibleStep || 1))}`)
    prevEligibleRef.current = progress.eligibleStep
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When eligibility increases (after submit), switch tab and show dialog
  useEffect(() => {
    const prev = prevEligibleRef.current || 1
    const curr = progress.eligibleStep || 1
    if (curr > prev) {
      const stepKey = `step${Math.max(1, Math.min(3, curr))}`
      setActiveTab(stepKey)
      setUnlockedStep(curr)
      setUnlockDialogOpen(true)
    }
    prevEligibleRef.current = curr
  }, [progress.eligibleStep])

  if (user?.role === "ADMIN" || user?.role === "SUPERVISOR") {
    return null
  }

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Please log in to start the assessment.</p>
          <div className="flex gap-2">
            <a href="/login">
              <Button>Login</Button>
            </a>
            <a href="/register">
              <Button variant="outline">Register</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <AssessmentHeader />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="step1">Step 1 (A1–A2)</TabsTrigger>
          <TabsTrigger value="step2" disabled={progress.eligibleStep < 2}>
            Step 2 (B1–B2)
          </TabsTrigger>
          <TabsTrigger value="step3" disabled={progress.eligibleStep < 3}>
            Step 3 (C1–C2)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="step1">
          <StepPanel step={1} />
        </TabsContent>
        <TabsContent value="step2">
          <StepPanel step={2} />
        </TabsContent>
        <TabsContent value="step3">
          <StepPanel step={3} />
        </TabsContent>
      </Tabs>

      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {unlockedStep ? `Step ${unlockedStep} unlocked` : "Next step unlocked"}
            </DialogTitle>
            <DialogDescription>
              {unlockedStep && unlockedStep <= 3
                ? `You're now eligible to take Step ${unlockedStep}. We've switched you to the Step ${unlockedStep} tab. You can review info and start when ready.`
                : "You're now eligible for the next step."}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
