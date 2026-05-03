"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Download,
  Heart,
  MapPin,
  Plus,
  Settings,
  Sparkles,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  BUILTIN_CATEGORY_IDS,
  isQuestComplete,
  showsOnTodayView,
  useAppStore,
} from "@/lib/store"
import { useAppBackNavigation } from "@/hooks/use-app-back-navigation"
import { cn } from "@/lib/utils"

export function SettingsView() {
  const {
    stores,
    items,
    categories,
    addStore,
    deleteStore,
    addCategory,
    removeCategory,
    exportData,
    importData,
  } = useAppStore()
  const goBack = useAppBackNavigation("/stores")
  const [showAddStore, setShowAddStore] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")
  const [newStoreArea, setNewStoreArea] = useState("")
  const [newStoreNotes, setNewStoreNotes] = useState("")
  const [newStoreHours, setNewStoreHours] = useState("")
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState("")
  const [copied, setCopied] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState("")

  // Stats
  const huntingCount = items.filter((i) => showsOnTodayView(i)).length
  const boughtCount = items.filter((i) => isQuestComplete(i)).length
  const packedCount = items.filter((i) => i.isPacked).length

  const handleAddStore = () => {
    if (!newStoreName.trim()) return
    addStore({
      name: newStoreName.trim(),
      area: newStoreArea.trim() || "Unset",
      notes: newStoreNotes.trim() || undefined,
      hours: newStoreHours.trim() || undefined,
    })
    setNewStoreName("")
    setNewStoreArea("")
    setNewStoreNotes("")
    setNewStoreHours("")
    setShowAddStore(false)
  }

  const handleAddCategory = () => {
    const id = addCategory(newCategoryLabel)
    if (id) setNewCategoryLabel("")
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

  // Group stores by area for display
  const storesByArea = stores.reduce<Record<string, typeof stores>>((acc, store) => {
    if (!acc[store.area]) acc[store.area] = []
    acc[store.area].push(store)
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 pb-28"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl"
          type="button"
          onClick={() => goBack()}
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
            <Settings className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your quest</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center p-3 rounded-2xl bg-card ring-1 ring-border/50"
        >
          <Sparkles className="size-5 text-primary mb-1" />
          <span className="text-2xl font-bold tabular-nums">{huntingCount}</span>
          <span className="text-[10px] text-muted-foreground">Hunting</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col items-center p-3 rounded-2xl bg-card ring-1 ring-border/50"
        >
          <Check className="size-5 text-success mb-1" />
          <span className="text-2xl font-bold tabular-nums">{boughtCount}</span>
          <span className="text-[10px] text-muted-foreground">Bought</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center p-3 rounded-2xl bg-card ring-1 ring-border/50"
        >
          <Store className="size-5 text-muted-foreground mb-1" />
          <span className="text-2xl font-bold tabular-nums">{stores.length}</span>
          <span className="text-[10px] text-muted-foreground">Stores</span>
        </motion.div>
      </div>

      {/* Categories */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-lg">Categories</h2>
        <p className="text-sm text-muted-foreground">
          Item tags for lookup filters. Built-in types stay; remove custom ones you don&apos;t need.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            placeholder="New category (e.g. Souvenirs)"
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            className="h-11 rounded-xl flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddCategory()
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-xl font-semibold shrink-0"
            disabled={!newCategoryLabel.trim()}
            onClick={handleAddCategory}
          >
            <Plus className="size-4 mr-2" />
            Add category
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isBuiltin = (BUILTIN_CATEGORY_IDS as readonly string[]).includes(cat.id)
            return (
              <motion.div
                key={cat.id}
                layout
                className="flex items-center gap-3 p-3 rounded-2xl bg-card ring-1 ring-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{cat.id}</p>
                </div>
                {isBuiltin ? (
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold whitespace-nowrap">
                    Built-in
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeCategory(cat.id)}
                    aria-label={`Remove category ${cat.label}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Stores Management */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Your Stores</h2>
          <Button
            variant={showAddStore ? "secondary" : "default"}
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

        <AnimatePresence>
          {showAddStore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 p-4 rounded-2xl bg-card ring-1 ring-primary/20"
            >
              <Input
                placeholder="Store name"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="h-11 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                placeholder="Area (optional)"
                value={newStoreArea}
                  onChange={(e) => setNewStoreArea(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <Input
                  placeholder="Hours (10-21)"
                  value={newStoreHours}
                  onChange={(e) => setNewStoreHours(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <Input
                placeholder="Notes (optional)"
                value={newStoreNotes}
                onChange={(e) => setNewStoreNotes(e.target.value)}
                className="h-11 rounded-xl"
              />
              <Button
                className="h-11 rounded-xl font-semibold"
                onClick={handleAddStore}
                disabled={!newStoreName.trim()}
              >
                <Plus className="size-4 mr-2" />
                Add Store
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stores by Area */}
        {Object.entries(storesByArea).map(([area, areaStores]) => (
          <div key={area} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              <span className="font-medium">{area}</span>
              <span className="text-xs">({areaStores.length})</span>
            </div>
            {areaStores.map((store) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card ring-1 ring-border/50"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
                  <Store className="size-5 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{store.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {store.hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {store.hours}
                      </span>
                    )}
                    {store.notes && (
                      <span className="truncate">{store.notes}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteStore(store.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        ))}
      </section>

      {/* Backup & Restore */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-lg">Backup & Restore</h2>

        <div className="flex flex-col gap-2">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl justify-start"
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
          </motion.div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl justify-start"
              onClick={handleDownload}
            >
              <Download className="size-5 mr-3" />
              Download Backup File
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant={showImport ? "secondary" : "outline"}
              className="w-full h-12 rounded-xl justify-start"
              onClick={() => setShowImport(!showImport)}
            >
              <Upload className="size-5 mr-3" />
              {showImport ? "Cancel Import" : "Import from Backup"}
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showImport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 p-4 rounded-2xl bg-card ring-1 ring-border/50"
            >
              {importSuccess ? (
                <div className="flex flex-col items-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center size-16 rounded-full bg-success/10 mb-3"
                  >
                    <Check className="size-8 text-success" />
                  </motion.div>
                  <p className="font-semibold">Import Successful!</p>
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
                    className="h-11 rounded-xl font-semibold"
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
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <section className="flex flex-col items-center gap-2 pt-6 pb-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>YV Japan Buy Quest</span>
          <Heart className="size-3.5 fill-primary text-primary" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Made with love for your Japan adventure
        </p>
      </section>
    </motion.div>
  )
}
