"use client"

import { BarChart3, Users, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"

type AdminView = "dashboard" | "visitors" | "logs"

interface SidebarProps {
  activeView: AdminView
  onViewChange: (view: AdminView) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "visitors", label: "Visitors", icon: Users },
    // { id: "logs", label: "Entry Logs", icon: LogOut },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="rounded-lg">
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative w-64 h-screen bg-card border-r border-border transition-transform duration-300 z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-black text-primary">Expo 2026</h1>
          <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id as AdminView)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
              Back to Registration
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground text-center">v1.0 • June 2026</p>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setIsOpen(false)} />}
    </>
  )
}
