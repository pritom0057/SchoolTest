import type { Level } from "./levels"

export type StepResult = {
  step: 1 | 2 | 3
  total: number
  correct: number
  percent: number
  assignedLevel?: Level
  proceedNext?: boolean
  lockedStep1?: boolean
  retainedFrom?: Level // if remain at previous
}

export function evaluateStep1(total: number, correct: number): StepResult {
  const percent = (correct / total) * 100
  if (percent < 25) {
    return { step: 1, total, correct, percent, lockedStep1: true }
  } else if (percent < 50) {
    return { step: 1, total, correct, percent, assignedLevel: "A1" }
  } else if (percent < 75) {
    return { step: 1, total, correct, percent, assignedLevel: "A2" }
  } else {
    return { step: 1, total, correct, percent, assignedLevel: "A2", proceedNext: true }
  }
}

export function evaluateStep2(total: number, correct: number): StepResult {
  const percent = (correct / total) * 100
  if (percent < 25) {
    return { step: 2, total, correct, percent, retainedFrom: "A2", assignedLevel: "A2" }
  } else if (percent < 50) {
    return { step: 2, total, correct, percent, assignedLevel: "B1" }
  } else if (percent < 75) {
    return { step: 2, total, correct, percent, assignedLevel: "B2" }
  } else {
    return { step: 2, total, correct, percent, assignedLevel: "B2", proceedNext: true }
  }
}

export function evaluateStep3(total: number, correct: number): StepResult {
  const percent = (correct / total) * 100
  if (percent < 25) {
    return { step: 3, total, correct, percent, retainedFrom: "B2", assignedLevel: "B2" }
  } else if (percent < 50) {
    return { step: 3, total, correct, percent, assignedLevel: "C1" }
  } else {
    return { step: 3, total, correct, percent, assignedLevel: "C2" }
  }
}

export function highestLevelFromResults(levels: Level[]): Level | undefined {
  const order: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"]
  let best: Level | undefined
  let bestIdx = -1
  for (const lvl of levels) {
    const idx = order.indexOf(lvl)
    if (idx > bestIdx) {
      best = lvl
      bestIdx = idx
    }
  }
  return best
}
