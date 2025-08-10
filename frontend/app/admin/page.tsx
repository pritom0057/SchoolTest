"use client"

import { ReduxProvider } from "@/components/redux-provider"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UsersTab from "@/components/admin/users-tab"
import QuestionsTab from "@/components/admin/questions-tab"
import CompetenciesTab from "@/components/admin/competencies-tab"
import PolicyTab from "@/components/admin/policy-tab"
import ExamsTab from "@/components/admin/exams-tab"

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <AdminPanel />
      </main>
    </div>
  )
}

function AdminPanel() {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access restricted</AlertTitle>
        <AlertDescription>Admin role is required to view this page.</AlertDescription>
      </Alert>
    )
  }
  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="competencies">Competencies</TabsTrigger>
        <TabsTrigger value="exams">Exams</TabsTrigger>
        {/* <TabsTrigger value="policy">Eligibility</TabsTrigger> */}
      </TabsList>
      {/* Testing seed controls moved into Questions tab for clarity */}
      <TabsContent value="users">
        <UsersTab />
      </TabsContent>
      <TabsContent value="questions">
        <QuestionsTab />
      </TabsContent>
      <TabsContent value="competencies">
        <CompetenciesTab />
      </TabsContent>
      {/* <TabsContent value="policy">
        <PolicyTab />
      </TabsContent> */}
      <TabsContent value="exams">
        <ExamsTab />
      </TabsContent>
    </Tabs>
  )
}

