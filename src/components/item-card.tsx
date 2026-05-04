"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Minus,
  Package,
  Pencil,
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
  getCategoryPresentation,
  getItemRouteStoresSorted,
  getProgressPercentage,
  getShelfBlockersElsewhere,
  getStoreById,
  formatRecipientsDisplay,
  getStoreOptionStatus,
  isQuestComplete,
  showsDeferredQuickActionsAt,
  showsPrimaryShoppingActionsAt,
  showsSkipQuickActionsAt,
  showsSoldOutContinuation,
  storeOptionStatusConfig,
  useAppStore,
} from "@/lib/store"
import { SmartStoreLink } from "@/components/smart-store-link"
import { editItemPagePath } from "@/lib/routes"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  item: Item
  stores: Store[]
  showActions?: boolean
  compact?: boolean
  showBackupStores?: boolean
  /** Link store names to that store’s shopping list */
  linkStoreNames?: boolean
  /**
   * Shelf this card is for (store page / peek). Buys and “Sold out here” apply only to this shelf.
   * Defaults to the item’s route primary when `locationLayout` is `"default"`.
   */
  shoppingStoreId?: string | null
  /** Lookup: list every route store equally. Store pages use `"default"` + `shoppingStoreId`. */
  locationLayout?: "default" | "flat"
}

export function ItemCard({
  item,
  stores,
  showActions = true,
  compact = false,
  showBackupStores = false,
  linkStoreNames = true,
  shoppingStoreId,
  locationLayout = "default",
}: ItemCardProps) {
  const {
    markBought,
    markSoldOut,
    markCheckLater,
    decrementOneBought,
    tryNextStore,
    undoSoldOutOrNotFoundAt,
    resumeDeferOrSkipAt,
    clearAllBuyingProgress,
  } = useAppStore()
  const categories = useAppStore((s) => s.categories)

  const isFlatLocations = locationLayout === "flat"

  const activeStoreId = isFlatLocations
    ? shoppingStoreId != null && shoppingStoreId !== ""
      ? shoppingStoreId
      : undefined
    : shoppingStoreId != null && shoppingStoreId !== ""
      ? shoppingStoreId
      : (item.currentStoreId ?? undefined)

  const routePrimaryStore = getStoreById(stores, item.currentStoreId)
  const focusStore =
    activeStoreId !== undefined
      ? getStoreById(stores, activeStoreId)
      : !isFlatLocations
        ? routePrimaryStore
        : undefined
  const routeStoresSorted = isFlatLocations ? getItemRouteStoresSorted(item, stores) : []
  const shelfOpts =
    activeStoreId !== undefined ? ({ atStoreId: activeStoreId } as const) : undefined

  const backupStores = item.backupStoreIds
    .map((id) => getStoreById(stores, id))
    .filter(Boolean) as Store[]
  /** “Also try” / sold-out continuation: never suggest the shelf you’re already on */
  const alsoTryStores =
    activeStoreId !== undefined
      ? backupStores.filter((s) => s.id !== activeStoreId)
      : backupStores
  const progress = getProgressPercentage(item)
  const iconPresentation =
    item.categoryIds[0] != null
      ? getCategoryPresentation(item.categoryIds[0], categories)
      : { label: "", color: "bg-muted text-muted-foreground", emoji: "misc" }
  const recipientsLabel = formatRecipientsDisplay(item.forRecipients)
  const routePrimaryStatus =
    item.currentStoreId !== null
      ? getStoreOptionStatus(item, item.currentStoreId)
      : "not-checked"
  const hereStatus =
    activeStoreId !== undefined ? getStoreOptionStatus(item, activeStoreId) : "not-checked"
  const boughtHere =
    activeStoreId !== undefined ? (item.boughtAtStore[activeStoreId] ?? 0) : 0
  const questComplete = isQuestComplete(item)
  const primaryActions =
    activeStoreId !== undefined ? showsPrimaryShoppingActionsAt(item, activeStoreId) : false
  const deferredLater =
    activeStoreId !== undefined ? showsDeferredQuickActionsAt(item, activeStoreId) : false
  const deferredSkip =
    activeStoreId !== undefined ? showsSkipQuickActionsAt(item, activeStoreId) : false
  const soldOutContinue = showsSoldOutContinuation(item)
  const shelfBlockersElsewhere =
    isFlatLocations || questComplete || activeStoreId === undefined
      ? []
      : getShelfBlockersElsewhere(item, activeStoreId)
  const showAlsoAtBadges =
    !isFlatLocations &&
    showBackupStores &&
    alsoTryStores.length > 0 &&
    showActions &&
    !questComplete &&
    !deferredLater &&
    !deferredSkip &&
    (primaryActions ||
      (!soldOutContinue &&
        (routePrimaryStatus === "sold-out" || routePrimaryStatus === "not-found")))

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/50"
      >
        <div
          className={cn(
            "flex items-center justify-center size-8 rounded-lg shrink-0",
            iconPresentation.color
          )}
          aria-hidden
        >
          <ShoppingBag className="size-4 opacity-90" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {item.quantityBought}/{item.quantity}
            {recipientsLabel ? ` · ${recipientsLabel}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-lg text-muted-foreground" asChild>
          <Link href={editItemPagePath(item.id)} prefetch aria-label={`Edit ${item.name}`}>
            <Pencil className="size-3.5" aria-hidden />
          </Link>
        </Button>
        {questComplete ? (
          <div className="flex items-center justify-center size-8 rounded-full bg-success/20 text-success">
            <Check className="size-4" />
          </div>
        ) : item.categoryIds.length === 0 ? (
          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">No tag</span>
        ) : (
          <Badge className={cn(iconPresentation.color, "text-xs")} variant="secondary">
            {iconPresentation.label}
            {item.categoryIds.length > 1 ? ` +${item.categoryIds.length - 1}` : ""}
          </Badge>
        )}
      </motion.div>
    )
  }

  const showSoldOutBlock =
    !isFlatLocations &&
    soldOutContinue &&
    alsoTryStores.length > 0 &&
    !questComplete &&
    showActions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/50 transition-shadow",
        questComplete && "ring-success/30 bg-success/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center size-10 rounded-xl shrink-0",
              iconPresentation.color
            )}
            aria-hidden
          >
            <ShoppingBag className="size-5 opacity-90" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight text-balance">
              {item.name}
            </h3>
            {recipientsLabel ? (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                <Sparkles className="size-3 shrink-0" />
                For {recipientsLabel}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-1.5 max-w-[min(100%,14rem)]">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={editItemPagePath(item.id)} prefetch aria-label={`Edit ${item.name}`}>
              <Pencil className="size-4" aria-hidden />
            </Link>
          </Button>
          {item.categoryIds.length === 0 ? (
            <span className="text-[10px] text-muted-foreground font-medium self-center whitespace-nowrap pt-1">
              No category
            </span>
          ) : (
            item.categoryIds.map((cid) => {
              const c = getCategoryPresentation(cid, categories)
              return (
                <Badge
                  key={cid}
                  className={cn(c.color, "shrink-0 text-[10px] px-2 py-0")}
                  variant="secondary"
                >
                  {c.label}
                </Badge>
              )
            })
          )}
        </div>
      </div>

      {/* Lookup: equal tiles for every shelf. Store / peek: one main pin + optional route note. */}
      {isFlatLocations ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5 uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
              On your route
            </span>
            <span className="normal-case font-normal tracking-normal text-[11px] opacity-90">
              1 = highest priority
            </span>
          </p>
          {routeStoresSorted.length === 0 ? (
            <p className="text-xs text-muted-foreground rounded-xl bg-muted/40 px-3 py-2">
              No shops linked yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {routeStoresSorted.map((st, routeIndex) => {
                const opt = getStoreOptionStatus(item, st.id)
                const boughtHereCount = item.boughtAtStore[st.id] ?? 0
                const hint =
                  opt === "not-checked"
                    ? null
                    : storeOptionStatusConfig[opt].short ??
                      storeOptionStatusConfig[opt].label
                const tileClass = cn(
                  "flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 flex-1 min-w-[10rem] max-w-full sm:max-w-[13rem] transition-colors",
                  opt === "sold-out" || opt === "not-found"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border/70 bg-card ring-1 ring-border/40"
                )
                const tileBody = (
                  <>
                    <span className="font-semibold text-sm leading-snug text-balance">
                      <span
                        className={cn(
                          "tabular-nums mr-1.5",
                          routeIndex === 0 ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {routeIndex + 1}.
                      </span>
                      {st.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{st.area}</span>
                    {(hint || boughtHereCount > 0) && (
                      <span className="text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/50 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        {boughtHereCount > 0 && (
                          <span className="font-medium tabular-nums text-foreground">
                            {boughtHereCount} gotten
                          </span>
                        )}
                        {boughtHereCount > 0 && hint ? (
                          <span className="opacity-45" aria-hidden>
                            ·
                          </span>
                        ) : null}
                        {hint ? <span>{hint}</span> : null}
                      </span>
                    )}
                  </>
                )
                return linkStoreNames ? (
                  <SmartStoreLink
                    key={st.id}
                    storeId={st.id}
                    className={cn(
                      tileClass,
                      "hover:bg-muted/35 active:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    {tileBody}
                  </SmartStoreLink>
                ) : (
                  <div key={st.id} className={tileClass}>
                    {tileBody}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {focusStore &&
            (linkStoreNames ? (
              <SmartStoreLink
                storeId={focusStore.id}
                className={cn(
                  "flex items-center gap-2 text-sm rounded-xl -m-1 p-2 ring-1 ring-transparent transition-all",
                  "hover:ring-border/80 hover:bg-muted/40 active:scale-[0.99]",
                  "[aria-current=page]:hover:bg-transparent [aria-current=page]:hover:ring-transparent [aria-current=page]:active:scale-100 [aria-current=page]:opacity-90"
                )}
              >
                <MapPin className="size-4 text-primary shrink-0" aria-hidden />
                <span className="font-medium">{focusStore.name}</span>
                <span className="text-muted-foreground">({focusStore.area})</span>
              </SmartStoreLink>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-primary" aria-hidden />
                <span className="font-medium">{focusStore.name}</span>
                <span className="text-muted-foreground">({focusStore.area})</span>
              </div>
            ))}
          {routePrimaryStore && focusStore && routePrimaryStore.id !== focusStore.id && (
            <p className="text-xs text-muted-foreground -mt-1 pl-1">
              Route also lists{" "}
              <span className="font-medium text-foreground">{routePrimaryStore.name}</span>
              <span className="opacity-80"> ({routePrimaryStore.area})</span>
            </p>
          )}
        </>
      )}

      {/* Reminder: already marked unavailable at other shelves */}
      {shelfBlockersElsewhere.length > 0 && (
        <div
          role="status"
          className="flex flex-col gap-1.5 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2.5 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5 font-semibold text-warning-foreground">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
            Not available elsewhere
          </span>
          <ul className="space-y-1 pl-4 list-disc marker:text-warning/70">
            {shelfBlockersElsewhere.map(({ storeId, status }) => {
              const st = getStoreById(stores, storeId)
              const name = st?.name ?? "Unknown store"
              const prefix = status === "sold-out" ? "Sold out at " : "Not found at "
              const body =
                linkStoreNames && st ? (
                  <SmartStoreLink
                    storeId={st.id}
                    className="font-medium text-foreground underline-offset-2 hover:underline active:opacity-90"
                  >
                    {name}
                  </SmartStoreLink>
                ) : (
                  <span className="font-medium text-foreground">{name}</span>
                )
              return (
                <li key={`${storeId}-${status}`}>
                  {prefix}
                  {body}
                  {st?.area ? (
                    <span className="opacity-80"> ({st.area})</span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Progress Bar */}
      {(item.quantity > 1 || item.quantityBought > 0) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2.5 flex-1" />
            <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums shrink-0">
              <Package className="size-4 text-muted-foreground" />
              <span className="text-primary">{item.quantityBought}</span>
              <span className="text-muted-foreground">/</span>
              <span>{item.quantity}</span>
            </div>
          </div>
          {boughtHere > 0 && focusStore && (
            <p className="text-xs text-muted-foreground -mt-0.5">
              {boughtHere} gotten at {focusStore.name}
              {item.quantityBought > boughtHere &&
                ` (${item.quantityBought} total across stores)`}
            </p>
          )}
          {item.quantityBought > 0 && showActions && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground self-start -mt-0.5"
              onClick={() => decrementOneBought(item.id, shelfOpts)}
            >
              <Minus className="size-3.5 mr-1" aria-hidden />
              Remove 1 bought
            </Button>
          )}
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

      {/* Quest complete */}
      {questComplete && (
        <div className="flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 bg-success/10 text-success">
          <Check className="size-4" />
          <span>Bought!</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={() => clearAllBuyingProgress(item.id)}
          >
            Undo
          </Button>
        </div>
      )}

      {/* Sold out / not found at this shelf only (other stores keep their own counts & statuses) */}
      {!questComplete &&
        activeStoreId !== undefined &&
        (hereStatus === "sold-out" || hereStatus === "not-found") && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5",
              "bg-destructive/10 text-destructive"
            )}
          >
            <X className="size-4" />
            <span>
              {hereStatus === "not-found" ? "Not found here" : "Sold out here"}
              {boughtHere > 0 ? ` · Got ${boughtHere} here already` : ""}
              {item.quantityBought > 0 && item.quantityBought < item.quantity ? (
                <span className="font-normal opacity-90">
                  {" "}
                  ({item.quantityBought}/{item.quantity} total)
                </span>
              ) : null}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 text-xs text-destructive"
              onClick={() => undoSoldOutOrNotFoundAt(item.id, activeStoreId)}
            >
              Undo
            </Button>
          </div>
        )}

      {/* Check later */}
      {!questComplete && deferredLater && (
        <div className="flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 bg-muted text-muted-foreground">
          <Clock className="size-4" />
          <span>Check later</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={() =>
              activeStoreId !== undefined && resumeDeferOrSkipAt(item.id, activeStoreId)
            }
          >
            Undo
          </Button>
        </div>
      )}

      {/* Skip */}
      {!questComplete && deferredSkip && (
        <div className="flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 bg-muted text-muted-foreground">
          <X className="size-4" />
          <span>Skipped</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={() =>
              activeStoreId !== undefined && resumeDeferOrSkipAt(item.id, activeStoreId)
            }
          >
            Undo
          </Button>
        </div>
      )}

      {/* Backup stores when sold out / not found with backups */}
      {showSoldOutBlock && (
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
            {alsoTryStores.map((store) =>
              linkStoreNames ? (
                <Button
                  key={store.id}
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs rounded-lg px-2.5"
                  asChild
                >
                  <SmartStoreLink storeId={store.id}>
                    <MapPin className="size-3 mr-1" aria-hidden />
                    {store.name}
                  </SmartStoreLink>
                </Button>
              ) : (
                <Button
                  key={store.id}
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs rounded-lg"
                  type="button"
                  onClick={() => tryNextStore(item.id, store.id)}
                >
                  <MapPin className="size-3 mr-1" aria-hidden />
                  {store.name}
                </Button>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Other locations (lookup-style); hidden when “Next places” buttons already list the same backups */}
      {showAlsoAtBadges && (
        <div className="ml-0 pl-3 border-l-2 border-primary/20">
          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
            <MapPin className="size-3" />
            Also try:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {alsoTryStores.map((store) =>
              linkStoreNames ? (
                <Badge key={store.id} variant="outline" className="text-xs font-normal" asChild>
                  <SmartStoreLink className="cursor-pointer active:opacity-80" storeId={store.id}>
                    {store.name}
                    <span className="opacity-70 ml-1">({store.area})</span>
                  </SmartStoreLink>
                </Badge>
              ) : (
                <Badge key={store.id} variant="outline" className="text-xs font-normal">
                  {store.name}
                  <span className="opacity-70 ml-1">({store.area})</span>
                </Badge>
              )
            )}
          </div>
        </div>
      )}

      {/* Action Buttons — primary hunt */}
      {!questComplete &&
        primaryActions &&
        showActions &&
        !deferredLater &&
        !deferredSkip &&
        !(hereStatus === "sold-out" || hereStatus === "not-found") && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Button
              variant="default"
              size="sm"
              className="flex-col gap-0.5 h-auto py-2.5 rounded-xl bg-success hover:bg-success/90 text-white font-semibold shadow-md shadow-success/20"
              onClick={() => markBought(item.id, 1, shelfOpts)}
            >
              <ShoppingBag className="size-4" />
              <span className="text-[10px]">Bought!</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-col gap-0.5 h-auto py-2.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => markSoldOut(item.id, shelfOpts)}
            >
              <X className="size-4" />
              <span className="text-[10px]">Sold Out</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-col gap-0.5 h-auto py-2.5 rounded-xl"
              onClick={() => markCheckLater(item.id, shelfOpts)}
            >
              <Clock className="size-4" />
              <span className="text-[10px]">Later</span>
            </Button>
          </div>
        )}
    </motion.div>
  )
}
