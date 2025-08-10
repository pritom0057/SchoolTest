import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Level } from "@/lib/levels"
import { highestLevelFromResults } from "@/lib/scoring"

export type Attempt = {
  step: 1 | 2 | 3
  total: number
  correct: number
  percent: number
  assignedLevel?: Level
  timestamp: number
}

type AssessmentState = {
  config: {
    secondsPerQuestion: number // default 60
  }
  attempts: {
    step1?: Attempt
    step2?: Attempt
    step3?: Attempt
  }
  progress: {
    lockedStep1: boolean
    eligibleStep: 1 | 2 | 3 // next step user can attempt
  }
  highestLevel?: Level
}

const initialState: AssessmentState = {
  config: {
    secondsPerQuestion: 60,
  },
  attempts: {},
  progress: {
    lockedStep1: false,
    eligibleStep: 1,
  },
  highestLevel: undefined,
}

export const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    hydrateAssessment(state, action: PayloadAction<Partial<AssessmentState>>) {
      return { ...state, ...action.payload }
    },
    setLockedStep1(state, action: PayloadAction<boolean>) {
      state.progress.lockedStep1 = !!action.payload
    },
    setSecondsPerQuestion(state, action: PayloadAction<number>) {
      state.config.secondsPerQuestion = Math.max(10, Math.min(600, action.payload))
    },
    recordAttempt(state, action: PayloadAction<Attempt>) {
      const att = action.payload
      if (att.step === 1) state.attempts.step1 = att
      if (att.step === 2) state.attempts.step2 = att
      if (att.step === 3) state.attempts.step3 = att
      // Do not change progress.eligibleStep here; backend/policy decides unlocks.
      // Lock state for Step 1 is also enforced server-side; client will sync from /me after submit.

      const awarded: Level[] = [
        state.attempts.step1?.assignedLevel,
        state.attempts.step2?.assignedLevel,
        state.attempts.step3?.assignedLevel,
      ].filter(Boolean) as Level[]
      state.highestLevel = highestLevelFromResults(awarded)
    },
    resetAll(state) {
      state.attempts = {}
      state.progress = { lockedStep1: false, eligibleStep: 1 }
      state.highestLevel = undefined
    },
  },
})

export const { hydrateAssessment, setLockedStep1, setSecondsPerQuestion, recordAttempt, resetAll } = assessmentSlice.actions
export default assessmentSlice.reducer
