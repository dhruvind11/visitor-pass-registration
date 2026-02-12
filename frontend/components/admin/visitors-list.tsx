"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, X, CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { VisitorData as VisitorType } from "@/lib/storage"

export function VisitorsList() {
  const [visitors, setVisitors] = useState<VisitorType[]>([])
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorType | null>(null)
  const [editingVisitor, setEditingVisitor] = useState<VisitorType | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<VisitorType | null>(null)
  const { toast } = useToast()

  const fetchVisitors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors`)
      const result = await response.json()
      if (result.success) {
        setVisitors(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch visitors:", error)
    }
  }

  useEffect(() => {
    fetchVisitors()
  }, [])

  useEffect(() => {
    const filtered = visitors.filter((v) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        v.firstName.toLowerCase().includes(searchLower) ||
        v.lastName.toLowerCase().includes(searchLower) ||
        v.mobile.includes(searchTerm) ||
        v.visitorId.includes(searchTerm)
      )
    })

    filtered.sort((a, b) => {
      const dateA = new Date(a.registrationDate).getTime()
      const dateB = new Date(b.registrationDate).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredVisitors(filtered)
  }, [visitors, searchTerm, sortOrder])

  const handleDelete = async (visitor: VisitorType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${visitor._id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        await fetchVisitors()
        toast({
          title: "Visitor Deleted",
          description: `${visitor.firstName} ${visitor.lastName} has been removed.`,
        })
      } else {
        toast({
          title: "Delete Failed",
          description: result.message || "Failed to delete visitor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete visitor:", error)
      toast({
        title: "Error",
        description: "Something went wrong while deleting the visitor.",
        variant: "destructive",
      })
    }
    setDeleteConfirm(null)
  }

  const handleEditSave = async (updatedVisitor: VisitorType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visitors/${updatedVisitor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVisitor),
      })
      const result = await response.json()
      if (result.success) {
        await fetchVisitors()
        toast({
          title: "Visitor Updated",
          description: `${updatedVisitor.firstName} ${updatedVisitor.lastName} has been updated.`,
        })
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update visitor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update visitor:", error)
      toast({
        title: "Error",
        description: "Something went wrong while updating the visitor.",
        variant: "destructive",
      })
    }
    setEditingVisitor(null)
    setSelectedVisitor(null)
  }

  if (selectedVisitor && !editingVisitor && !deleteConfirm) {
    return (
      <VisitorDetail
        visitor={selectedVisitor}
        onBack={() => {
          setSelectedVisitor(null)
          setEditingVisitor(null)
          setDeleteConfirm(null)
        }}
        onEdit={() => setEditingVisitor(selectedVisitor)}
        onDelete={() => setDeleteConfirm(selectedVisitor)}
      />
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black">Visitors</h1>
        <p className="text-muted-foreground mt-2">Manage and monitor registered visitors</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or Visitor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-muted/30"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortOrder === "newest" ? "default" : "outline"}
              onClick={() => setSortOrder("newest")}
              size="sm"
              className="rounded-lg"
            >
              Newest First
            </Button>
            <Button
              variant={sortOrder === "oldest" ? "default" : "outline"}
              onClick={() => setSortOrder("oldest")}
              size="sm"
              className="rounded-lg"
            >
              Oldest First
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-semibold">
          Showing {filteredVisitors.length} of {visitors.length} visitors
        </p>
        {filteredVisitors.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No visitors found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredVisitors.map((visitor) => (
              <Card
                key={visitor._id}
                className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedVisitor(visitor)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">
                          {visitor.title} {visitor.firstName} {visitor.lastName}
                        </h3>
                        {visitor.status === "checked-in" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {visitor.designation} • {visitor.organization}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">{visitor.visitorId}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-primary">{visitor.mobile}</p>
                      <p className="text-xs text-muted-foreground">{new Date(visitor.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editingVisitor && (
        <EditVisitorDialog
          visitor={editingVisitor}
          onSave={handleEditSave}
          onCancel={() => setEditingVisitor(null)}
        />
      )}

      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Visitor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {deleteConfirm.firstName} {deleteConfirm.lastName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="destructive"
                  className="flex-1 rounded-lg"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function VisitorDetail({
  visitor,
  onBack,
  onEdit,
  onDelete,
}: {
  visitor: VisitorType
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Visitor Details</h1>
        <div className="flex gap-2">
          <Button onClick={(e) => { e.stopPropagation(); onEdit() }} variant="outline" size="sm" className="rounded-lg">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); onDelete() }} variant="destructive" size="sm" className="rounded-lg">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="ghost" onClick={onBack} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                {visitor.title} {visitor.firstName} {visitor.lastName}
              </CardTitle>
              <CardDescription>{visitor.designation}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Organization</p>
                  <p className="text-lg font-bold mt-1">{visitor.organization}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visitor ID</p>
                  <p className="text-lg font-mono font-bold text-primary mt-1">{visitor.visitorId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="text-sm mt-1">{visitor.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mobile</p>
                  <p className="text-sm mt-1">{visitor.mobile}</p>
                </div>
                {visitor.website && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Website</p>
                    <p className="text-sm mt-1">{visitor.website}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Registration Date
                  </p>
                  <p className="text-sm mt-1">{new Date(visitor.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Check-in Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                {visitor.status==="checked-in" ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-600">Checked In</p>
                      <p className="text-sm text-muted-foreground">
                        {visitor.checkInTime && new Date(visitor.checkInTime).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Circle className="w-6 h-6 text-muted-foreground" />
                    <p className="font-bold text-muted-foreground">Not Yet Checked In</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Scan for entry</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="p-4 bg-white rounded-xl">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <rect width="160" height="160" fill="white" />
                  <text x="80" y="80" fontSize="12" textAnchor="middle" dy=".3em">
                    {visitor.visitorId}
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button onClick={onBack} className="rounded-lg" size="lg">
        Back to Visitors
      </Button>
    </div>
  )
}

function EditVisitorDialog({
  visitor,
  onSave,
  onCancel,
}: {
  visitor: VisitorType
  onSave: (visitor: VisitorType) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(visitor)

  const handleChange = (field: keyof VisitorType, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Visitor Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Mr, Ms, Dr, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visitor ID</label>
              <Input value={formData.visitorId} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Organization</label>
            <Input
              value={formData.organization}
              onChange={(e) => handleChange("organization", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Designation</label>
            <Input
              value={formData.designation}
              onChange={(e) => handleChange("designation", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile</label>
            <Input
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Website (Optional)</label>
            <Input
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 rounded-lg bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 rounded-lg">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
