"use client"

import { ReduxProvider } from "@/components/redux-provider"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { registerUser as registerUserThunk, verifyOtp as verifyOtpThunk } from "@/store/slices/auth-slice"
import { useState } from "react"
import { useRouter } from "next/navigation"
// uses Redux thunk for API calls

export default function Page() {
  return (
    <ReduxProvider>
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-6xl px-4 py-8">
          <RegisterPanel />
        </main>
      </div>
    </ReduxProvider>
  )
}

function RegisterPanel() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState<string | null>(null)
  const [awaitingOtp, setAwaitingOtp] = useState(false)
  const [otpInput, setOtpInput] = useState("")

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Register to start your competency assessment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
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
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +1 555 123 4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          className="w-full"
          onClick={async () => {
            setError(null)
            setOtp(null)
            try {
              // Dispatch thunk to call backend and set emailJustRegistered in store
              // @ts-ignore
              const res = await dispatch(registerUserThunk({ name, email, password, phone: phone || undefined })).unwrap()
              const serverOtp = res?.server?.data?.otp as string | undefined
              if (serverOtp) setOtp(serverOtp)
              setAwaitingOtp(true)
              setOtpInput("")
            } catch (e: any) {
              setError(e?.message ?? "Registration failed")
            }
          }}
        >
          Register
        </Button>
        {!awaitingOtp ? (
          <p className="text-xs text-muted-foreground">We will send an OTP to your Email or Phone (SMS) for verification after registration.</p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-sm">
              <p className="mb-1">We sent a verification code to <span className="font-medium">{email}</span>.</p>
              {otp ? (
                <>
                  <p className="text-xs text-muted-foreground">(Dev only) Your code:</p>
                  <p className="text-lg font-mono tracking-wider">{otp}</p>
                </>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">In production, the code will be delivered via SMS or Email.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input id="otp" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="123456" />
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                setError(null)
                try {
                  // @ts-ignore
                  await dispatch(verifyOtpThunk({ email, otp: otpInput })).unwrap()
                  // On success, go to login
                  setAwaitingOtp(false)
                  setOtp(null)
                  setOtpInput("")
                  // Optionally prefill login page; just navigate for now
                  router.push("/login")
                } catch (e: any) {
                  setError(e?.message ?? 'Verification failed')
                }
              }}
            >
              Verify & Continue
            </Button>
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
