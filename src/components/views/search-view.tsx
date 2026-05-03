"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ItemCard } from "@/components/item-card"
import {
  type Category,
  type Priority,
  type Status,
  categoryConfig,
  priorityConfig,
  getStoreById,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

const categories: Category[] = ["fashion", "food", "merch", "beauty", "home", "misc"]
const priorities: Priority[] = ["S", "A", "B", "C"]
const statuses: Status[] = ["hunting", "bought", "sold-out", "skipped"]

export function SearchView() {
  const { items, stores } = useAppStore()
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([])

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const togglePriority = (pri: Priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(pri) ? prev.filter((p) => p !== pri) : [...prev, pri]
    )
  }

  const toggleStatus = (status: Status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPriorities([])
    setSelectedStatuses([])
  }

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0

  const filteredItems = items.filter((item) => {
    // Search query
    if (query) {
      const searchLower = query.toLowerCase()
      const currentStore = getStoreById(stores, item.currentStoreId)
      const matchesQuery =
        item.name.toLowerCase().includes(searchLower) ||
        item.forWho.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        currentStore?.name.toLowerCase().includes(searchLower) ||
        currentStore?.area.toLowerCase().includes(searchLower)
      if (!matchesQuery) return false
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
      return false
    }

    // Priority filter
    if (selectedPriorities.length > 0 && !selectedPriorities.includes(item.priority)) {
      return false
    }

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(item.status)) {
      return false
    }

    return true
  })

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-1">Item Lookup</h1>
        <p className="text-muted-foreground text-sm">
          Find any item and see where else you can get it
        </p>
      </motion.div>

      {/* Search Bar */}
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

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col gap-4 p-4 rounded-2xl bg-card ring-1 ring-border/50"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    selectedCategories.includes(cat)
                      ? categoryConfig[cat].color
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {categoryConfig[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Priority</p>
            <div className="flex flex-wrap gap-2">
              {priorities.map((pri) => (
                <button
                  key={pri}
                  onClick={() => togglePriority(pri)}
                  className={cn(
                    "size-8 rounded-lg text-xs font-bold transition-all",
                    selectedPriorities.includes(pri)
                      ? priorityConfig[pri].color
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                    selectedStatuses.includes(status)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {status.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Filters Summary */}
      {hasFilters && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className={cn(categoryConfig[cat].color, "cursor-pointer")}
              onClick={() => toggleCategory(cat)}
            >
              {categoryConfig[cat].label}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
          {selectedPriorities.map((pri) => (
            <Badge
              key={pri}
              variant="outline"
              className="cursor-pointer"
              onClick={() => togglePriority(pri)}
            >
              Priority {pri}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className="capitalize cursor-pointer"
              onClick={() => toggleStatus(status)}
            >
              {status.replace("-", " ")}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
        </p>
      </div>

      {/* Results with store locations shown */}
      <div className="flex flex-col gap-3">
        {filteredItems.map((item) => {
          const currentStore = getStoreById(stores, item.currentStoreId)
          const backupStores = item.backupStoreIds
            .map((id) => getStoreById(stores, id))
            .filter(Boolean)

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <ItemCard
                item={item}
                stores={stores}
                showActions={item.status === "hunting"}
                showBackupStores={true}
              />
              
              {/* Where else can I get this? */}
              {item.status === "hunting" && (currentStore || backupStores.length > 0) && (
                <div className="ml-4 pl-4 border-l-2 border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <MapPin className="size-3" />
                    Available at:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStore && (
                      <Badge variant="default" className="text-xs">
                        {currentStore.name}
                        <span className="opacity-70 ml-1">({currentStore.area})</span>
                      </Badge>
                    )}
                    {backupStores.map((store) => store && (
                      <Badge key={store.id} variant="outline" className="text-xs">
                        {store.name}
                        <span className="opacity-70 ml-1">({store.area})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Search className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-medium mb-1">No items found</h3>
          <p className="text-sm text-muted-foreground">
            Try a different search or adjust your filters
          </p>
        </motion.div>
      )}
    </div>
  )
}
