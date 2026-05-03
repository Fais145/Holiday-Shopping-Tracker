"use client"

import { useState } from "react"
import { Check, Minus, Plus, Sparkles, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  type Category,
  type Priority,
  categoryColors,
  priorityConfig,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

const categories: Category[] = ["fashion", "food", "merch", "beauty", "home", "misc"]
const priorities: Priority[] = ["must-have", "want", "if-time"]

export function AddItemView() {
  const { stores, addItem, setActiveTab } = useAppStore()
  const [name, setName] = useState("")
  const [forWho, setForWho] = useState("")
  const [priority, setPriority] = useState<Priority>("want")
  const [category, setCategory] = useState<Category>("misc")
  const [quantity, setQuantity] = useState(1)
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null)
  const [backupStoreIds, setBackupStoreIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [price, setPrice] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const toggleBackupStore = (storeId: string) => {
    if (storeId === currentStoreId) return
    setBackupStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    )
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    addItem({
      name: name.trim(),
      forWho: forWho.trim() || "Me",
      priority,
      category,
      quantity,
      quantityBought: 0,
      currentStoreId,
      backupStoreIds,
      status: "hunting",
      notes: notes.trim() || undefined,
      price: price.trim() || undefined,
    })

    // Show success state
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      // Reset form
      setName("")
      setForWho("")
      setPriority("want")
      setCategory("misc")
      setQuantity(1)
      setCurrentStoreId(null)
      setBackupStoreIds([])
      setNotes("")
      setPrice("")
      // Navigate to today
      setActiveTab("today")
    }, 1200)
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-center size-24 rounded-full bg-success/10 mb-6">
          <Check className="size-12 text-success" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Added to Quest!</h2>
        <p className="text-muted-foreground">{name} is now on your list</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
          <Sparkles className="size-5 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">Add New Item</h1>
      </div>

      {/* Item Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Item Name</label>
        <Input
          placeholder="What are you hunting?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* For Who */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">For Who</label>
        <Input
          placeholder="Me, Mom, Gift..."
          value={forWho}
          onChange={(e) => setForWho(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Priority</label>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                priority === p
                  ? priorityConfig[p].color
                  : "bg-muted text-muted-foreground"
              )}
            >
              {priorityConfig[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                category === cat
                  ? categoryColors[cat]
                  : "bg-muted text-muted-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Quantity</label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-xl"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="size-5" />
          </Button>
          <span className="text-2xl font-bold tabular-nums w-12 text-center">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-xl"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="size-5" />
          </Button>
        </div>
      </div>

      {/* Store Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Primary Store</label>
        <div className="flex flex-wrap gap-2">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => {
                if (currentStoreId === store.id) {
                  setCurrentStoreId(null)
                } else {
                  setCurrentStoreId(store.id)
                  setBackupStoreIds((prev) => prev.filter((id) => id !== store.id))
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                currentStoreId === store.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Store className="size-3.5" />
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {/* Backup Stores */}
      {currentStoreId && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Backup Stores (optional)</label>
          <div className="flex flex-wrap gap-2">
            {stores
              .filter((s) => s.id !== currentStoreId)
              .map((store) => (
                <button
                  key={store.id}
                  onClick={() => toggleBackupStore(store.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    backupStoreIds.includes(store.id)
                      ? "bg-secondary text-secondary-foreground ring-1 ring-border"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Store className="size-3.5" />
                  {store.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Expected Price (optional)</label>
        <Input
          placeholder="~5,000 yen"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <Textarea
          placeholder="Size, color, specific details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-24 rounded-xl text-base resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        size="lg"
        className="h-14 rounded-2xl text-base font-semibold mt-4"
        onClick={handleSubmit}
        disabled={!name.trim()}
      >
        <Sparkles className="size-5 mr-2" />
        Add to Quest
      </Button>
    </div>
  )
}
