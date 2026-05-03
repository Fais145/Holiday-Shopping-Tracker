"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  type Item,
  type Store,
  getCategoryConfig,
  getProgressPercentage,
  getPriorityConfig,
  getStoreById,
  useAppStore,
} from "@/lib/store"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  item: Item
  stores: Store[]
  showActions?: boolean
  compact?: boolean
  showBackupStores?: boolean
}

export function ItemCard({
  item,
  stores,
  showActions = true,
  compact = false,
  showBackupStores = false,
}: ItemCardProps) {
  const { markBought, markSoldOut, markSkipped, resetStatus, tryNextStore } = useAppStore()
  const currentStore = getStoreById(stores, item.currentStoreId)
  const backupStores = item.backupStoreIds.map((id) => getStoreById(stores, id)).filter(Boolean) as Store[]
  const progress = getProgressPercentage(item)
  const priorityInfo = getPriorityConfig(item.priority)
  const categoryInfo = getCategoryConfig(item.category)

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/50"
      >
        <div
          className={cn(
            "flex items-center justify-center size-8 rounded-lg font-bold text-xs",
            priorityInfo.color
          )}
        >
          {item.priority}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.quantityBought}/{item.quantity} for {item.forWho}
          </p>
        </div>
        {item.status === "bought" ? (
          <div className="flex items-center justify-center size-8 rounded-full bg-success/20 text-success">
            <Check className="size-4" />
          </div>
        ) : (
          <Badge className={cn(categoryInfo.color, "text-xs")} variant="secondary">
            {categoryInfo.label}
          </Badge>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/50 transition-shadow",
        item.status === "bought" && "ring-success/30 bg-success/5"
      )}
    >
      {/* Header with Priority Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center size-10 rounded-xl font-bold text-sm shrink-0",
              priorityInfo.color
            )}
          >
            {item.priority}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight text-balance">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
              <Sparkles className="size-3" />
              For {item.forWho}
            </p>
          </div>
        </div>
        <Badge className={cn(categoryInfo.color, "shrink-0")} variant="secondary">
          {categoryInfo.label}
        </Badge>
      </div>

      {/* Location */}
      {currentStore && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-primary" />
          <span className="font-medium">{currentStore.name}</span>
          <span className="text-muted-foreground">({currentStore.area})</span>
        </div>
      )}

      {/* Progress Bar */}
      {item.quantity > 1 && (
        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-2.5 flex-1" />
          <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-primary">{item.quantityBought}</span>
            <span className="text-muted-foreground">/</span>
            <span>{item.quantity}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2.5 leading-relaxed">
          {item.notes}
        </p>
      )}

      {/* Price */}
      {item.price && (
        <p className="text-sm font-semibold text-primary">{item.price}</p>
      )}

      {/* Status indicator for non-hunting items */}
      {item.status !== "hunting" && (
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5",
            item.status === "bought" && "bg-success/10 text-success",
            item.status === "sold-out" && "bg-destructive/10 text-destructive",
            item.status === "skipped" && "bg-muted text-muted-foreground"
          )}
        >
          {item.status === "bought" && <Check className="size-4" />}
          {item.status === "sold-out" && <X className="size-4" />}
          {item.status === "skipped" && <Clock className="size-4" />}
          <span>
            {item.status === "bought" && "Got it!"}
            {item.status === "sold-out" && "Sold out here"}
            {item.status === "skipped" && "Saving for later"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={() => resetStatus(item.id)}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Backup stores when sold out */}
      {item.status === "sold-out" && backupStores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col gap-2 p-3 rounded-xl bg-accent/50 border border-accent"
        >
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ArrowRight className="size-3" />
            Next places to try:
          </p>
          <div className="flex flex-wrap gap-2">
            {backupStores.map((store) => (
              <Button
                key={store.id}
                variant="secondary"
                size="sm"
                className="h-8 text-xs rounded-lg"
                onClick={() => tryNextStore(item.id)}
              >
                <MapPin className="size-3 mr-1" />
                {store.name}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Show backup stores option */}
      {showBackupStores && item.status === "hunting" && backupStores.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">Also at:</span>
          {backupStores.map((store) => (
            <Badge key={store.id} variant="outline" className="text-xs font-normal">
              {store.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && item.status === "hunting" && (
        <div className="grid grid-cols-4 gap-2 pt-1">
          <Button
            variant="default"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2.5 rounded-xl bg-success hover:bg-success/90 text-white font-semibold shadow-md shadow-success/20"
            onClick={() => markBought(item.id)}
          >
            <ShoppingBag className="size-4" />
            <span className="text-[10px]">Bought!</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => markSoldOut(item.id)}
          >
            <X className="size-4" />
            <span className="text-[10px]">Sold Out</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2.5 rounded-xl"
            onClick={() => markSkipped(item.id)}
          >
            <Clock className="size-4" />
            <span className="text-[10px]">Later</span>
          </Button>
          {item.quantity > 1 && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-col gap-0.5 h-auto py-2.5 rounded-xl font-bold"
              onClick={() => markBought(item.id, 1)}
            >
              <Check className="size-4" />
              <span className="text-[10px]">+1</span>
            </Button>
          )}
          {item.quantity <= 1 && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-col gap-0.5 h-auto py-2.5 rounded-xl opacity-50"
              disabled
            >
              <Check className="size-4" />
              <span className="text-[10px]">+1</span>
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
