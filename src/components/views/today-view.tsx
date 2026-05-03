"use client"

import { motion } from "framer-motion"
import { ChevronDown, MapPin, Package, Sparkles, Star, Target, Trophy } from "lucide-react"
import { useState } from "react"
import { ItemCard } from "@/components/item-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getStoreById, priorityConfig, useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function TodayView() {
  const { items, stores } = useAppStore()
  const [expandedAreas, setExpandedAreas] = useState<string[]>([])

  // Get items that are still being hunted
  const huntingItems = items.filter((item) => item.status === "hunting")
  
  // Group by Area > Store
  const itemsByArea = huntingItems.reduce<Record<string, Record<string, typeof huntingItems>>>((acc, item) => {
    const store = getStoreById(stores, item.currentStoreId)
    if (!store) return acc
    
    if (!acc[store.area]) acc[store.area] = {}
    if (!acc[store.area][store.id]) acc[store.area][store.id] = []
    acc[store.area][store.id].push(item)
    return acc
  }, {})

  const areas = Object.keys(itemsByArea).sort()

  // Stats
  const totalItems = items.length
  const boughtItems = items.filter((i) => i.status === "bought").length
  const progressPercent = totalItems > 0 ? Math.round((boughtItems / totalItems) * 100) : 0
  
  const sPriorityRemaining = huntingItems.filter((i) => i.priority === "S").length
  const aPriorityRemaining = huntingItems.filter((i) => i.priority === "A").length

  const toggleArea = (area: string) => {
    setExpandedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  // Auto-expand first area
  if (areas.length > 0 && expandedAreas.length === 0) {
    setExpandedAreas([areas[0]])
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-5 text-primary-foreground shadow-xl shadow-primary/20"
      >
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="size-32 -mt-8 -mr-8" />
        </div>
        
        <div className="relative">
          <p className="text-sm font-medium opacity-90 mb-1">Today&apos;s Shopping Quest</p>
          <h1 className="text-2xl font-bold mb-4">
            {huntingItems.length > 0 
              ? `${huntingItems.length} treasures to find!` 
              : "All done for today!"}
          </h1>
          
          {/* Progress */}
          <div className="flex items-center gap-3 mb-3">
            <Progress 
              value={progressPercent} 
              className="h-3 flex-1 bg-primary-foreground/20" 
            />
            <span className="text-lg font-bold tabular-nums">{progressPercent}%</span>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Trophy className="size-4" />
              <span className="text-sm font-medium">{boughtItems}/{totalItems} found</span>
            </div>
            {sPriorityRemaining > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-current" />
                <span className="text-sm font-medium">{sPriorityRemaining} must-haves left</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Priority Summary Badges */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {(["S", "A", "B", "C"] as const).map((p) => {
          const count = huntingItems.filter((i) => i.priority === p).length
          if (count === 0) return null
          return (
            <motion.div
              key={p}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl shrink-0",
                priorityConfig[p].bgColor
              )}
            >
              <div className={cn("size-6 rounded-lg flex items-center justify-center text-xs font-bold", priorityConfig[p].color)}>
                {p}
              </div>
              <span className="text-sm font-medium">{count} items</span>
            </motion.div>
          )
        })}
      </div>

      {/* Areas with Stores */}
      {areas.map((area, areaIndex) => {
        const storesInArea = itemsByArea[area]
        const storeIds = Object.keys(storesInArea)
        const totalInArea = storeIds.reduce((acc, id) => acc + storesInArea[id].length, 0)
        const isExpanded = expandedAreas.includes(area)

        return (
          <motion.section
            key={area}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: areaIndex * 0.1 }}
          >
            <button
              onClick={() => toggleArea(area)}
              className="flex items-center gap-3 w-full mb-3 group"
            >
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-bold text-lg">{area}</h2>
                <p className="text-sm text-muted-foreground">
                  {storeIds.length} {storeIds.length === 1 ? "store" : "stores"} · {totalInArea} items
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-5 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-4 pl-2 border-l-2 border-primary/20 ml-5"
              >
                {storeIds.map((storeId) => {
                  const store = getStoreById(stores, storeId)
                  const storeItems = storesInArea[storeId].sort((a, b) => {
                    const order = { S: 0, A: 1, B: 2, C: 3 }
                    return order[a.priority] - order[b.priority]
                  })

                  return (
                    <div key={storeId} className="pl-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-base">{store?.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Package className="size-3 mr-1" />
                          {storeItems.length}
                        </Badge>
                        {store?.hours && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {store.hours}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        {storeItems.map((item) => (
                          <ItemCard key={item.id} item={item} stores={stores} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </motion.section>
        )
      })}

      {/* Empty State */}
      {huntingItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex items-center justify-center size-24 rounded-full bg-gradient-to-br from-success/20 to-success/10 mb-4">
            <Trophy className="size-12 text-success" />
          </div>
          <h3 className="text-xl font-bold mb-2">Quest Complete!</h3>
          <p className="text-muted-foreground">
            You&apos;ve found everything on your list. Amazing work!
          </p>
        </motion.div>
      )}
    </div>
  )
}
