"use client"

import { ReduxProvider } from "@/components/redux-provider"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  return (
    <ReduxProvider>
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-4xl px-4 py-8">
          <CertificatePanel />
        </main>
      </div>
    </ReduxProvider>
  )
}

function CertificatePanel() {
  const { user } = useSelector((s: RootState) => s.auth)
  const router = useRouter()
  useEffect(() => {
    if (user?.role === "ADMIN") router.replace("/admin")
    else if (user?.role === "SUPERVISOR") router.replace("/supervisor")
  }, [user?.role, router])
  if (user?.role === "ADMIN" || user?.role === "SUPERVISOR") return null
  const { highestLevel, attempts } = useSelector((s: RootState) => s.assessment)

  if (!highestLevel || !user) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Complete at least one step to generate your certificate.</p>
          <a href="/assess">
            <Button>Go to Assessment</Button>
          </a>
        </CardContent>
      </Card>
    )
  }

  const date = new Date().toLocaleDateString()

  return (
    <div className="space-y-6">
      <Card id="certificate" className="mx-auto max-w-2xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Digital Competency Certificate</CardTitle>
          <div className="text-sm text-muted-foreground">Test_School Competency Assessment Platform</div>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-lg">
            Awarded to <span className="font-semibold">{user.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="text-lg">
            Achieved Level: <Badge className="text-base">{highestLevel}</Badge>
          </div>
          <div className="text-sm">
            Issued on: <span className="font-medium">{date}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Summary: Step1{" "}
            {attempts.step1 ? `${attempts.step1.percent.toFixed(1)}% (${attempts.step1.assignedLevel ?? "—"})` : "—"},
            Step2{" "}
            {attempts.step2 ? `${attempts.step2.percent.toFixed(1)}% (${attempts.step2.assignedLevel ?? "—"})` : "—"},
            Step3{" "}
            {attempts.step3 ? `${attempts.step3.percent.toFixed(1)}% (${attempts.step3.assignedLevel ?? "—"})` : "—"}
          </div>
        </CardContent>
      </Card>
      <div className="mx-auto flex max-w-2xl justify-end">
        <Button
          variant="outline"
          onClick={() => {
            window.print()
          }}
        >
          Print / Save as PDF
        </Button>
      </div>
    </div>
  )
}
