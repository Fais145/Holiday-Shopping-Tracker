"use client"

import Link from "next/link"
import { SmartStoreLink } from "@/components/smart-store-link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Clock, MapPin, Package, Sparkles, Store as StoreIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HorizontalScrollStrip } from "@/components/horizontal-scroll-strip"
import { ItemCard } from "@/components/item-card"
import {
  appearsActiveForStoreRow,
  compareItemsForStoreShelf,
  getItemsByStore,
  useAppStore,
} from "@/lib/store"
import { storePagePath } from "@/lib/routes"
import { cn } from "@/lib/utils"

export function StoresView() {
  const { items, stores } = useAppStore()
  const [expandedStore, setExpandedStore] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

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
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl bg-card p-5 text-center ring-1 ring-border/50"
        >
          <div className="flex items-center justify-center size-12 rounded-full bg-primary/10">
            <Sparkles className="size-6 text-primary" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground leading-relaxed max-w-sm">
            Add your first shopping quest or import a backup.
          </p>
          {stores.length === 0 ? (
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              You&apos;ll pick shops when you add a quest item, or you can add them first under Settings.
            </p>
          ) : null}
          <div className="flex flex-col w-full max-w-xs gap-2 pt-1">
            <Button asChild className="h-12 rounded-xl font-semibold">
              <Link href="/add" prefetch>
                Add quest item
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl font-semibold">
              <Link href="/settings" prefetch>
                Settings — import backup
              </Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <p className="text-center text-muted-foreground text-sm -mt-1">
          Tap a store to open its list, or use{" "}
          <ChevronRight className="inline size-3.5 align-middle text-primary" aria-hidden />{" "}
          for a quick peek here.
        </p>
      )}

      {areas.length > 0 ? (
        <HorizontalScrollStrip>
          <button
            type="button"
            onClick={() => setSelectedArea(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all min-h-11",
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
              type="button"
              onClick={() => setSelectedArea(selectedArea === area ? null : area)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all min-h-11",
                selectedArea === area
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {area}
            </button>
          ))}
        </HorizontalScrollStrip>
      ) : null}

      {filteredAreas.map((area, areaIndex) => (
        <motion.section
          key={area}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: areaIndex * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-4 text-primary shrink-0" aria-hidden />
            <h2 className="font-bold text-lg">{area}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {storesByArea[area].map((store, storeIndex) => {
              const storeItems = getItemsByStore(items, store.id)
              const huntingItems = storeItems.filter((i) =>
                appearsActiveForStoreRow(i, store.id)
              )
              const isExpanded = expandedStore === store.id

              return (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: storeIndex * 0.03 }}
                  className={cn(
                    "rounded-2xl bg-card ring-1 ring-border/50 overflow-hidden transition-shadow flex flex-col",
                    isExpanded && "ring-primary/30 shadow-lg"
                  )}
                >
                  <div className="flex items-stretch w-full">
                    <SmartStoreLink
                      storeId={store.id}
                      className="flex flex-1 min-w-0 items-center gap-3 py-4 pl-4 pr-2 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 outline-none focus-visible:bg-muted/30 [aria-current=page]:hover:bg-muted/20"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center size-12 rounded-xl shrink-0",
                          huntingItems.length > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <StoreIcon className="size-6" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{store.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {store.hours && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 shrink-0" aria-hidden />
                              {store.hours}
                            </span>
                          )}
                          {store.notes && <span className="truncate">{store.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pr-1">
                        {huntingItems.length > 0 && (
                          <Badge variant="secondary" className="tabular-nums">
                            <Package className="size-3 mr-1" aria-hidden />
                            {huntingItems.length}
                          </Badge>
                        )}
                      </div>
                    </SmartStoreLink>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded ? `Collapse ${store.name}` : `Peek inside ${store.name}`
                      }
                      className="h-auto min-h-[3.75rem] w-14 shrink-0 rounded-none border-l border-border/50 hover:bg-muted/40"
                      onClick={(e) => {
                        e.preventDefault()
                        setExpandedStore(isExpanded ? null : store.id)
                      }}
                    >
                      <ChevronRight
                        className={cn(
                          "size-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                        aria-hidden
                      />
                    </Button>
                  </div>

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
                                <Sparkles className="size-4 text-primary shrink-0" aria-hidden />
                                Quick peek — {huntingItems.length}{" "}
                                {huntingItems.length === 1 ? "item" : "items"}:
                              </p>
                              <div className="flex flex-col gap-3">
                                {huntingItems
                                  .sort((a, b) => compareItemsForStoreShelf(a, b, store.id))
                                  .map((item) => (
                                    <ItemCard
                                      key={item.id}
                                      item={item}
                                      stores={stores}
                                      shoppingStoreId={store.id}
                                      showActions
                                      showBackupStores
                                      linkStoreNames
                                    />
                                  ))}
                              </div>
                              <Link
                                href={storePagePath(store.id)}
                                prefetch
                                className="mt-4 block text-center text-sm font-medium text-primary py-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors min-h-11 leading-[2.75rem]"
                              >
                                Open full list →
                              </Link>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3 py-4">
                              <p className="text-sm text-muted-foreground text-center px-2">
                                No active items for this spot in your list right now.
                              </p>
                              <Button asChild variant="secondary" size="sm" className="rounded-xl min-h-11">
                                <Link href={storePagePath(store.id)} prefetch>
                                  Open store page anyway
                                </Link>
                              </Button>
                            </div>
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

    </div>
  )
}
