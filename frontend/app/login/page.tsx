"use client"

import { ReduxProvider } from "@/components/redux-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { loginUser, verifyOtp as verifyOtpThunk } from "@/store/slices/auth-slice"
import { useState } from "react"
import type { RootState } from "@/store/store"

export default function Page() {
  return (
    <ReduxProvider>
      <div className="min-h-screen bg-white">
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2">
          <LoginPanel />
          <Aside />
        </main>
      </div>
    </ReduxProvider>
  )
}

function LoginPanel() {
  const dispatch = useDispatch()
  const router = useRouter()
  const emailJustRegistered = useSelector((s: RootState) => s.auth.emailJustRegistered)
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated)
  const user = useSelector((s: RootState) => s.auth.user)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)
  const selectedEmail = emailJustRegistered ?? verifyEmail ?? undefined

  function getErrorMeta(msg: string | null | undefined, context: 'login' | 'verify'): { title: string; desc?: string } | null {
    if (!msg) return null
    const m = msg.toLowerCase()
    if (context === 'login') {
      if (m.includes('not verified')) return { title: 'Account not verified', desc: 'We sent a new verification code to your email/phone. Enter it below to continue.' }
      if (m.includes('invalid')) return { title: 'Invalid email or password', desc: 'Double-check your credentials and try again.' }
      return { title: 'Login failed', desc: msg }
    } else {
      if (m.includes('expired') || m.includes('invalid')) return { title: 'Invalid or expired code', desc: 'Please request a new code by attempting to log in again.' }
      return { title: 'Verification failed', desc: msg }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in with your email and password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!(emailJustRegistered || needsVerification) ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            {error ? (
              <Alert variant="destructive">
                {(() => { const meta = getErrorMeta(error, 'login'); return meta ? (<><AlertTitle>{meta.title}</AlertTitle>{meta.desc ? <AlertDescription>{meta.desc}</AlertDescription> : null}</>) : null })()}
              </Alert>
            ) : null}
            <Button
              className="w-full"
              onClick={async () => {
                setError(null)
                try {
                  // @ts-ignore
                  const result = await dispatch(loginUser({ email, password })).unwrap()
                  const role = result?.me?.data?.role
                  if (role === "ADMIN") router.push("/admin")
                  else if (role === "SUPERVISOR") router.push("/supervisor")
                  else router.push("/")
                } catch (e: any) {
                  const msg = e?.message ?? 'Login failed'
                  setError(msg)
                  if (/(not verified)/i.test(msg)) {
                    setNeedsVerification(true)
                    setVerifyEmail(email)
                  }
                }
              }}
            >
              Continue
            </Button>
            {isAuthenticated ? (
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  if (user?.role === "ADMIN") router.push("/admin")
                  else if (user?.role === "SUPERVISOR") router.push("/supervisor")
                  else router.push("/")
                }}
              >
                Go to Dashboard
              </Button>
            ) : null}
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Register
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm">
              We sent a verification code to <span className="font-medium">{selectedEmail}</span>. Enter the 6-digit
              code we sent via SMS or Email.
            </p>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            </div>
            {error ? (
              <Alert variant="destructive">
                {(() => { const meta = getErrorMeta(error, 'verify'); return meta ? (<><AlertTitle>{meta.title}</AlertTitle>{meta.desc ? <AlertDescription>{meta.desc}</AlertDescription> : null}</>) : null })()}
              </Alert>
            ) : null}
            <Button
              className="w-full"
              onClick={async () => {
                setError(null)
                try {
                  // @ts-ignore
                  await dispatch(verifyOtpThunk({ email: selectedEmail!, otp: code })).unwrap()
                  // After verification, show login form
                  setNeedsVerification(false)
                  setVerifyEmail(null)
                } catch (e: any) {
                  setError(e?.message ?? 'Verification failed')
                }
              }}
            >
              Verify & Continue
            </Button>
            <Button
              className="w-full"
              variant="ghost"
              onClick={() => { setNeedsVerification(false); setVerifyEmail(null); setCode(""); setError(null) }}
            >
              Back to Login
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Aside() {
  return (
    <div className="hidden rounded-lg border bg-muted/30 p-6 md:block">
      <h3 className="mb-2 text-lg font-semibold">About</h3>
      <p className="text-sm text-muted-foreground">
        This is a frontend-only prototype implementing a 3-step timed assessment, certification logic, and role-based UI
        (Admin, Student, Supervisor) using Next.js, TypeScript, Redux Toolkit, shadcn/ui, and Tailwind CSS.
      </p>
      <img src="/placeholder.svg?height=240&width=480" alt="Login illustration" className="mt-4 rounded-md" />
    </div>
  )
}
