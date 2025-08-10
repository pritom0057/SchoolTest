import { COMPETENCIES } from "./competencies"
import type { Level } from "./levels"
import { LEVELS } from "./levels"

export type Question = {
  id: string
  competency: string
  level: Level
  text: string
  options: string[]
  correctIndex: number
}

// Deterministic pseudo content generator
function makeQuestion(competency: string, level: Level, idx: number): Question {
  const base = `${competency} - ${level}`
  return {
    id: `q_${level}_${idx}_${competency.replace(/\s+/g, "_")}`,
    competency,
    level,
    text: `In the context of ${base}, which option is most appropriate?`,
    options: [
      `Basic concept related to ${base}`,
      `Intermediate concept related to ${base}`,
      `Advanced concept related to ${base}`,
      `Irrelevant concept unrelated to ${base}`,
    ],
    // Vary the correct index deterministically
    correctIndex: idx % 3, // 0..2
  }
}

// 22 competencies x 6 levels = 132 questions
export function generateQuestionBank(): Question[] {
  const all: Question[] = []
  let idx = 0
  for (const level of LEVELS) {
    for (const comp of COMPETENCIES) {
      all.push(makeQuestion(comp, level, idx))
      idx++
    }
  }
  return all
}

export const QUESTIONS_PER_STEP = 4

// For each step, we need 44 questions from two levels: one per competency per level.
export function getQuestionsForStep(step: 1 | 2 | 3): Question[] {
  const [l1, l2] =
    step === 1 ? (["A1", "A2"] as const) :
      step === 2 ? (["B1", "B2"] as const) :
        (["C1", "C2"] as const)

  const bank = generateQuestionBank()

  const byComp = (level: Level, take: number) =>
    COMPETENCIES.slice(0, take)
      .map((comp) => bank.find((q) => q.level === level && q.competency === comp)!)
      .filter(Boolean)

  // 4 total: 2 from each level
  const perLevel = Math.max(1, Math.floor(QUESTIONS_PER_STEP / 2))
  return [...byComp(l1, perLevel), ...byComp(l2, perLevel)].slice(0, QUESTIONS_PER_STEP)
}
