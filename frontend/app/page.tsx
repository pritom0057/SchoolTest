"use client"

import Navbar from "@/components/navbar"
import { ReduxProvider } from "@/components/redux-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import Link from "next/link"
import { useEffect } from "react"
import { fetchMe as fetchMeThunk } from "@/store/slices/auth-slice"

export default function Page() {
  return (
    <ReduxProvider>
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Hero />
          <Dashboard />
        </main>
      </div>
    </ReduxProvider>
  )
}

function Hero() {
  const { user } = useSelector((s: RootState) => s.auth)
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPERVISOR"
  return (
    <section className="mb-8 grid items-center gap-6 rounded-lg border bg-muted/30 p-6 md:grid-cols-2">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Competency Assessment Platform</h1>
        <p className="text-muted-foreground">
          Assess and certify your digital skills across Test_School levels A1 to C2 in a secure, timed 3-step process.
        </p>
        {!isStaff ? (
          <div className="flex gap-2">
            <Link href="/assess">
              <Button>Start Assessment</Button>
            </Link>
            <Link href="/certificate">
              <Button variant="outline">View Certificate</Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2">
            {user?.role === "ADMIN" ? (
              <Link href="/admin">
                <Button>Go to Admin</Button>
              </Link>
            ) : null}
            {user?.role === "SUPERVISOR" ? (
              <Link href="/supervisor">
                <Button>Go to Supervisor</Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
      <div className="rounded-md bg-white p-4 shadow-sm">
        <img
          src="/placeholder.svg?height=300&width=500"
          alt="Assessment illustration"
          className="h-auto w-full rounded-md"
        />
      </div>
    </section>
  )
}

function Dashboard() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const { attempts, progress, highestLevel, config } = useSelector((s: RootState) => s.assessment)
  const perStep = (user as any)?.assessment?.perStep
  useEffect(() => {
    // Fetch latest profile so we show server-derived progression
    // @ts-ignore
    dispatch(fetchMeThunk())
  }, [dispatch])
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPERVISOR"

  if (isStaff) {
    return (
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-muted-foreground">Use your dedicated console.</div>
            {user?.role === "ADMIN" ? (
              <Link href="/admin">
                <Button>Open Admin Console</Button>
              </Link>
            ) : null}
            {user?.role === "SUPERVISOR" ? (
              <Link href="/supervisor">
                <Button>Open Supervisor Console</Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">Name: {user?.name ?? "—"}</div>
            <div className="text-sm">Role: {user?.role ?? "—"}</div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            Status: {isAuthenticated && user ? (
              <Badge variant="secondary">Logged in</Badge>
            ) : (
              <Badge variant="outline">Guest</Badge>
            )}
          </div>
          <div className="text-sm">Name: {user?.name ?? "—"}</div>
          <div className="text-sm">Role: {user?.role ?? "—"}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Eligible Step: {progress.eligibleStep}</div>
          <div>Step 1: {perStep?.step1?.attempted && typeof perStep?.step1?.percent === 'number' ? `${perStep.step1.percent.toFixed(1)}%` : "Not attempted"}</div>
          <div>Step 2: {perStep?.step2?.attempted && typeof perStep?.step2?.percent === 'number' ? `${perStep.step2.percent.toFixed(1)}%` : "Not attempted"}</div>
          <div>Step 3: {perStep?.step3?.attempted && typeof perStep?.step3?.percent === 'number' ? `${perStep.step3.percent.toFixed(1)}%` : "Not attempted"}</div>
          {progress.lockedStep1 ? <Badge variant="destructive">Step 1 locked</Badge> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Highest Level: {highestLevel ?? "—"}</div>
          <div>Timer: {config.secondsPerQuestion} sec/question</div>
          <Link href="/certificate">
            <Button variant="outline" className="w-full bg-transparent">
              Generate Certificate
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}
