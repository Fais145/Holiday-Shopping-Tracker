"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Check,
  Clock,
  Gift,
  Minus,
  Plus,
  Package,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react"
import { SmartStoreLink } from "@/components/smart-store-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  formatRecipientsDisplay,
  formatRecipientGroupHeading,
  getCategoryPresentation,
  getCurrentStoreStatus,
  getItemRouteStoreIds,
  getStoreById,
  isQuestComplete,
  recipientGroupKey,
  RECIPIENT_GROUP_EMPTY,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

export function BoughtView() {
  const {
    items,
    stores,
    togglePacked,
    decrementOneBought,
    incrementExtraBought,
    undoSoldOutOrNotFoundAt,
    resumeDeferOrSkipAt,
  } = useAppStore()
  const categoriesCatalog = useAppStore((s) => s.categories)

  const categoriesSummary = (item: (typeof items)[number]) =>
    item.categoryIds.length === 0
      ? "No category"
      : item.categoryIds
          .map((id) => getCategoryPresentation(id, categoriesCatalog).label)
          .join(" · ")

  const primaryCategoryBadge = (item: (typeof items)[number]) => {
    const first = item.categoryIds[0]
    if (!first) {
      return { label: "—", colorClass: "bg-muted text-muted-foreground text-xs shrink-0" }
    }
    const c = getCategoryPresentation(first, categoriesCatalog)
    return {
      label: item.categoryIds.length > 1 ? `${c.label} +${item.categoryIds.length - 1}` : c.label,
      colorClass: cn(c.color, "text-xs shrink-0"),
    }
  }

  /** Items that have any quantity purchased (shows in haul for packing). */
  const haulLineItems = items.filter((i) => i.quantityBought > 0)
  const soldOutItems = items.filter(
    (i) =>
      !isQuestComplete(i) &&
      !!i.currentStoreId &&
      (getCurrentStoreStatus(i) === "sold-out" || getCurrentStoreStatus(i) === "not-found")
  )

  const deferredItems = items.filter(
    (i) =>
      !isQuestComplete(i) &&
      !!i.currentStoreId &&
      (getCurrentStoreStatus(i) === "check-later" || getCurrentStoreStatus(i) === "skip")
  )

  // Calculate stats
  const totalQuantityBought = haulLineItems.reduce((acc, item) => acc + item.quantityBought, 0)
  const packedCount = haulLineItems.filter((i) => i.isPacked).length
  const packProgress =
    haulLineItems.length > 0 ? Math.round((packedCount / haulLineItems.length) * 100) : 0

  const byRecipient = haulLineItems.reduce<Record<string, typeof haulLineItems>>((acc, item) => {
    const key = recipientGroupKey(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const recipients = Object.keys(byRecipient).sort((a, b) => {
    if (a === RECIPIENT_GROUP_EMPTY) return 1
    if (b === RECIPIENT_GROUP_EMPTY) return -1
    return a.localeCompare(b, undefined, { sensitivity: "base" })
  })

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary to-chart-1 p-5 text-primary-foreground shadow-xl shadow-primary/25 ring-1 ring-primary-foreground/15"
      >
        <div className="absolute top-0 right-0 text-primary-foreground opacity-[0.12]">
          <ShoppingBag className="size-32 -mt-8 -mr-8" />
        </div>

        <div className="relative">
          <p className="text-sm font-medium text-primary-foreground/90 mb-1">Your Haul</p>
          <h1 className="text-2xl font-bold mb-4 text-primary-foreground">
            {haulLineItems.length > 0
              ? `${haulLineItems.length} treasures found!`
              : "Start your quest!"}
          </h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/12 p-3 ring-1 ring-primary-foreground/10 backdrop-blur-[2px]">
              <Package className="size-6 shrink-0" />
              <div>
                <p className="text-xl font-bold tabular-nums">{totalQuantityBought}</p>
                <p className="text-xs text-primary-foreground/80">total items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/12 p-3 ring-1 ring-primary-foreground/10 backdrop-blur-[2px]">
              <PackageCheck className="size-6 shrink-0" />
              <div>
                <p className="text-xl font-bold tabular-nums">{packedCount}/{haulLineItems.length}</p>
                <p className="text-xs text-primary-foreground/80">packed</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center ring-1 ring-border/50"
        >
          <ShoppingBag className="size-10 text-muted-foreground/40 shrink-0" aria-hidden />
          <p className="text-sm font-medium text-foreground max-w-sm leading-relaxed">
            Add your first shopping quest or import a backup. Your haul and packing list will show up
            here once you mark finds.
          </p>
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
      ) : null}

      {/* Packing Progress */}
      {haulLineItems.length > 0 && (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card ring-1 ring-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Gift className="size-4 text-primary" />
              Packing Progress
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {packProgress}%
            </span>
          </div>
          <Progress value={packProgress} className="h-2.5" />
        </div>
      )}

      {/* Bought Items - Grouped by Recipient */}
      {recipients.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-success" />
            <h2 className="font-bold text-lg">Ready to Pack</h2>
          </div>
          
          {recipients.map((recipient, index) => (
            <motion.div
              key={recipient}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {recipient === RECIPIENT_GROUP_EMPTY ? (
                    <span>No recipient set</span>
                  ) : (
                    <>For {formatRecipientGroupHeading(recipient)}</>
                  )}
                </h3>
                <Badge variant="outline" className="text-xs tabular-nums">
                  {byRecipient[recipient].length} items
                </Badge>
              </div>
              
              <div className="flex flex-col gap-2">
                {byRecipient[recipient].map((item) => (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePacked(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all",
                      item.isPacked
                        ? "bg-success/10 ring-1 ring-success/30"
                        : "bg-card ring-1 ring-border/50"
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "flex items-center justify-center size-6 rounded-lg border-2 transition-all shrink-0",
                        item.isPacked
                          ? "bg-success border-success text-white"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {item.isPacked && <Check className="size-4" />}
                    </div>
                    
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate transition-all",
                        item.isPacked && "line-through opacity-60"
                      )}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        <span className="font-medium text-foreground">
                          {item.quantityBought}×
                        </span>
                        {" · "}goal {item.quantity}
                        {item.quantityBought > item.quantity ? (
                          <span className="text-primary font-semibold ml-1">
                            (+{item.quantityBought - item.quantity})
                          </span>
                        ) : null}
                        {" · "}
                        {categoriesSummary(item)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0 rounded-xl border-muted-foreground/25"
                      aria-label={`Remove one bought from ${item.name}`}
                      title="Remove one bought"
                      onClick={(e) => {
                        e.stopPropagation()
                        decrementOneBought(item.id)
                      }}
                    >
                      <Minus className="size-5" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0 rounded-xl border-primary/35 text-primary hover:bg-primary/10"
                      aria-label={`Add one bought for ${item.name} (beyond quest goal)`}
                      title="Add one more (beyond goal)"
                      onClick={(e) => {
                        e.stopPropagation()
                        incrementExtraBought(item.id)
                      }}
                    >
                      <Plus className="size-5" aria-hidden />
                    </Button>
                    
                    {(() => {
                      const b = primaryCategoryBadge(item)
                      return (
                        <Badge variant="secondary" className={b.colorClass}>
                          {b.label}
                        </Badge>
                      )
                    })()}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* Sold Out Items - Need Alternatives */}
      {soldOutItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <X className="size-5 text-destructive" />
            <h2 className="font-bold text-lg">Sold Out</h2>
            <Badge variant="destructive" className="text-xs tabular-nums">
              {soldOutItems.length}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-3">
            {soldOutItems.map((item) => {
              const recipientsLine = formatRecipientsDisplay(item.forRecipients)
              const alternateIds =
                item.currentStoreId != null
                  ? getItemRouteStoreIds(item).filter((id) => id !== item.currentStoreId)
                  : getItemRouteStoreIds(item)
              const backupStores = alternateIds
                .map((id) => getStoreById(stores, id))
                .filter(Boolean)
              const soldIcon =
                item.categoryIds[0] != null
                  ? getCategoryPresentation(item.categoryIds[0], categoriesCatalog)
                  : { color: "bg-muted text-muted-foreground" }

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 p-4 rounded-2xl bg-card ring-1 ring-destructive/20"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center size-8 rounded-lg shrink-0",
                        soldIcon.color
                      )}
                      aria-hidden
                    >
                      <ShoppingBag className="size-4 opacity-90" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {recipientsLine ? `For ${recipientsLine} · ` : null}
                        {item.quantity}x needed
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        item.currentStoreId &&
                        undoSoldOutOrNotFoundAt(item.id, item.currentStoreId)
                      }
                    >
                      Undo
                    </Button>
                  </div>
                  
                  {backupStores.length > 0 && (
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-accent/50 border border-accent">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <ArrowRight className="size-3" />
                        Try these stores instead:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {backupStores.map(
                          (store) =>
                            store && (
                              <Button
                                key={store.id}
                                variant="secondary"
                                size="sm"
                                className="h-8 text-xs rounded-lg"
                                asChild
                              >
                                <SmartStoreLink storeId={store.id}>{store.name}</SmartStoreLink>
                              </Button>
                            )
                        )}
                      </div>
                    </div>
                  )}
                  
                  {backupStores.length === 0 && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      No backup stores listed for this item
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Check later / Skip */}
      {deferredItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="font-semibold text-muted-foreground">Saved for Later</h2>
            <Badge variant="outline" className="text-xs tabular-nums">
              {deferredItems.length}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2">
            {deferredItems.map((item) => {
              const recipientsLine = formatRecipientsDisplay(item.forRecipients)
              const defIcon =
                item.categoryIds[0] != null
                  ? getCategoryPresentation(item.categoryIds[0], categoriesCatalog)
                  : { color: "bg-muted text-muted-foreground" }
              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 ring-1 ring-border/30"
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-7 rounded-lg shrink-0 opacity-85",
                    defIcon.color
                  )}
                  aria-hidden
                >
                  <ShoppingBag className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-muted-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {recipientsLine ? `For ${recipientsLine} · ` : null}
                    {getCurrentStoreStatus(item) === "skip" ? "Skip" : "Check later"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    item.currentStoreId && resumeDeferOrSkipAt(item.id, item.currentStoreId)
                  }
                >
                  Resume
                </Button>
              </motion.div>
            )
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {haulLineItems.length === 0 && soldOutItems.length === 0 && deferredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex items-center justify-center size-24 rounded-full bg-muted mb-4">
            <ShoppingBag className="size-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Purchases Yet</h3>
          <p className="text-muted-foreground">
            Start shopping to see your treasures here!
          </p>
        </motion.div>
      )}
    </div>
  )
}
