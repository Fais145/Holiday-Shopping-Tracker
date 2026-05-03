"use client"

import { Sparkles, Target } from "lucide-react"
import { ItemCard } from "@/components/item-card"
import { useAppStore } from "@/lib/store"

export function TodayView() {
  const { items, stores } = useAppStore()

  // Get items that are still being hunted, sorted by priority
  const huntingItems = items
    .filter((item) => item.status === "hunting")
    .sort((a, b) => {
      const priorityOrder = { "must-have": 0, want: 1, "if-time": 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const mustHaveItems = huntingItems.filter((i) => i.priority === "must-have")
  const wantItems = huntingItems.filter((i) => i.priority === "want")
  const ifTimeItems = huntingItems.filter((i) => i.priority === "if-time")

  const totalItems = items.length
  const boughtItems = items.filter((i) => i.status === "bought").length
  const progressPercent = totalItems > 0 ? Math.round((boughtItems / totalItems) * 100) : 0

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header Stats */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-card ring-1 ring-border/50">
        <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10">
          <Target className="size-7 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Quest Progress</p>
          <p className="text-2xl font-bold tabular-nums">
            {boughtItems} / {totalItems}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-3xl font-bold text-primary tabular-nums">{progressPercent}%</p>
          <p className="text-xs text-muted-foreground">complete</p>
        </div>
      </div>

      {/* Must Have Section */}
      {mustHaveItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-semibold text-base">Must Have</h2>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {mustHaveItems.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {mustHaveItems.map((item) => (
              <ItemCard key={item.id} item={item} stores={stores} />
            ))}
          </div>
        </section>
      )}

      {/* Want Section */}
      {wantItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-base">Want</h2>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {wantItems.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {wantItems.map((item) => (
              <ItemCard key={item.id} item={item} stores={stores} />
            ))}
          </div>
        </section>
      )}

      {/* If Time Section */}
      {ifTimeItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-base text-muted-foreground">If Time</h2>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {ifTimeItems.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {ifTimeItems.map((item) => (
              <ItemCard key={item.id} item={item} stores={stores} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {huntingItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-20 rounded-full bg-success/10 mb-4">
            <Sparkles className="size-10 text-success" />
          </div>
          <h3 className="text-lg font-semibold mb-1">All Done!</h3>
          <p className="text-muted-foreground text-sm">
            You&apos;ve completed your shopping quest!
          </p>
        </div>
      )}
    </div>
  )
}
