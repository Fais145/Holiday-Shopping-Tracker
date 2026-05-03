"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ItemCard } from "@/components/item-card"
import {
  FILTER_UNCATEGORIZED,
  getHolidayPlanningBucket,
  getCategoryPresentation,
  getItemRouteStoreIds,
  getStoreById,
  holidayPlanningBucketConfig,
  holidayPlanningBuckets,
  itemPassesCategoryFilters,
  type HolidayPlanningBucket,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

export type ItemBrowseViewProps = {
  title: string
  subtitle: string
  emptySearchHint?: string
}

export function ItemBrowseView({
  title,
  subtitle,
  emptySearchHint = "Try a different search or adjust your filters",
}: ItemBrowseViewProps) {
  const { items, stores, categories } = useAppStore()
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBuckets, setSelectedBuckets] = useState<HolidayPlanningBucket[]>([])

  const toggleCategoryId = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleBucket = (bucket: HolidayPlanningBucket) => {
    setSelectedBuckets((prev) =>
      prev.includes(bucket) ? prev.filter((s) => s !== bucket) : [...prev, bucket]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBuckets([])
  }

  const hasFilters = selectedCategories.length > 0 || selectedBuckets.length > 0

  const filteredItems = items.filter((item) => {
    if (query) {
      const searchLower = query.toLowerCase()
      const matchesRouteStore = getItemRouteStoreIds(item).some((sid) => {
        const st = getStoreById(stores, sid)
        return (
          !!st &&
          (st.name.toLowerCase().includes(searchLower) ||
            st.area.toLowerCase().includes(searchLower))
        )
      })
      const matchesQuery =
        item.name.toLowerCase().includes(searchLower) ||
        item.forWho.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        matchesRouteStore
      if (!matchesQuery) return false
    }

    if (!itemPassesCategoryFilters(item, selectedCategories)) {
      return false
    }

    if (
      selectedBuckets.length > 0 &&
      !selectedBuckets.includes(getHolidayPlanningBucket(item))
    ) {
      return false
    }

    return true
  })

  return (
    <div className="flex flex-col gap-4 pb-28">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </motion.div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items, stores, areas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters || hasFilters ? "default" : "outline"}
          size="icon"
          className="size-12 rounded-xl shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="size-5" />
        </Button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col gap-4 p-4 rounded-2xl bg-card ring-1 ring-border/50"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {hasFilters && (
              <Button variant="ghost" size="sm" type="button" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleCategoryId(FILTER_UNCATEGORIZED)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  selectedCategories.includes(FILTER_UNCATEGORIZED)
                    ? "border border-dashed border-primary bg-primary/10 text-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Uncategorized
              </button>
              {categories.map((def) => {
                const chip = getCategoryPresentation(def.id, categories)
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => toggleCategoryId(def.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedCategories.includes(def.id)
                        ? chip.color
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Status</p>
            <div className="flex flex-wrap gap-2">
              {holidayPlanningBuckets.map((bucket) => (
                <button
                  key={bucket}
                  type="button"
                  onClick={() => toggleBucket(bucket)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    selectedBuckets.includes(bucket)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {holidayPlanningBucketConfig[bucket].label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {hasFilters && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategories.map((catId) => {
            const isUncat = catId === FILTER_UNCATEGORIZED
            const chip = isUncat
                ? {
                    label: "Uncategorized",
                    color: "border border-dashed border-border bg-muted/60 text-foreground",
                  }
              : getCategoryPresentation(catId, categories)
            return (
              <Badge
                key={catId}
                variant="secondary"
                className={cn(chip.color, "cursor-pointer")}
                onClick={() => toggleCategoryId(catId)}
              >
                {chip.label}
                <X className="size-3 ml-1" />
              </Badge>
            )
          })}
          {selectedBuckets.map((bucket) => (
            <Badge
              key={bucket}
              variant="outline"
              className="cursor-pointer"
              onClick={() => toggleBucket(bucket)}
            >
              {holidayPlanningBucketConfig[bucket].label}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <ItemCard
              item={item}
              stores={stores}
              locationLayout="flat"
              showActions={false}
              showBackupStores={false}
            />
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Search className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-medium mb-1">No items found</h3>
          <p className="text-sm text-muted-foreground">{emptySearchHint}</p>
        </motion.div>
      )}
    </div>
  )
}
