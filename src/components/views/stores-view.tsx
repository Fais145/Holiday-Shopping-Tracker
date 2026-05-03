"use client"

import { useState } from "react"
import { ChevronRight, MapPin, Package, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/item-card"
import { getItemsByStore, useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function StoresView() {
  const { items, stores } = useAppStore()
  const [expandedStore, setExpandedStore] = useState<string | null>(null)

  // Group stores by area
  const storesByArea = stores.reduce<Record<string, typeof stores>>((acc, store) => {
    if (!acc[store.area]) {
      acc[store.area] = []
    }
    acc[store.area].push(store)
    return acc
  }, {})

  const areas = Object.keys(storesByArea).sort()

  return (
    <div className="flex flex-col gap-6 pb-24">
      {areas.map((area) => (
        <section key={area}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-4 text-primary" />
            <h2 className="font-semibold text-base">{area}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {storesByArea[area].map((store) => {
              const storeItems = getItemsByStore(items, store.id)
              const huntingItems = storeItems.filter((i) => i.status === "hunting")
              const isExpanded = expandedStore === store.id

              return (
                <div key={store.id} className="rounded-2xl bg-card ring-1 ring-border/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedStore(isExpanded ? null : store.id)}
                    className="flex items-center gap-3 w-full p-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
                      <Store className="size-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{store.name}</h3>
                      {store.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {store.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {huntingItems.length > 0 && (
                        <Badge variant="secondary" className="tabular-nums">
                          <Package className="size-3 mr-1" />
                          {huntingItems.length}
                        </Badge>
                      )}
                      <ChevronRight
                        className={cn(
                          "size-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50 p-4">
                      {storeItems.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {storeItems.map((item) => (
                            <ItemCard
                              key={item.id}
                              item={item}
                              stores={stores}
                              showActions={true}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No items at this store
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {stores.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-20 rounded-full bg-muted mb-4">
            <Store className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Stores Yet</h3>
          <p className="text-muted-foreground text-sm">
            Add stores to start planning your shopping route
          </p>
        </div>
      )}
    </div>
  )
}
