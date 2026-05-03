"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Minus, Plus, Sparkles, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  type Category,
  type Priority,
  categoryConfig,
  priorityConfig,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

const categories: Category[] = ["fashion", "food", "merch", "beauty", "home", "misc"]
const priorities: Priority[] = ["S", "A", "B", "C"]

export function AddItemView() {
  const { stores, addItem, setActiveTab } = useAppStore()
  const [name, setName] = useState("")
  const [forWho, setForWho] = useState("")
  const [priority, setPriority] = useState<Priority>("B")
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
      setPriority("B")
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="flex items-center justify-center size-24 rounded-full bg-success/10 mb-6"
        >
          <Check className="size-12 text-success" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Added to Quest!</h2>
        <p className="text-muted-foreground">{name} is now on your list</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 pb-28"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
          <Sparkles className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">New Quest Item</h1>
          <p className="text-sm text-muted-foreground">Add something to find</p>
        </div>
      </div>

      {/* Item Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">What are you hunting?</label>
        <Input
          placeholder="e.g., Onitsuka Tiger Mexico 66"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* For Who */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Who&apos;s it for?</label>
        <Input
          placeholder="Me, Mom, Brother..."
          value={forWho}
          onChange={(e) => setForWho(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">How important is it?</label>
        <div className="grid grid-cols-4 gap-2">
          {priorities.map((p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPriority(p)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 rounded-xl transition-all",
                priority === p
                  ? priorityConfig[p].color
                  : "bg-muted text-muted-foreground"
              )}
            >
              <span className="text-lg font-bold">{p}</span>
              <span className="text-[10px] opacity-80">
                {p === "S" && "Must have"}
                {p === "A" && "Want it"}
                {p === "B" && "Nice"}
                {p === "C" && "If time"}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                category === cat
                  ? categoryConfig[cat].color
                  : "bg-muted text-muted-foreground"
              )}
            >
              {categoryConfig[cat].label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">How many?</label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-xl"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="size-5" />
          </Button>
          <motion.span
            key={quantity}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold tabular-nums w-16 text-center"
          >
            {quantity}
          </motion.span>
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
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">Where to look first?</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {stores.map((store) => (
            <motion.button
              key={store.id}
              whileTap={{ scale: 0.95 }}
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
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Store className="size-3.5" />
              {store.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Backup Stores */}
      <AnimatePresence>
        {currentStoreId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            <label className="text-sm font-semibold">Backup stores? (tap to select)</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {stores
                .filter((s) => s.id !== currentStoreId)
                .map((store) => (
                  <motion.button
                    key={store.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleBackupStore(store.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      backupStoreIds.includes(store.id)
                        ? "bg-secondary text-secondary-foreground ring-2 ring-primary/30"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Store className="size-3.5" />
                    {store.name}
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Price estimate (optional)</label>
        <Input
          placeholder="~5,000 yen"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Any notes? (optional)</label>
        <Textarea
          placeholder="Size, color, specific details to look for..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-24 rounded-xl text-base resize-none"
        />
      </div>

      {/* Submit Button */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          <Sparkles className="size-5 mr-2" />
          Add to Quest
        </Button>
      </motion.div>
    </motion.div>
  )
}
