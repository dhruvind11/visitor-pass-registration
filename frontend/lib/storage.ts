// localStorage utilities for managing visitor data and entry logs
export type VisitorData = {
  _id?: string
  visitorId: string
  title: string
  firstName: string
  lastName: string
  organization: string
  designation: string
  email: string
  mobile: string
  website?: string
  createdAt: string
  status: string
  checkedIn: boolean
  checkInTime?: string
}

export type EntryLog = {
  id: string
  visitorId: string
  visitorName: string
  timestamp: string
  status: "success" | "duplicate" | "invalid"
  scanLocation?: string
}

// Initialize dummy data
export function initializeDummyData() {
  if (typeof window === "undefined") return

  const existingVisitors = localStorage.getItem("expo_visitors")
  const existingLogs = localStorage.getItem("expo_entry_logs")

  if (!existingVisitors) {
    const dummyVisitors: VisitorData[] = [
      {
        id: "GTE-123456",
        title: "Mr",
        firstName: "John",
        lastName: "Smith",
        organization: "Tech Corp",
        designation: "CEO",
        email: "john.smith@techcorp.com",
        mobile: "+1 234 567 8900",
        website: "https://techcorp.com",
        registrationDate: "2026-06-01",
        checkedIn: true,
        checkedInTime: "2026-06-15 09:30:00",
      },
      {
        id: "GTE-234567",
        title: "Ms",
        firstName: "Sarah",
        lastName: "Johnson",
        organization: "Innovate Labs",
        designation: "Product Lead",
        email: "sarah.j@innovatelabs.com",
        mobile: "+1 234 567 8901",
        website: "https://innovatelabs.com",
        registrationDate: "2026-06-02",
        checkedIn: false,
      },
      {
        id: "GTE-345678",
        title: "Dr",
        firstName: "Michael",
        lastName: "Chen",
        organization: "AI Solutions Inc",
        designation: "Chief Scientist",
        email: "m.chen@aisolutions.com",
        mobile: "+1 234 567 8902",
        registrationDate: "2026-06-03",
        checkedIn: true,
        checkedInTime: "2026-06-15 10:15:00",
      },
      {
        id: "GTE-456789",
        title: "Ms",
        firstName: "Emily",
        lastName: "Rodriguez",
        organization: "Digital Future",
        designation: "Engineering Manager",
        email: "emily.r@digitalfuture.com",
        mobile: "+1 234 567 8903",
        registrationDate: "2026-06-04",
        checkedIn: false,
      },
      {
        id: "GTE-567890",
        title: "Mr",
        firstName: "David",
        lastName: "Park",
        organization: "Cloud Dynamics",
        designation: "Senior Architect",
        email: "david.p@clouddynamics.com",
        mobile: "+1 234 567 8904",
        registrationDate: "2026-06-05",
        checkedIn: true,
        checkedInTime: "2026-06-15 11:00:00",
      },
    ]
    localStorage.setItem("expo_visitors", JSON.stringify(dummyVisitors))
  }

  if (!existingLogs) {
    const dummyLogs: EntryLog[] = [
      {
        id: "LOG-001",
        visitorId: "GTE-123456",
        visitorName: "John Smith",
        timestamp: "2026-06-15 09:30:00",
        status: "success",
        scanLocation: "Main Gate",
      },
      {
        id: "LOG-002",
        visitorId: "GTE-345678",
        visitorName: "Michael Chen",
        timestamp: "2026-06-15 10:15:00",
        status: "success",
        scanLocation: "Main Gate",
      },
      {
        id: "LOG-003",
        visitorId: "GTE-123456",
        visitorName: "John Smith",
        timestamp: "2026-06-15 14:30:00",
        status: "duplicate",
        scanLocation: "Side Entrance",
      },
      {
        id: "LOG-004",
        visitorId: "GTE-567890",
        visitorName: "David Park",
        timestamp: "2026-06-15 11:00:00",
        status: "success",
        scanLocation: "Main Gate",
      },
      {
        id: "LOG-005",
        visitorId: "UNKNOWN",
        visitorName: "Unknown",
        timestamp: "2026-06-15 13:45:00",
        status: "invalid",
        scanLocation: "Main Gate",
      },
    ]
    localStorage.setItem("expo_entry_logs", JSON.stringify(dummyLogs))
  }
}

export function getVisitors(): VisitorData[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("expo_visitors")
  return data ? JSON.parse(data) : []
}

export function getVisitor(id: string): VisitorData | null {
  const visitors = getVisitors()
  return visitors.find((v) => v.id === id) || null
}

export function updateVisitor(id: string, updates: Partial<VisitorData>) {
  const visitors = getVisitors()
  const index = visitors.findIndex((v) => v.id === id)
  if (index !== -1) {
    visitors[index] = { ...visitors[index], ...updates }
    localStorage.setItem("expo_visitors", JSON.stringify(visitors))
  }
}

export function deleteVisitor(id: string) {
  const visitors = getVisitors()
  const filtered = visitors.filter((v) => v.id !== id)
  localStorage.setItem("expo_visitors", JSON.stringify(filtered))
}

export function getEntryLogs(): EntryLog[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("expo_entry_logs")
  return data ? JSON.parse(data) : []
}

export function addEntryLog(log: Omit<EntryLog, "id">) {
  const logs = getEntryLogs()
  const newLog: EntryLog = {
    ...log,
    id: `LOG-${Date.now()}`,
  }
  logs.push(newLog)
  localStorage.setItem("expo_entry_logs", JSON.stringify(logs))
  return newLog
}

export function getTodayStats() {
  const logs = getEntryLogs()
  const today = new Date().toLocaleDateString()
  const todayLogs = logs.filter((log) => new Date(log.timestamp).toLocaleDateString() === today)

  const visitors = getVisitors()
  const checkedInToday = visitors.filter((v) => v.checkedIn).length

  return {
    totalRegistered: visitors.length,
    totalCheckinsToday: todayLogs.length,
    uniqueCheckinsToday: new Set(todayLogs.map((l) => l.visitorId)).size,
    lastScanTime: todayLogs.length > 0 ? todayLogs[todayLogs.length - 1].timestamp : null,
  }
}
