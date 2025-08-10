"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
type ViewQuestion = { id: string; competency: string; level: string; text: string; options: Array<{ key: string; text: string }> }

export default function QuestionCard({
  q,
  value,
  onChange,
  index,
}: {
  q: ViewQuestion
  value: string | undefined
  onChange: (v: string) => void
  index: number
}) {
  return (
    <Card role="group" aria-labelledby={`q-title-${q.id}`}>
      <CardHeader>
        <CardTitle id={`q-title-${q.id}`} className="text-base">
          Q{index + 1}. {q.text}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          Competency: {q.competency} • Level: {q.level}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange} className="grid gap-2">
          {q.options.map((opt, i) => {
            const id = `${q.id}_${i}`
            const val = opt.key || String(i)
            return (
              <div
                key={id}
                className={`flex items-center gap-3 rounded-md border p-3 ${value === val ? "bg-muted" : ""}`}
              >
                <RadioGroupItem id={id} value={val} />
                <Label htmlFor={id} className="text-sm leading-relaxed">
                  {opt.text}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
