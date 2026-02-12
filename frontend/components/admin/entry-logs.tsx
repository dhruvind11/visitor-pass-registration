"use client"

import { useEffect, useState } from "react"
import { getEntryLogs, type EntryLog } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"

export function EntryLogsList() {
  const [logs, setLogs] = useState<EntryLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<EntryLog[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "duplicate" | "invalid">("all")

  useEffect(() => {
    setLogs(getEntryLogs())
  }, [])

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0]
      const dateMatch = logDate === selectedDate
      const statusMatch = statusFilter === "all" || log.status === statusFilter
      return dateMatch && statusMatch
    })

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setFilteredLogs(filtered)
  }, [logs, selectedDate, statusFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "duplicate":
        return <AlertCircle className="w-5 h-5 text-amber-600" />
      case "invalid":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "Valid Pass"
      case "duplicate":
        return "Already Checked In"
      case "invalid":
        return "Invalid Pass"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-700"
      case "duplicate":
        return "bg-amber-500/10 text-amber-700"
      case "invalid":
        return "bg-red-500/10 text-red-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black">Entry Logs</h1>
        <p className="text-muted-foreground mt-2">Monitor all scan activity and check-ins</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 h-12 bg-muted/30"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {["all", "success", "duplicate", "invalid"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  size="sm"
                  className="rounded-lg capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-semibold">
          Showing {filteredLogs.length} log entries for {selectedDate}
        </p>
        {filteredLogs.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No logs found for the selected filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="border-none shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-bold">{log.visitorName}</p>
                        <p className="text-xs text-muted-foreground">{log.visitorId}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          log.status,
                        )}`}
                      >
                        {getStatusLabel(log.status)}
                      </span>
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      {log.scanLocation && <p className="text-xs text-muted-foreground">{log.scanLocation}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
