"use client"

import { useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Download,
  Plus,
  Settings,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function SettingsView() {
  const { stores, items, addStore, deleteStore, exportData, importData, setActiveTab } =
    useAppStore()
  const [showAddStore, setShowAddStore] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")
  const [newStoreArea, setNewStoreArea] = useState("")
  const [newStoreNotes, setNewStoreNotes] = useState("")
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState("")
  const [copied, setCopied] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleAddStore = () => {
    if (!newStoreName.trim() || !newStoreArea.trim()) return
    addStore({
      name: newStoreName.trim(),
      area: newStoreArea.trim(),
      notes: newStoreNotes.trim() || undefined,
    })
    setNewStoreName("")
    setNewStoreArea("")
    setNewStoreNotes("")
    setShowAddStore(false)
  }

  const handleExport = () => {
    const data = exportData()
    navigator.clipboard.writeText(data)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const data = exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `yv-japan-quest-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    setImportError("")
    const success = importData(importText)
    if (success) {
      setImportSuccess(true)
      setTimeout(() => {
        setImportSuccess(false)
        setShowImport(false)
        setImportText("")
      }, 1500)
    } else {
      setImportError("Invalid backup data. Please check and try again.")
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl"
          onClick={() => setActiveTab("today")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
            <Settings className="size-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col p-4 rounded-2xl bg-card ring-1 ring-border/50">
          <span className="text-2xl font-bold tabular-nums">{items.length}</span>
          <span className="text-sm text-muted-foreground">Total Items</span>
        </div>
        <div className="flex flex-col p-4 rounded-2xl bg-card ring-1 ring-border/50">
          <span className="text-2xl font-bold tabular-nums">{stores.length}</span>
          <span className="text-sm text-muted-foreground">Stores</span>
        </div>
      </div>

      {/* Stores Management */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Manage Stores</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setShowAddStore(!showAddStore)}
          >
            {showAddStore ? (
              <>
                <X className="size-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="size-4 mr-1" />
                Add Store
              </>
            )}
          </Button>
        </div>

        {showAddStore && (
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card ring-1 ring-border/50">
            <Input
              placeholder="Store name"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="h-11 rounded-xl"
            />
            <Input
              placeholder="Area (e.g. Shibuya)"
              value={newStoreArea}
              onChange={(e) => setNewStoreArea(e.target.value)}
              className="h-11 rounded-xl"
            />
            <Input
              placeholder="Notes (optional)"
              value={newStoreNotes}
              onChange={(e) => setNewStoreNotes(e.target.value)}
              className="h-11 rounded-xl"
            />
            <Button
              className="h-11 rounded-xl"
              onClick={handleAddStore}
              disabled={!newStoreName.trim() || !newStoreArea.trim()}
            >
              <Plus className="size-4 mr-2" />
              Add Store
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card ring-1 ring-border/50"
            >
              <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
                <Store className="size-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.area}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteStore(store.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Backup & Restore */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-base">Backup & Restore</h2>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="h-12 rounded-xl justify-start"
            onClick={handleExport}
          >
            {copied ? (
              <>
                <Check className="size-5 mr-3 text-success" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="size-5 mr-3" />
                Copy Backup to Clipboard
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="h-12 rounded-xl justify-start"
            onClick={handleDownload}
          >
            <Download className="size-5 mr-3" />
            Download Backup File
          </Button>

          <Button
            variant={showImport ? "secondary" : "outline"}
            className="h-12 rounded-xl justify-start"
            onClick={() => setShowImport(!showImport)}
          >
            <Upload className="size-5 mr-3" />
            {showImport ? "Cancel Import" : "Import from Backup"}
          </Button>
        </div>

        {showImport && (
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card ring-1 ring-border/50">
            {importSuccess ? (
              <div className="flex flex-col items-center py-6">
                <div className="flex items-center justify-center size-16 rounded-full bg-success/10 mb-3">
                  <Check className="size-8 text-success" />
                </div>
                <p className="font-medium">Import Successful!</p>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Paste your backup data here..."
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value)
                    setImportError("")
                  }}
                  className="min-h-32 rounded-xl text-sm font-mono resize-none"
                />
                {importError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    {importError}
                  </div>
                )}
                <Button
                  className="h-11 rounded-xl"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                >
                  <Upload className="size-4 mr-2" />
                  Import Data
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Warning: This will replace all your current data
                </p>
              </>
            )}
          </div>
        )}
      </section>

      {/* About */}
      <section className="flex flex-col gap-2 pt-4">
        <p className="text-sm text-muted-foreground text-center">
          YV Japan Buy Quest
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Made with love for your Japan trip
        </p>
      </section>
    </div>
  )
}
