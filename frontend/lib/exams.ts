import { apiFetch } from '@/lib/api'

export async function startExam(step: 1 | 2 | 3) {
    const res = await apiFetch(`/api/exams/step/${step}/start`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to start exam')
    return res.json()
}

export async function answer(examId: string, questionId: string, selectedKey: string) {
    const res = await apiFetch(`/api/exams/${examId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedKey }),
    })
    if (!res.ok) throw new Error('Failed to save answer')
    return res.json()
}

export async function submit(examId: string) {
    const res = await apiFetch(`/api/exams/${examId}/submit`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to submit exam')
    return res.json()
}

export async function getExam(examId: string) {
    const res = await apiFetch(`/api/exams/${examId}`)
    if (!res.ok) throw new Error('Failed to get exam')
    return res.json()
}

export async function listAll() {
    const res = await apiFetch(`/api/exams/all`)
    if (!res.ok) throw new Error('Failed to list exams')
    return res.json()
}

export async function resetExam(examId: string) {
    const res = await apiFetch(`/api/exams/${examId}/reset`, { method: 'POST' })
    if (!res.ok) {
        let msg = 'Failed to reset exam'
        try {
            const data = await res.json()
            msg = data?.message || data?.error || msg
        } catch { /* ignore */ }
        throw new Error(msg)
    }
    return res.json()
}

export async function listMine() {
    const res = await apiFetch(`/api/exams`)
    if (!res.ok) throw new Error('Failed to list my exams')
    return res.json()
}

export async function plan(step: 1 | 2 | 3) {
    const res = await apiFetch(`/api/exams/step/${step}/plan`)
    if (!res.ok) throw new Error('Failed to plan exam')
    return res.json()
}
