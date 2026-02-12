"use client"

import { useEffect, useState } from "react"
import { type VisitorData } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, XCircle, ArrowLeft } from "lucide-react"
import { API_BASE_URL } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface ScanResultProps {
  visitorId: string
  onReset: () => void
}

export function ScanResult({ visitorId, onReset }: ScanResultProps) {
  const [visitor, setVisitor] = useState<VisitorData | null>(null)
  const [status, setStatus] = useState<"success" | "duplicate" | "invalid">("invalid")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
 
  useEffect(() => {
    const fetchVisitorData = async () => {
      try {

        const response = await fetch(`${API_BASE_URL}/visitors/id/${visitorId.trim()}`)
        const { data } = await response.json()
        if (!response.ok) {
          setStatus("invalid")
          toast({
            title: "Invalid Pass",
            description: data.message || "Visitor not found.",
            variant: "destructive",
          })
        } else if (data.checkedIn) {
          setStatus("duplicate")
          setVisitor(data)
          toast({
            title: "Already Checked In",
            description: `${data.firstName} ${data.lastName} has already checked in.`,
            variant: "destructive",
          })
        } else {
          setStatus("success")
          setVisitor(data)
          toast({
            title: "Valid Pass",
            description: `Welcome, ${data.firstName} ${data.lastName}!`,
          })
        }
      } catch (error) {
        console.error("Error fetching visitor:", error)
        setStatus("invalid")
        toast({
          title: "Error",
          description: "Failed to verify visitor pass.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVisitorData()
  }, [visitorId, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-lg font-bold">Processing scan...</p>
        </div>
      </div>
    )
  }

  const getResultLayout = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          title: "Valid Pass",
          subtitle: "Entry Granted",
        }
      case "duplicate":
        return {
          icon: AlertCircle,
          color: "text-amber-600",
          bgColor: "bg-amber-500/10",
          title: "Already Checked In",
          subtitle: "Duplicate Entry",
        }
      case "invalid":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-500/10",
          title: "Invalid Pass",
          subtitle: "Access Denied",
        }
    }
  }

  const layout = getResultLayout()
  const Icon = layout.icon

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Status Card */}
        <Card className="border-none shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className={`${layout.bgColor} p-12 flex justify-center`}>
              <Icon className={`${layout.color} w-24 h-24`} />
            </div>
            <div className="p-8 text-center space-y-2">
              <h1 className="text-3xl font-black">{layout.title}</h1>
              <p className="text-muted-foreground">{layout.subtitle}</p>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Info */}
        {visitor && status !== "invalid" && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {visitor.firstName} {visitor.lastName}
              </CardTitle>
              <CardDescription className="text-center">{visitor.organization}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 pb-4 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Designation</p>
                <p className="font-bold">{visitor.designation}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Visitor ID</p>
                <p className="font-mono text-primary font-bold">{visitor.visitorId}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Button onClick={onReset} size="lg" className="w-full rounded-xl font-bold h-14">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Scan Next
        </Button>
      </div>
    </div>
  )
}
