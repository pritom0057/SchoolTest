"use client"

import { Provider } from "react-redux"
import { store } from "@/store/store"
import { type ReactNode, useEffect } from "react"
import { hydrateAuth } from "@/store/slices/auth-slice"
import { hydrateAssessment, resetAll } from "@/store/slices/assessment-slice"
import { setAccessToken } from "@/lib/api"
import * as examsApi from "@/lib/exams"

// Persist basic slices to localStorage on any store change (client only)
function usePersistStore() {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      try {
        const state = store.getState() as any
        // Keep API client token in sync
        setAccessToken(state.auth?.accessToken ?? null)
        const toPersist = {
          auth: state.auth,
          assessment: {
            config: state.assessment.config,
            attempts: state.assessment.attempts,
            progress: state.assessment.progress,
            highestLevel: state.assessment.highestLevel,
          },
        }
        localStorage.setItem("ts-assessment-state", JSON.stringify(toPersist))
      } catch {
        // ignore
      }
    })
    return () => unsubscribe()
  }, [])
}

// Hydrate from localStorage AFTER mount to keep server/client initial render identical
function useHydrateOnMount() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ts-assessment-state")
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.auth) {
        store.dispatch(hydrateAuth(parsed.auth))
        // Restore in-memory access token for api client
        setAccessToken(parsed.auth.accessToken ?? null)
      }
      if (parsed.assessment) {
        store.dispatch(hydrateAssessment(parsed.assessment))
      }
    } catch {
      // ignore
    }
  }, [])
}

// Reconcile persisted assessment with server truth (e.g., after admin reset)
function useReconcileWithServer() {
  useEffect(() => {
    let canceled = false
    const reconcile = async () => {
      try {
        const state: any = store.getState()
        const role = state?.auth?.user?.role
        // Only reconcile assessment for students. Admin/Supervisor should not be affected.
        if (role !== 'STUDENT') return
        // If server has no exams for this user, clear local attempts/state
        const resp = await examsApi.listMine()
        const rows = resp?.data || []
        if (!canceled && Array.isArray(rows) && rows.length === 0) {
          store.dispatch(resetAll())
          // Do not remove entire persisted key to avoid dropping auth; persistence hook will rewrite cleared assessment
        }
      } catch {
        // ignore
      }
    }
    reconcile()
    const handler = () => { reconcile() }
    window.addEventListener('ts-student-updated', handler)
    return () => { canceled = true; window.removeEventListener('ts-student-updated', handler) }
  }, [])
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  useHydrateOnMount()
  useReconcileWithServer()
  usePersistStore()
  return <Provider store={store}>{children}</Provider>
}
