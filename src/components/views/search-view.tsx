"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ItemCard } from "@/components/item-card"
import {
  type Category,
  type Priority,
  type Status,
  categoryColors,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

const categories: Category[] = ["fashion", "food", "merch", "beauty", "home", "misc"]
const priorities: Priority[] = ["must-have", "want", "if-time"]
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
      const matchesQuery =
        item.name.toLowerCase().includes(searchLower) ||
        item.forWho.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
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
    <div className="flex flex-col gap-4 pb-24">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          className="size-11 rounded-xl shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-card ring-1 ring-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Filters</h3>
            {hasFilters && (
              <Button variant="ghost" size="xs" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                    selectedCategories.includes(cat)
                      ? categoryColors[cat]
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Priority</p>
            <div className="flex flex-wrap gap-2">
              {priorities.map((pri) => (
                <button
                  key={pri}
                  onClick={() => togglePriority(pri)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                    selectedPriorities.includes(pri)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {pri.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                    selectedStatuses.includes(status)
                      ? "bg-secondary text-secondary-foreground ring-1 ring-border"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {status.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasFilters && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className={cn(categoryColors[cat], "capitalize")}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
          {selectedPriorities.map((pri) => (
            <Badge key={pri} variant="outline" onClick={() => togglePriority(pri)}>
              {pri.replace("-", " ")}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="outline" onClick={() => toggleStatus(status)}>
              {status.replace("-", " ")}
              <X className="size-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} stores={stores} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-medium mb-1">No items found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
