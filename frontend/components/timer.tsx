"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Progress } from "@/components/ui/progress"

export default function Timer({
  totalSeconds,
  running,
  onExpire,
}: {
  totalSeconds: number
  running: boolean
  onExpire: () => void
}) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const started = useRef(false)

  useEffect(() => {
    setRemaining(totalSeconds)
    started.current = false
  }, [totalSeconds])

  useEffect(() => {
    if (!running) return
    if (!started.current) {
      started.current = true
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          onExpire()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, onExpire])

  const pct = useMemo(() => Math.max(0, Math.min(100, (remaining / totalSeconds) * 100)), [remaining, totalSeconds])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60

  return (
    <div aria-live="polite" className="space-y-1">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium">Time Remaining</div>
        <div className="tabular-nums font-semibold">
          {m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
        </div>
      </div>
      <Progress value={pct} />
    </div>
  )
}
