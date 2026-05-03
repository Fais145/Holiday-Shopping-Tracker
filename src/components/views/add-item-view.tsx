"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Check, MapPin, Minus, Plus, Sparkles, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ShopPrioritySortableList } from "@/components/shop-priority-sortable-list"
import { type Store, getCategoryPresentation, getStoreById, useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function AddItemView() {
  const router = useRouter()
  const { addItem, stores, addStore, categories, addCategory } = useAppStore()
  const [name, setName] = useState("")
  const [storeSearch, setStoreSearch] = useState("")
  const [storeArea, setStoreArea] = useState("")
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
  /** When true (and 2+ shops), show reorder controls; order still follows this array either way. */
  const [showShopPriority, setShowShopPriority] = useState(false)
  const [storeSuggestionsOpen, setStoreSuggestionsOpen] = useState(false)
  const storeBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevResolvedStoreIdRef = useRef<string | null>(null)
  const [forWho, setForWho] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [newCategoryLabel, setNewCategoryLabel] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [price, setPrice] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const storeNameSuggestions = useMemo(() => {
    const selected = new Set(selectedStoreIds)
    const pool = stores.filter((s) => !selected.has(s.id))
    const q = storeSearch.trim().toLowerCase()
    const sorted = [...pool].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    )
    if (!q) return sorted.slice(0, 12)
    const lower = (s: (typeof sorted)[number]) => s.name.toLowerCase()
    const startsWith = sorted.filter((s) => lower(s).startsWith(q))
    const includesRest = sorted.filter((s) => !lower(s).startsWith(q) && lower(s).includes(q))
    return [...startsWith, ...includesRest].slice(0, 20)
  }, [stores, storeSearch, selectedStoreIds])

  /** Prefer a store not already on this item so autocomplete works for multiple shops with the same lookup. */
  const existingMatchingName = useMemo(() => {
    const t = storeSearch.trim().toLowerCase()
    if (!t) return null
    const matches = stores.filter((s) => s.name.trim().toLowerCase() === t)
    if (matches.length === 0) return null
    const unselected = matches.find((s) => !selectedStoreIds.includes(s.id))
    return unselected ?? matches[0]
  }, [stores, storeSearch, selectedStoreIds])

  const pickStoreIdFromNameTrim = (
    nameTrim: string,
    selectedIdsSnapshot: readonly string[],
  ): Store | undefined => {
    const lower = nameTrim.toLowerCase()
    const matches = stores.filter((s) => s.name.trim().toLowerCase() === lower)
    if (matches.length === 0) return undefined
    return matches.find((s) => !selectedIdsSnapshot.includes(s.id)) ?? matches[0]
  }

  useEffect(() => {
    return () => {
      if (storeBlurTimer.current != null) clearTimeout(storeBlurTimer.current)
    }
  }, [])

  useEffect(() => {
    if (selectedStoreIds.length < 2) setShowShopPriority(false)
  }, [selectedStoreIds.length])

  /**
   * When the name matches a saved shop (not yet duplicated on this draft list), mirror its area.
   * When editing away from an exact saved name while typing something new, clear the mirrored area so the Area row is free again.
   */
  useEffect(() => {
    const id = existingMatchingName?.id ?? null
    if (id && !selectedStoreIds.includes(id)) {
      setStoreArea(existingMatchingName!.area)
      prevResolvedStoreIdRef.current = id
    } else if (existingMatchingName && selectedStoreIds.includes(existingMatchingName.id)) {
      setStoreArea(existingMatchingName.area)
      prevResolvedStoreIdRef.current = null
    } else {
      const hadResolved = prevResolvedStoreIdRef.current !== null
      if (hadResolved && storeSearch.trim() !== "") {
        setStoreArea("")
      }
      if (storeSearch.trim() === "") {
        setStoreArea("")
      }
      prevResolvedStoreIdRef.current = null
    }
  }, [existingMatchingName, storeSearch, selectedStoreIds])

  const resolvedId = existingMatchingName?.id ?? null
  const isAlreadyListed = resolvedId != null && selectedStoreIds.includes(resolvedId)

  const canAddShop =
    !!storeSearch.trim() && !isAlreadyListed && (!!existingMatchingName || true)

  const resolveStoreFromInputs = (
    nameTrim: string,
    areaTrim: string,
    selectedIdsSnapshot: readonly string[],
  ): string | null => {
    if (!nameTrim) return null
    const existing = pickStoreIdFromNameTrim(nameTrim, selectedIdsSnapshot)
    if (existing) return existing.id
    return addStore({ name: nameTrim, area: areaTrim.trim() || "Unset" })
  }

  const appendStoreId = (storeId: string) => {
    setSelectedStoreIds((prev) => (prev.includes(storeId) ? prev : [...prev, storeId]))
  }

  const addShopFromInput = () => {
    const nameTrim = storeSearch.trim()
    const areaTrim = storeArea.trim()
    if (!canAddShop) return
    const id = resolveStoreFromInputs(
      nameTrim,
      existingMatchingName && !selectedStoreIds.includes(existingMatchingName.id)
        ? existingMatchingName.area
        : areaTrim,
      selectedStoreIds,
    )
    if (!id || selectedStoreIds.includes(id)) return
    appendStoreId(id)
    setStoreSearch("")
    setStoreArea("")
    prevResolvedStoreIdRef.current = null
    setStoreSuggestionsOpen(false)
  }

  const scheduleStoreSuggestionsClose = () => {
    if (storeBlurTimer.current != null) clearTimeout(storeBlurTimer.current)
    storeBlurTimer.current = setTimeout(() => setStoreSuggestionsOpen(false), 200)
  }

  const handleAddDraftCategory = () => {
    const id = addCategory(newCategoryLabel)
    if (!id) return
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setNewCategoryLabel("")
  }

  const hasMinimumShops =
    selectedStoreIds.length > 0 || !!storeSearch.trim()

  const handleSubmit = () => {
    const mergedIds = [...selectedStoreIds]
    const trailingName = storeSearch.trim()
    const trailingArea = storeArea.trim()
    if (trailingName) {
      const trailingExisting = pickStoreIdFromNameTrim(trailingName, mergedIds)
      const areaForTrailing =
        trailingExisting && !mergedIds.includes(trailingExisting.id)
          ? trailingExisting.area
          : trailingArea
      const id = resolveStoreFromInputs(trailingName, areaForTrailing, mergedIds)
      if (id && !mergedIds.includes(id)) mergedIds.push(id)
    }
    const uniqueOrdered = [...new Set(mergedIds)]
    const currentStoreId = uniqueOrdered[0] ?? null
    const backupStoreIds = uniqueOrdered.slice(1)
    if (!name.trim() || !currentStoreId) return

    addItem({
      name: name.trim(),
      forWho: forWho.trim(),
      categoryIds: [...new Set(selectedCategoryIds)],
      quantity,
      quantityBought: 0,
      currentStoreId,
      backupStoreIds,
      storeStatuses: {},
      boughtAtStore: {},
      notes: notes.trim() || undefined,
      price: price.trim() || undefined,
    })

    // Show success state
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      // Reset form
      setName("")
      setStoreSearch("")
      setStoreArea("")
      setSelectedStoreIds([])
      setShowShopPriority(false)
      setStoreSuggestionsOpen(false)
      setForWho("")
      setSelectedCategoryIds([])
      setNewCategoryLabel("")
      setQuantity(1)
      setNotes("")
      setPrice("")
      router.push("/stores")
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
        <label className="text-sm font-semibold flex items-center gap-1 flex-wrap">
          What are you hunting?
          <span className="text-destructive text-xs font-bold">*</span>
        </label>
        <Input
          placeholder="e.g., Onitsuka Tiger Mexico 66"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Shops — item appears under each chosen store */}
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground shrink-0" aria-hidden />
          Shops to check
          <span className="text-destructive text-xs font-bold">*</span>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Add at least one shop — it appears on that store&apos;s page and in lookup. Order is the order you
          add unless you enable shop hunt order (2+ shops). New shops only need a name; area is optional and
          defaults to &quot;Unset&quot;.
        </p>
        {selectedStoreIds.length > 0 && (
          <div className="flex flex-col gap-3">
            {selectedStoreIds.length >= 2 && (
              <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/25 px-3 py-3">
                <Checkbox
                  id="add-item-shop-priority"
                  checked={showShopPriority}
                  onCheckedChange={(v) => setShowShopPriority(v === true)}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <label
                    htmlFor="add-item-shop-priority"
                    className="text-sm font-medium leading-snug cursor-pointer"
                  >
                    Set shop hunt order
                  </label>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Drag the grip to reorder, or use the arrows. Lookup and shelf lists follow this order.
                  </p>
                </div>
              </div>
            )}

            {!showShopPriority || selectedStoreIds.length < 2 ? (
              <div className="flex flex-wrap gap-2" aria-label="Selected shops">
                {selectedStoreIds.map((sid) => {
                  const shop = getStoreById(stores, sid)
                  const place = shop?.area ? ` · ${shop.area}` : ""
                  const label = `${shop?.name ?? "Shop"}${place}`
                  return (
                    <Badge
                      key={sid}
                      variant="outline"
                      className="gap-1.5 px-3 py-2 h-auto rounded-xl text-sm font-medium max-w-full border-border"
                    >
                      <span className="truncate">{label}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${shop?.name ?? "shop"} from hunt list`}
                        className="-mr-1 inline-flex shrink-0 size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
                        onClick={() =>
                          setSelectedStoreIds((prev) => prev.filter((id) => id !== sid))
                        }
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Shop hunt order</p>
                  <p className="text-[10px] text-muted-foreground text-right max-w-52 leading-snug">
                    Top tries first · drag grip or arrows
                  </p>
                </div>
                <ShopPrioritySortableList
                  storeIds={selectedStoreIds}
                  stores={stores}
                  onReorder={(next) => setSelectedStoreIds(next)}
                  onRemove={(sid) =>
                    setSelectedStoreIds((prev) => prev.filter((id) => id !== sid))
                  }
                />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-item-store-name" className="text-xs font-semibold text-muted-foreground">
              Shop name
            </label>
            <div className="relative z-20">
              <Input
                id="add-item-store-name"
                placeholder="e.g., Don Quijote Shibuya"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={storeSuggestionsOpen && storeNameSuggestions.length > 0}
                aria-controls="add-item-store-suggestions"
                role="combobox"
                value={storeSearch}
                onChange={(e) => {
                  setStoreSearch(e.target.value)
                  setStoreSuggestionsOpen(true)
                }}
                onFocus={() => {
                  if (storeBlurTimer.current != null) clearTimeout(storeBlurTimer.current)
                  storeBlurTimer.current = null
                  setStoreSuggestionsOpen(true)
                }}
                onBlur={scheduleStoreSuggestionsClose}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addShopFromInput()
                  }
                }}
                className="h-12 rounded-xl text-base"
              />
              {storeSuggestionsOpen && storeNameSuggestions.length > 0 && (
                <ul
                  id="add-item-store-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-48 overflow-y-auto rounded-xl border border-border bg-background shadow-lg"
                >
                  {storeNameSuggestions.map((store) => (
                    <li key={store.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={existingMatchingName?.id === store.id}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm font-medium hover:bg-muted/80 active:bg-muted transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault()
                        }}
                        onClick={() => {
                          setStoreSearch(store.name)
                          setStoreArea(store.area)
                          setStoreSuggestionsOpen(false)
                        }}
                      >
                        <span className="block truncate">{store.name}</span>
                        <span className="block text-xs text-muted-foreground font-normal truncate">
                          {store.area}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-item-store-area" className="text-xs font-semibold text-muted-foreground">
              Area (optional)
            </label>
            <Input
              id="add-item-store-area"
              placeholder={existingMatchingName ? "From saved shop" : "e.g., Shibuya"}
              autoComplete="off"
              value={storeArea}
              onChange={(e) => setStoreArea(e.target.value)}
              disabled={!!existingMatchingName}
              readOnly={!!existingMatchingName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addShopFromInput()
                }
              }}
              className={cn(
                "h-12 rounded-xl text-base",
                existingMatchingName && "bg-muted/60 text-muted-foreground"
              )}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-xl font-semibold gap-2"
            onClick={addShopFromInput}
            disabled={!canAddShop}
            aria-label="Add shop to list"
          >
            <Plus className="size-5 shrink-0" />
            Add shop
          </Button>
        </div>
      </div>

      {/* For Who */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">
          Who&apos;s it for? <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          placeholder="Me, Mom, Brother..."
          value={forWho}
          onChange={(e) => setForWho(e.target.value)}
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">
          Categories <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <p className="text-xs text-muted-foreground -mt-2">
          Tap any number of tags — manage the list under Settings → Categories.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((def) => {
            const chip = getCategoryPresentation(def.id, categories)
            const on = selectedCategoryIds.includes(def.id)
            return (
              <motion.button
                key={def.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedCategoryIds((prev) =>
                    on ? prev.filter((id) => id !== def.id) : [...prev, def.id]
                  )
                }
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  on ? chip.color : "bg-muted text-muted-foreground"
                )}
              >
                {chip.label}
              </motion.button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">New category</label>
            <Input
              placeholder="Souvenirs…"
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
              className="h-11 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddDraftCategory()
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 rounded-xl font-semibold"
            disabled={!newCategoryLabel.trim()}
            onClick={handleAddDraftCategory}
          >
            Add tag type
          </Button>
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
          placeholder="Which shops to try, size, color, anything that helps..."
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
          disabled={!name.trim() || !hasMinimumShops}
        >
          <Sparkles className="size-5 mr-2" />
          Add to Quest
        </Button>
      </motion.div>
    </motion.div>
  )
}
