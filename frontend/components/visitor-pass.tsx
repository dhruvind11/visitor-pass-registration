"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share2, ArrowLeft, CheckCircle2 } from "lucide-react"
import type { VisitorData } from "@/app/page"
import { QRCodeCanvas } from "qrcode.react"

export function VisitorPass({ visitor, onReset }: { visitor: VisitorData; onReset: () => void }) {
  const passRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadPass = () => {
    if (!qrRef.current) return
    const canvas = qrRef.current.querySelector("canvas")
    if (!canvas) return
    setIsDownloading(true)

    try {
      const link = document.createElement("a")
      link.download = `qr-${visitor.visitorId}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Failed to download QR code:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Pass Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

        <div
          ref={passRef}
          className="relative bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-slate-50 w-full max-w-[340px] mx-auto"
        >
          {/* Top Banner */}
          <div className="bg-primary p-6 text-primary-foreground flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tighter">GLOBAL TECH</h2>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase">Exhibition 2026</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-8 space-y-8 text-center bg-linear-to-b from-white to-slate-50">
            {/* Main Info */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black leading-tight tracking-tight">
                {visitor.title} {visitor.firstName} {visitor.lastName}
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-primary uppercase text-xs tracking-wider">{visitor.designation}</p>
                <p className="text-slate-500 font-medium text-sm">{visitor.organization}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div ref={qrRef} className="relative inline-block p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
              <QRCodeCanvas
                value={visitor.visitorId}
                size={140}
                level="H"
                imageSettings={{
                  src: "/abstract-logo.png",
                  x: undefined,
                  y: undefined,
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
            </div>

            {/* ID & Footer */}
            <div className="pt-2">
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mb-1">Visitor ID</p>
              <p className="text-lg font-mono font-black tracking-widest text-primary">{visitor.visitorId}</p>
            </div>
          </div>

          {/* Security Strip */}
          <div className="h-4 bg-linear-to-r from-primary via-accent to-primary opacity-90" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 max-w-sm mx-auto">
        <Button
          onClick={downloadPass}
          disabled={isDownloading}
          className="h-14 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          {isDownloading ? <Download className="w-5 h-5 mr-2 animate-bounce" /> : <Download className="w-5 h-5 mr-2" />}
          PNG Pass
        </Button>
        {/* <Button
          variant="outline"
          className="h-14 rounded-xl font-bold border-2 transition-all active:scale-95 bg-transparent"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Save to Phone
        </Button> */}
        <Button
          variant="ghost"
          onClick={onReset}
          className="sm:col-span-2 h-12 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
