"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, ArrowLeft, Zap, Keyboard, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { API_BASE_URL } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (id: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [hasCamera, setHasCamera] = useState(true)
  const [cameraActive, setCameraActive] = useState(true)
  const [scannedCodes, setScannedCodes] = useState<string[]>([])
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [manualId, setManualId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastScannedRef = useRef<string | null>(null)
  const lastScannedTimeRef = useRef<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    if (!cameraActive) return

    let stream: MediaStream | null = null

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Camera access denied:", err)
        setHasCamera(false)
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraActive])

  // QR code scanning loop
  useEffect(() => {
    if (!cameraActive || !hasCamera) return

    let animationFrameId: number
    const SCAN_COOLDOWN_MS = 3000 // 3 second cooldown between scans of the same code

    const scanFrame = () => {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (ctx) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          })

          if (code && code.data) {
            const now = Date.now()
            const isDuplicate =
              lastScannedRef.current === code.data &&
              now - lastScannedTimeRef.current < SCAN_COOLDOWN_MS

            if (!isDuplicate) {
              lastScannedRef.current = code.data
              lastScannedTimeRef.current = now
              handleQRScan(code.data)
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame)
    }

    // Small delay to let the camera warm up
    const timerId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(scanFrame)
    }, 500)

    return () => {
      clearTimeout(timerId)
      cancelAnimationFrame(animationFrameId)
    }
  }, [cameraActive, hasCamera])

  // Function to call the scan API
  const scanVisitor = async (visitorId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitorId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to verify visitor")
      }

      toast({
        title: "Visitor Verified!",
        description: `Pass ${visitorId} verified successfully.`,
      })

      addScanHistory(visitorId)
      onScan(visitorId)
      return true
    } catch (error) {
      console.error("Scan error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to verify visitor pass."
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = async () => {
    if (manualId.trim()) {
      const success = await scanVisitor(manualId.trim())
      if (success) {
        setManualId("")
        setManualEntryOpen(false)
      }
    }
  }

  // Handler for QR code scan (called when QR is detected)
  const handleQRScan = async (scannedId: string) => {
    await scanVisitor(scannedId)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setManualEntryOpen(true)
    }
  }

  const addScanHistory = (id: string) => {
    setScannedCodes((prev) => [id, ...prev].slice(0, 5))
  }

  const handleScanHistoryClick = async (id: string) => {
    await scanVisitor(id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Security Checkpoint</h1>
            <p className="text-xs text-slate-400">Global Tech Expo 2026</p>
          </div>
        </div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {cameraActive && hasCamera ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Enhanced Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-cyan-500/30" />
                <div className="absolute inset-1 rounded-3xl border border-cyan-500/50" />
                
                {/* Corner markers */}
                <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-cyan-500" />
                <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-cyan-500" />
                <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-cyan-500" />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-cyan-500" />
                
                {/* Main scanning frame */}
                <div className="w-72 h-72 rounded-2xl border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50" />
              </div>
            </div>

            {/* Top Text */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-20">
              <p className="text-white text-xl font-bold drop-shadow-lg">Scan Visitor Pass</p>
              <p className="text-cyan-300 text-sm mt-1 drop-shadow-lg">Position QR code in frame</p>
            </div>

            {/* Scanning indicator */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
              <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">Camera Not Available</p>
              <p className="text-sm text-slate-400 mt-2">Please grant camera permissions or use manual entry</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-6 py-6 space-y-4">
        {/* Main action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => setCameraActive(!cameraActive)}
            variant={cameraActive ? "default" : "outline"}
            className={`rounded-xl font-semibold py-6 transition-all ${
              cameraActive
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Camera className="w-5 h-5 mr-2" />
            {cameraActive ? "Stop Camera" : "Start Camera"}
          </Button>
          
          <Button
            onClick={() => setManualEntryOpen(true)}
            variant="outline"
            className="rounded-xl font-semibold py-6 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Keyboard className="w-5 h-5 mr-2" />
            Enter ID Manually
          </Button>

          {/* <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="rounded-xl font-semibold py-6 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Image
          </Button>
          
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /> */}
        </div>

        {/* Scan History */}
        {scannedCodes.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Scans</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {scannedCodes.map((code, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScanHistoryClick(code)}
                  className="text-left px-4 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-sm font-mono text-cyan-400 transition-all border border-slate-600 hover:border-cyan-500/50"
                >
                  <div className="text-xs text-slate-400">ID</div>
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-cyan-500" />
              Enter Visitor ID
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Visitor ID</label>
              <Input
                placeholder="e.g., GTE-123456"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 py-5 text-base"
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-400">Enter the unique visitor ID from their pass or registration</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setManualEntryOpen(false)}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualSubmit}
              disabled={!manualId.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Pass"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
