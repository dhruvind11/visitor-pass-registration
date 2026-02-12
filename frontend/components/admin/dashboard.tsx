"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, LogIn, Clock, TrendingUp } from "lucide-react"

export function Dashboard() {
  const [stats, setStats] = useState({
    totalRegisteredVisitors: 0,
    totalEntriesToday: 0,
    lastScan: null as { time: string; visitorName: string } | null,
    checkInRate: "0%",
    avgScansPerVisitor: 0,
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/visitors/dashboard`)
        const result = await response.json()

        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      }
    }

    fetchDashboardStats()
  }, [])

  const cards = [
    {
      title: "Total Registered Visitors",
      value: stats.totalRegisteredVisitors,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Entries Today",
      value: stats.totalEntriesToday,
      icon: LogIn,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Last Scan",
      value: stats.lastScan
        ? `${new Date(stats.lastScan.time).toLocaleTimeString()}`
        : "—",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600",
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of expo registration and check-in activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>System status and metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Check-in Rate</p>
              <p className="text-2xl font-bold">{stats.checkInRate}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Avg Scans per Visitor</p>
              <p className="text-2xl font-bold">{stats.avgScansPerVisitor}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
