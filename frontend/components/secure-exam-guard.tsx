"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SecureExamGuard() {
  const [warnings, setWarnings] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault()
      setWarnings((w) => w + 1)
    }
    const onVis = () => {
      setVisible(!document.hidden)
      if (document.hidden) {
        setWarnings((w) => w + 1)
      }
    }
    document.addEventListener("contextmenu", onContext)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      document.removeEventListener("contextmenu", onContext)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  return (
    <div className="mb-4">
      <Alert variant="destructive" role="status" aria-live="polite">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Secure mode</AlertTitle>
        <AlertDescription>
          Right-click and switching tabs are disabled or discouraged during the test. Warnings: {warnings}
          {!visible ? " (Tab inactive)" : ""}
        </AlertDescription>
      </Alert>
    </div>
  )
}
