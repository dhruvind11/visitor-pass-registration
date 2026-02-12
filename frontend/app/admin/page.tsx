"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Dashboard } from "@/components/admin/dashboard"
import { VisitorsList } from "@/components/admin/visitors-list"
import { EntryLogsList } from "@/components/admin/entry-logs"
import { initializeDummyData } from "@/lib/storage"

type AdminView = "dashboard" | "visitors" | "logs"

export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>("dashboard")

  useEffect(() => {
    initializeDummyData()
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "visitors" && <VisitorsList />}
        {activeView === "logs" && <EntryLogsList />}
      </main>
    </div>
  )
}
