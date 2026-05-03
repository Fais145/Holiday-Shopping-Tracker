"use client"

import { Check, Clock, Package, ShoppingBag, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/item-card"
import { categoryColors, useAppStore } from "@/lib/store"

export function BoughtView() {
  const { items, stores } = useAppStore()

  const boughtItems = items.filter((i) => i.status === "bought")
  const soldOutItems = items.filter((i) => i.status === "sold-out")
  const skippedItems = items.filter((i) => i.status === "skipped")

  // Calculate stats
  const totalQuantityBought = boughtItems.reduce((acc, item) => acc + item.quantityBought, 0)
  const categoryBreakdown = boughtItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Stats Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-card ring-1 ring-border/50">
        <div className="flex items-center justify-center size-14 rounded-2xl bg-success/10">
          <ShoppingBag className="size-7 text-success" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Items Bought</p>
          <p className="text-2xl font-bold tabular-nums">{boughtItems.length}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-2xl font-bold text-primary tabular-nums">{totalQuantityBought}</p>
          <p className="text-xs text-muted-foreground">total pieces</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryBreakdown).map(([cat, count]) => (
            <Badge
              key={cat}
              variant="secondary"
              className={categoryColors[cat as keyof typeof categoryColors]}
            >
              <Package className="size-3 mr-1" />
              {cat}: {count}
            </Badge>
          ))}
        </div>
      )}

      {/* Bought Items */}
      {boughtItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Check className="size-4 text-success" />
            <h2 className="font-semibold text-base">Bought</h2>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {boughtItems.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {boughtItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                stores={stores}
                showActions={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sold Out Items */}
      {soldOutItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <X className="size-4 text-destructive" />
            <h2 className="font-semibold text-base">Sold Out</h2>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {soldOutItems.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {soldOutItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                stores={stores}
                showActions={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Skipped Items */}
      {skippedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-base text-muted-foreground">Later</h2>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {skippedItems.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {skippedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                stores={stores}
                showActions={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {boughtItems.length === 0 && soldOutItems.length === 0 && skippedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-20 rounded-full bg-muted mb-4">
            <ShoppingBag className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Purchases Yet</h3>
          <p className="text-muted-foreground text-sm">
            Start shopping to see your haul here!
          </p>
        </div>
      )}
    </div>
  )
}
