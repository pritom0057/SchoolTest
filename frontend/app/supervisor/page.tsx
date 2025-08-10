"use client"

import { ReduxProvider } from "@/components/redux-provider"
import SupervisorPanel from "@/components/supervisor/exam-overview"

export default function Page() {
  return (
    <ReduxProvider>
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-6xl px-4 py-8">
          <SupervisorPanel />
        </main>
      </div>
    </ReduxProvider>
  )
}

