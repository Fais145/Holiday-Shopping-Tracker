"use client"

import { Check, Clock, MapPin, Package, ShoppingBag, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  type Item,
  type Store,
  categoryColors,
  getProgressPercentage,
  getStoreById,
  priorityConfig,
  useAppStore,
} from "@/lib/store"

interface ItemCardProps {
  item: Item
  stores: Store[]
  showActions?: boolean
  compact?: boolean
}

export function ItemCard({ item, stores, showActions = true, compact = false }: ItemCardProps) {
  const { markBought, markSoldOut, markSkipped, resetStatus } = useAppStore()
  const currentStore = getStoreById(stores, item.currentStoreId)
  const progress = getProgressPercentage(item)
  const priorityInfo = priorityConfig[item.priority]

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/50">
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
          <Badge className={categoryColors[item.category]} variant="secondary">
            {item.category}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/50 transition-all active:scale-[0.98]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight text-balance">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            For {item.forWho}
          </p>
        </div>
        <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
      </div>

      {/* Category & Location */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={categoryColors[item.category]} variant="secondary">
          {item.category}
        </Badge>
        {currentStore && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span>{currentStore.name}</span>
            <span className="text-muted-foreground/60">({currentStore.area})</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="h-2 flex-1" />
        <div className="flex items-center gap-1 text-sm font-medium tabular-nums">
          <Package className="size-3.5 text-muted-foreground" />
          <span>
            {item.quantityBought}/{item.quantity}
          </span>
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          {item.notes}
        </p>
      )}

      {/* Price */}
      {item.price && (
        <p className="text-sm font-medium text-primary">{item.price}</p>
      )}

      {/* Status indicator for non-hunting items */}
      {item.status !== "hunting" && (
        <div
          className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2 ${
            item.status === "bought"
              ? "bg-success/10 text-success"
              : item.status === "sold-out"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {item.status === "bought" && <Check className="size-4" />}
          {item.status === "sold-out" && <X className="size-4" />}
          {item.status === "skipped" && <Clock className="size-4" />}
          <span className="capitalize">{item.status.replace("-", " ")}</span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto"
            onClick={() => resetStatus(item.id)}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && item.status === "hunting" && (
        <div className="grid grid-cols-4 gap-2 pt-1">
          <Button
            variant="default"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2 rounded-xl bg-success hover:bg-success/90 text-white"
            onClick={() => markBought(item.id)}
          >
            <ShoppingBag className="size-4" />
            <span className="text-[10px] font-medium">Bought</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2 rounded-xl"
            onClick={() => markSoldOut(item.id)}
          >
            <X className="size-4" />
            <span className="text-[10px] font-medium">Sold Out</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2 rounded-xl"
            onClick={() => markSkipped(item.id)}
          >
            <Clock className="size-4" />
            <span className="text-[10px] font-medium">Later</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-col gap-0.5 h-auto py-2 rounded-xl"
            onClick={() => markBought(item.id)}
          >
            <Check className="size-4" />
            <span className="text-[10px] font-medium">+1</span>
          </Button>
        </div>
      )}
    </div>
  )
}
