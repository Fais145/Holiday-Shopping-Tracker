"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Clock, MapPin, Package, Sparkles, Store as StoreIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/item-card"
import { getItemsByStore, priorityConfig, useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function StoresView() {
  const { items, stores } = useAppStore()
  const [expandedStore, setExpandedStore] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  // Group stores by area
  const storesByArea = stores.reduce<Record<string, typeof stores>>((acc, store) => {
    if (!acc[store.area]) {
      acc[store.area] = []
    }
    acc[store.area].push(store)
    return acc
  }, {})

  const areas = Object.keys(storesByArea).sort()
  const filteredAreas = selectedArea ? [selectedArea] : areas

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-1">Where Am I Shopping?</h1>
        <p className="text-muted-foreground">
          Tap a store to see what you need to look for
        </p>
      </motion.div>

      {/* Area Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setSelectedArea(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all",
            !selectedArea
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          All Areas
        </button>
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(selectedArea === area ? null : area)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all",
              selectedArea === area
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Areas and Stores */}
      {filteredAreas.map((area, areaIndex) => (
        <motion.section
          key={area}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: areaIndex * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-4 text-primary" />
            <h2 className="font-bold text-lg">{area}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {storesByArea[area].map((store, storeIndex) => {
              const storeItems = getItemsByStore(items, store.id)
              const huntingItems = storeItems.filter((i) => i.status === "hunting")
              const isExpanded = expandedStore === store.id
              
              // Count priorities
              const sPriority = huntingItems.filter((i) => i.priority === "S").length
              const aPriority = huntingItems.filter((i) => i.priority === "A").length

              return (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: storeIndex * 0.03 }}
                  className={cn(
                    "rounded-2xl bg-card ring-1 ring-border/50 overflow-hidden transition-shadow",
                    isExpanded && "ring-primary/30 shadow-lg"
                  )}
                >
                  <button
                    onClick={() => setExpandedStore(isExpanded ? null : store.id)}
                    className="flex items-center gap-3 w-full p-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center size-12 rounded-xl shrink-0",
                        huntingItems.length > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <StoreIcon className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{store.name}</h3>
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
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Priority indicators */}
                      {sPriority > 0 && (
                        <div className={cn("size-6 rounded-md flex items-center justify-center text-[10px] font-bold", priorityConfig.S.color)}>
                          {sPriority}
                        </div>
                      )}
                      {aPriority > 0 && (
                        <div className={cn("size-6 rounded-md flex items-center justify-center text-[10px] font-bold", priorityConfig.A.color)}>
                          {aPriority}
                        </div>
                      )}
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

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border/50"
                      >
                        <div className="p-4">
                          {huntingItems.length > 0 ? (
                            <>
                              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                                <Sparkles className="size-4 text-primary" />
                                Look for these {huntingItems.length} items here:
                              </p>
                              <div className="flex flex-col gap-3">
                                {huntingItems
                                  .sort((a, b) => {
                                    const order = { S: 0, A: 1, B: 2, C: 3 }
                                    return order[a.priority] - order[b.priority]
                                  })
                                  .map((item) => (
                                    <ItemCard
                                      key={item.id}
                                      item={item}
                                      stores={stores}
                                      showActions={true}
                                    />
                                  ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              Nothing to find here right now!
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      ))}

      {stores.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex items-center justify-center size-20 rounded-full bg-muted mb-4">
            <StoreIcon className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Stores Yet</h3>
          <p className="text-muted-foreground text-sm">
            Add stores in Settings to plan your route
          </p>
        </motion.div>
      )}
    </div>
  )
}
