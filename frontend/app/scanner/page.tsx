"use client"

import { useEffect, useState } from "react"
import { QRScanner } from "@/components/scanner/qr-scanner"
import { ScanResult } from "@/components/scanner/scan-result"
import { initializeDummyData } from "@/lib/storage"

export default function ScannerPage() {
  const [scannedId, setScannedId] = useState<string | null>(null)

  useEffect(() => {
    initializeDummyData()
  }, [])

  if (scannedId) {
    return <ScanResult visitorId={scannedId} onReset={() => setScannedId(null)} />
  }

  return <QRScanner onScan={setScannedId} />
}
