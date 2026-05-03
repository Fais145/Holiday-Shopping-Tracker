"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Check,
  Clock,
  Gift,
  Package,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  categoryConfig,
  priorityConfig,
  useAppStore,
  getStoreById,
} from "@/lib/store"
import { cn } from "@/lib/utils"

export function BoughtView() {
  const { items, stores, togglePacked, resetStatus, tryNextStore } = useAppStore()

  const boughtItems = items.filter((i) => i.status === "bought")
  const soldOutItems = items.filter((i) => i.status === "sold-out")
  const skippedItems = items.filter((i) => i.status === "skipped")

  // Calculate stats
  const totalQuantityBought = boughtItems.reduce((acc, item) => acc + item.quantityBought, 0)
  const packedCount = boughtItems.filter((i) => i.isPacked).length
  const packProgress = boughtItems.length > 0 ? Math.round((packedCount / boughtItems.length) * 100) : 0

  // Group by forWho for packing
  const byRecipient = boughtItems.reduce<Record<string, typeof boughtItems>>((acc, item) => {
    if (!acc[item.forWho]) acc[item.forWho] = []
    acc[item.forWho].push(item)
    return acc
  }, {})

  const recipients = Object.keys(byRecipient).sort()

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-success/90 to-success p-5 text-white shadow-xl shadow-success/20"
      >
        <div className="absolute top-0 right-0 opacity-10">
          <ShoppingBag className="size-32 -mt-8 -mr-8" />
        </div>
        
        <div className="relative">
          <p className="text-sm font-medium opacity-90 mb-1">Your Haul</p>
          <h1 className="text-2xl font-bold mb-4">
            {boughtItems.length > 0
              ? `${boughtItems.length} treasures found!`
              : "Start your quest!"}
          </h1>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <Package className="size-6" />
              <div>
                <p className="text-xl font-bold tabular-nums">{totalQuantityBought}</p>
                <p className="text-xs opacity-80">total items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <PackageCheck className="size-6" />
              <div>
                <p className="text-xl font-bold tabular-nums">{packedCount}/{boughtItems.length}</p>
                <p className="text-xs opacity-80">packed</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Packing Progress */}
      {boughtItems.length > 0 && (
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
                  For {recipient}
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
                    
                    {/* Priority Badge */}
                    <div
                      className={cn(
                        "size-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                        priorityConfig[item.priority].color
                      )}
                    >
                      {item.priority}
                    </div>
                    
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate transition-all",
                        item.isPacked && "line-through opacity-60"
                      )}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantityBought}x · {categoryConfig[item.category].label}
                      </p>
                    </div>
                    
                    {/* Category Badge */}
                    <Badge
                      variant="secondary"
                      className={cn(categoryConfig[item.category].color, "text-xs shrink-0")}
                    >
                      {categoryConfig[item.category].label}
                    </Badge>
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
              const backupStores = item.backupStoreIds
                .map((id) => getStoreById(stores, id))
                .filter(Boolean)

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
                        "size-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        priorityConfig[item.priority].color
                      )}
                    >
                      {item.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        For {item.forWho} · {item.quantity}x needed
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetStatus(item.id)}
                    >
                      Reset
                    </Button>
                  </div>
                  
                  {backupStores.length > 0 && (
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-accent/50 border border-accent">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <ArrowRight className="size-3" />
                        Try these stores instead:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {backupStores.map((store) => store && (
                          <Button
                            key={store.id}
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs rounded-lg"
                            onClick={() => tryNextStore(item.id)}
                          >
                            {store.name}
                          </Button>
                        ))}
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

      {/* Skipped Items */}
      {skippedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="font-semibold text-muted-foreground">Saved for Later</h2>
            <Badge variant="outline" className="text-xs tabular-nums">
              {skippedItems.length}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2">
            {skippedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 ring-1 ring-border/30"
              >
                <div
                  className={cn(
                    "size-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 opacity-60",
                    priorityConfig[item.priority].color
                  )}
                >
                  {item.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-muted-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    For {item.forWho}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => resetStatus(item.id)}
                >
                  Resume
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {boughtItems.length === 0 && soldOutItems.length === 0 && skippedItems.length === 0 && (
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
