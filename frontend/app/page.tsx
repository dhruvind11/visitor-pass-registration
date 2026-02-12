"use client"

import { useState } from "react"
import { RegistrationForm } from "@/components/registration-form"
import { PassLookup } from "@/components/pass-lookup"
import { VisitorPass } from "@/components/visitor-pass"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ticket, BarChart3, QrCode } from "lucide-react"
import Link from "next/link"

export type VisitorData = {
  visitorId: string
  title: string
  firstName: string
  lastName: string
  organization: string
  designation: string
  email: string
  mobile: string
  website?: string
  registrationDate: string
}

export default function RegistrationPage() {
  const [activeVisitor, setActiveVisitor] = useState<VisitorData | null>(null)

  if (activeVisitor) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Registration Successful!</h1>
            <p className="text-muted-foreground">Your digital visitor pass is ready.</p>
          </div>
          <VisitorPass visitor={activeVisitor} onReset={() => setActiveVisitor(null)} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-xl shadow-primary/20">
            <Ticket className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-balance">Global Tech Expo 2026</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Register now to join the world's leading innovators and technology pioneers.
          </p>
        </header>

        {/* Main Content Card */}
        <Card className="border-none shadow-2xl shadow-primary/5 overflow-hidden bg-card/50 backdrop-blur-sm">
          <Tabs defaultValue="register" className="w-full">
            <div className="px-6 pt-6 flex justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:shadow-sm">
                  New Registration
                </TabsTrigger>
                <TabsTrigger value="lookup" className="rounded-lg data-[state=active]:shadow-sm">
                  Find My Pass
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="register" className="p-0 border-none outline-none">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Attendee Information</CardTitle>
                <CardDescription>Fill in your details to generate your exhibition pass</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-10">
                <RegistrationForm onSuccess={setActiveVisitor} />
              </CardContent>
            </TabsContent>

            <TabsContent value="lookup" className="p-0 border-none outline-none">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Retrieve Pass</CardTitle>
                <CardDescription>Enter your details to download your existing pass</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-10 max-w-lg mx-auto">
                <PassLookup onSuccess={setActiveVisitor} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <Link href="/admin" className="w-full">
            <Button
              className="w-full h-14 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all bg-transparent"
              variant="outline"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Admin Panel
            </Button>
          </Link>
          <Link href="/scanner" className="w-full">
            <Button className="w-full h-14 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
              <QrCode className="w-5 h-5 mr-2" />
              QR Scanner
            </Button>
          </Link>
        </div> */}

        {/* Footer info */}
        <footer className="text-center text-sm text-muted-foreground space-y-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">June 15-18</span>
              <span>Event Date</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">NYC Center</span>
              <span>Location</span>
            </div>
          </div>
          <p>© 2026 Global Tech Expo. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
