"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiFetch, login as backendLogin, logout as backendLogout } from "@/lib/api"

export default function DemoApi() {
    const [output, setOutput] = useState<string>("")

    async function doLogin() {
        try {
            const res = await backendLogin("john@example.com", "123456")
            setOutput(JSON.stringify(res, null, 2))
        } catch (e: any) {
            setOutput(`Login failed: ${e?.message ?? e}`)
        }
    }

    async function callMe() {
        try {
            const res = await apiFetch("/api/users/me")
            const data = await res.json()
            setOutput(JSON.stringify(data, null, 2))
        } catch (e: any) {
            setOutput(`Request failed: ${e?.message ?? e}`)
        }
    }

    async function doLogout() {
        await backendLogout()
        setOutput("Logged out and cleared access token (cookie cleared by server)")
    }

    return (
        <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Backend API demo (uses HttpOnly refresh cookie)</div>
            <div className="flex gap-2">
                <Button size="sm" onClick={doLogin}>Backend Login</Button>
                <Button size="sm" variant="secondary" onClick={callMe}>GET /users/me</Button>
                <Button size="sm" variant="outline" onClick={doLogout}>Logout</Button>
            </div>
            <pre className="mt-2 max-h-64 overflow-auto text-xs bg-muted/40 p-2 rounded">{output}</pre>
        </div>
    )
}
