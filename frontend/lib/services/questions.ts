import { apiFetch } from "@/lib/api"
import type { Level } from "@/lib/levels"

export type Option = { key: string; text: string }
export type Question = {
    _id: string
    competency: string
    level: Level
    text: string
    options: Option[]
    correctKey: string
    active: boolean
    tags?: string[]
}

export type Competency = { _id: string; name: string; active?: boolean }

export type Paginated<T> = {
    data: T[]
    page: number
    limit: number
    total: number
    pages: number
}

export async function listQuestions(params: { page: number; limit: number; level?: Level | "ALL" }) {
    const qs = new URLSearchParams()
    qs.set("page", String(params.page))
    qs.set("limit", String(params.limit))
    if (params.level && params.level !== "ALL") qs.set("level", params.level)
    const res = await apiFetch(`/api/questions?${qs.toString()}`)
    if (!res.ok) throw new Error("Failed to load questions")
    return res.json() as Promise<Paginated<Question>>
}

export async function createQuestion(payload: {
    competency: string
    level: Level
    text: string
    options: Option[]
    correctKey: string
    tags?: string[]
}) {
    const res = await apiFetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to create question")
    try {
        return await res.json()
    } catch {
        return null
    }
}

export async function updateQuestion(id: string, payload: Partial<Omit<Question, "_id" | "active">> & { active?: boolean }) {
    const res = await apiFetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to update question")
    return res.json().catch(() => null)
}

export async function setQuestionActive(id: string, active: boolean) {
    const res = await apiFetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
    })
    if (!res.ok) throw new Error("Failed to update status")
}

export async function deleteQuestion(id: string) {
    const res = await apiFetch(`/api/questions/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete question")
}

export async function listCompetencies(activeOnly = true) {
    const res = await apiFetch("/api/competencies")
    if (!res.ok) throw new Error("Failed to load competencies")
    const data = await res.json()
    const arr: Competency[] = (data?.data ?? [])
    return activeOnly ? arr.filter(c => c.active !== false) : arr
}

export async function seedCompetencies() {
    const res = await apiFetch("/api/seed/competencies", { method: "POST" })
    if (!res.ok) throw new Error("Failed to seed competencies")
}
export async function seedQuestions() {
    const res = await apiFetch("/api/seed/questions", { method: "POST" })
    if (!res.ok) throw new Error("Failed to seed questions")
}
export async function seedAll() {
    const res = await apiFetch("/api/seed/all", { method: "POST" })
    if (!res.ok) throw new Error("Failed to seed all")
}
