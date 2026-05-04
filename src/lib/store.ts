import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Per-store checkout status for the current item × store pairing (see README StoreOption.status). */
export type StoreOptionStatus =
  | "not-checked"
  | "found"
  | "sold-out"
  | "not-found"
  | "check-later"
  | "bought-here"
  | "skip"

export type Category = "fashion" | "food" | "merch" | "beauty" | "home" | "misc"

export interface Store {
  id: string
  name: string
  area: string
  address?: string
  notes?: string
  hours?: string
}

export interface Item {
  id: string
  name: string
  /** Recipient names (deduped, order normalised on save). Empty = not specified. */
  forRecipients: string[]
  /** Tags from the category catalog — empty means uncategorized in filters. */
  categoryIds: string[]
  quantity: number
  quantityBought: number
  currentStoreId: string | null
  backupStoreIds: string[]
  /** Status of this item at each store ID (typically current + backups visited). Missing key = not-checked. */
  storeStatuses: Record<string, StoreOptionStatus>
  /** Units bought at each store ID (supports undo per store). */
  boughtAtStore: Record<string, number>
  notes?: string
  price?: string
  isPacked: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryDefinition {
  id: string
  label: string
}

export const categoryConfig: Record<Category, { label: string; color: string; emoji: string }> =
  {
    fashion: { label: "Fashion", color: "bg-pastel-pink text-foreground", emoji: "fashion" },
    food: { label: "Food", color: "bg-pastel-orange text-foreground", emoji: "food" },
    merch: { label: "Merch", color: "bg-pastel-blue text-foreground", emoji: "merch" },
    beauty: { label: "Beauty", color: "bg-pastel-purple text-foreground", emoji: "beauty" },
    home: { label: "Home", color: "bg-pastel-green text-foreground", emoji: "home" },
    misc: { label: "Misc", color: "bg-pastel-yellow text-foreground", emoji: "misc" },
  }

export const BUILTIN_CATEGORY_IDS = [
  "fashion",
  "food",
  "merch",
  "beauty",
  "home",
  "misc",
] as const satisfies readonly Category[]

const EXTRA_CATEGORY_COLORS = [
  "bg-pastel-pink text-foreground",
  "bg-pastel-orange text-foreground",
  "bg-pastel-blue text-foreground",
  "bg-pastel-purple text-foreground",
  "bg-pastel-green text-foreground",
  "bg-pastel-yellow text-foreground",
] as const

/** Filter chip id when matching items with zero categories. */
export const FILTER_UNCATEGORIZED = "__uncategorized__" as const

/** Dedupe case-insensitively, trim, sort alphabetically for stable grouping & export. */
export function normalizeRecipientNames(names: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const n of names) {
    if (typeof n !== "string") continue
    const t = n.trim()
    if (!t) continue
    const low = t.toLowerCase()
    if (seen.has(low)) continue
    seen.add(low)
    out.push(t)
  }
  out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
  return out
}

/** Canonical haul grouping key from an item’s recipient set (same set → same bucket). */
export const RECIPIENT_GROUP_EMPTY = "__none__" as const

export function recipientGroupKey(item: Item): string {
  const n = normalizeRecipientNames(item.forRecipients)
  if (n.length === 0) return RECIPIENT_GROUP_EMPTY
  return n.join("\u0001")
}

/** Inline label, e.g. `Mum & Dad`. */
export function formatRecipientsDisplay(forRecipients: readonly string[]): string {
  return normalizeRecipientNames(forRecipients).join(" & ")
}

/** Heading from a haul group key returned by `recipientGroupKey`. */
export function formatRecipientGroupHeading(groupKey: string): string {
  if (groupKey === RECIPIENT_GROUP_EMPTY) return "Recipient not set"
  return groupKey.split("\u0001").join(" & ")
}

export function slugCategoryId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function defaultCategoryDefinitions(): CategoryDefinition[] {
  return BUILTIN_CATEGORY_IDS.map((id) => ({
    id,
    label: categoryConfig[id].label,
  }))
}

function mergeCategoryCatalog(persisted: unknown): CategoryDefinition[] {
  const base = defaultCategoryDefinitions()
  const byId = new Map(base.map((d) => [d.id, { ...d }]))
  if (Array.isArray(persisted)) {
    for (const row of persisted) {
      if (!isRecord(row) || typeof row.id !== "string" || typeof row.label !== "string") continue
      byId.set(row.id, { id: row.id, label: row.label.trim() || row.id })
    }
  }
  const builtinsOrdered = BUILTIN_CATEGORY_IDS.map((id) => byId.get(id)!).filter(Boolean)
  const rest = [...byId.keys()]
    .filter((id) => !(BUILTIN_CATEGORY_IDS as readonly string[]).includes(id))
    .sort((a, b) => {
      const la = byId.get(a)!.label
      const lb = byId.get(b)!.label
      return la.localeCompare(lb, undefined, { sensitivity: "base" })
    })
    .map((id) => byId.get(id)!)
  return [...builtinsOrdered, ...rest]
}

export function getCategoryPresentation(
  categoryId: string,
  definitions: CategoryDefinition[]
): { label: string; color: string; emoji: string } {
  const builtin = categoryConfig[categoryId as Category]
  const label =
    definitions.find((d) => d.id === categoryId)?.label ?? builtin?.label ?? categoryId
  const emoji = builtin?.emoji ?? "misc"
  const color =
    builtin?.color ??
    EXTRA_CATEGORY_COLORS[
      [...categoryId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
        EXTRA_CATEGORY_COLORS.length
    ]
  return { label, color, emoji }
}

/** Back-compat helper when definitions are not wired (built-in labels/colors only). */
export function getCategoryConfig(categoryId: string): {
  label: string
  color: string
  emoji: string
} {
  return getCategoryPresentation(categoryId, [])
}

export function itemPassesCategoryFilters(item: Item, selected: string[]): boolean {
  if (selected.length === 0) return true
  const wantsUncategorized = selected.includes(FILTER_UNCATEGORIZED)
  const slugSelected = selected.filter((id) => id !== FILTER_UNCATEGORIZED)
  const cats = item.categoryIds
  if (wantsUncategorized && cats.length === 0) return true
  if (slugSelected.length > 0 && cats.some((c) => slugSelected.includes(c))) return true
  return false
}

const STORE_OPTION_STATUSES: StoreOptionStatus[] = [
  "not-checked",
  "found",
  "sold-out",
  "not-found",
  "check-later",
  "bought-here",
  "skip",
]

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function coerceStoreStatuses(raw: unknown): Record<string, StoreOptionStatus> {
  if (!isRecord(raw)) return {}
  const out: Record<string, StoreOptionStatus> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v !== "string") continue
    if ((STORE_OPTION_STATUSES as readonly string[]).includes(v)) {
      out[k] = v as StoreOptionStatus
    }
  }
  return out
}

function coerceBoughtAtStore(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw)) {
    const n = typeof v === "number" ? v : Number(v)
    if (!Number.isFinite(n) || n <= 0) continue
    out[k] = Math.floor(n)
  }
  return out
}

function migrateLegacyItemStatus(status: unknown): StoreOptionStatus {
  switch (status) {
    case "found":
      return "found"
    case "sold-out":
      return "sold-out"
    case "bought":
      return "bought-here"
    case "skipped":
      return "check-later"
    case "hunting":
    default:
      return "not-checked"
  }
}

function coerceForRecipients(raw: Record<string, unknown>): string[] {
  if (Array.isArray(raw.forRecipients)) {
    const strings = raw.forRecipients.filter((x): x is string => typeof x === "string")
    return normalizeRecipientNames(strings)
  }
  const legacy =
    typeof raw.forWho === "string"
      ? raw.forWho.trim()
      : typeof raw.who === "string"
        ? raw.who.trim()
        : ""
  if (!legacy) return []
  if (legacy.includes(",") || legacy.includes("&")) {
    const parts = legacy.split(/[,&]+/).map((s) => s.trim()).filter(Boolean)
    return normalizeRecipientNames(parts)
  }
  return normalizeRecipientNames([legacy])
}

/** Normalize persisted or imported JSON into a valid Item (never throws). */
export function normalizeItem(raw: unknown): Item | null {
  if (!isRecord(raw)) {
    return null
  }
  const quantity = Math.max(1, Number(raw.quantity) || 1)
  let quantityBought = Math.max(0, Number(raw.quantityBought) || 0)

  const currentStoreId =
    typeof raw.currentStoreId === "string"
      ? raw.currentStoreId
      : raw.currentStoreId === null
        ? null
        : null

  const backupStoreIds = Array.isArray(raw.backupStoreIds)
    ? (raw.backupStoreIds.filter((id) => typeof id === "string") as string[])
    : []

  const storeStatuses = coerceStoreStatuses(raw.storeStatuses)
  const boughtAtStore = coerceBoughtAtStore(raw.boughtAtStore)

  const hasLegacyTopLevelStatus = "status" in raw && typeof raw.status === "string"

  if (currentStoreId && Object.keys(storeStatuses).length === 0 && hasLegacyTopLevelStatus) {
    storeStatuses[currentStoreId] = migrateLegacyItemStatus(raw.status)
  }

  const legacySaysBought = hasLegacyTopLevelStatus && raw.status === "bought"

  function coerceCategoryIds(r: Record<string, unknown>): string[] {
    if (Array.isArray(r.categoryIds)) {
      const ids = r.categoryIds
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
      const uniq = [...new Set(ids)]
      if (uniq.length > 0) return uniq
    }
    if (typeof r.category === "string" && r.category.trim()) {
      const c = r.category.trim().toLowerCase()
      const allowed: Category[] = ["fashion", "food", "merch", "beauty", "home", "misc"]
      if (allowed.includes(c as Category)) return [c as Category]
      return ["misc"]
    }
    return []
  }

  if (
    quantityBought > 0 &&
    Object.keys(boughtAtStore).length === 0 &&
    currentStoreId
  ) {
    boughtAtStore[currentStoreId] = quantityBought
  }

  if (quantityBought > 0 && quantityBought < quantity && currentStoreId) {
    const prev = storeStatuses[currentStoreId] ?? "not-checked"
    if (prev === "not-checked") {
      storeStatuses[currentStoreId] = "bought-here"
    }
  }

  if ((legacySaysBought || quantityBought >= quantity) && quantityBought >= quantity && currentStoreId) {
    storeStatuses[currentStoreId] = "bought-here"
  }

  const summed = Object.values(boughtAtStore).reduce((a, b) => a + b, 0)
  quantityBought = Math.max(quantityBought, summed)

  const id = typeof raw.id === "string" ? raw.id : Date.now().toString()
  const name =
    typeof raw.name === "string"
      ? raw.name
      : typeof raw.title === "string"
        ? raw.title
        : "Item"
  const forRecipients = coerceForRecipients(raw)
  const categoryIds = coerceCategoryIds(raw)
  const createdAt =
    typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString()
  const updatedAt =
    typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString()

  return {
    id,
    name,
    forRecipients,
    categoryIds,
    quantity,
    quantityBought,
    currentStoreId,
    backupStoreIds,
    storeStatuses,
    boughtAtStore,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    price: typeof raw.price === "string" ? raw.price : undefined,
    isPacked: !!raw.isPacked,
    createdAt,
    updatedAt,
  }
}

export function normalizeItems(items: unknown): Item[] {
  if (!Array.isArray(items)) return []
  return items.map((row) => normalizeItem(row)).filter((x): x is Item => x !== null)
}

/** Rehydrated / imported stores only (never throws). Drops invalid rows; replaces duplicate IDs with later row. */
function normalizeStoredStores(rows: unknown): Store[] {
  if (!Array.isArray(rows)) return []
  const byId = new Map<string, Store>()
  for (const row of rows) {
    if (!isRecord(row)) continue
    const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : null
    if (!id) continue
    const nameRaw = typeof row.name === "string" ? row.name.trim() : ""
    const name = nameRaw || "Untitled shop"
    const areaRaw = typeof row.area === "string" ? row.area.trim() : ""
    const area = areaRaw || "Unset"
    byId.set(id, {
      id,
      name,
      area,
      address: typeof row.address === "string" ? row.address : undefined,
      notes: typeof row.notes === "string" ? row.notes : undefined,
      hours: typeof row.hours === "string" ? row.hours : undefined,
    })
  }
  return [...byId.values()]
}

export function getStoreOptionStatus(item: Item, storeId: string): StoreOptionStatus {
  return item.storeStatuses[storeId] ?? "not-checked"
}

export function getCurrentStoreStatus(item: Item): StoreOptionStatus {
  const id = item.currentStoreId
  if (!id) return "not-checked"
  return getStoreOptionStatus(item, id)
}

export type ShelfBlocker = { storeId: string; status: "sold-out" | "not-found" }

/** Other shelves you marked sold-out / not-found while shopping at `currentShelfId` (route + backups + any visited key). */
export function getShelfBlockersElsewhere(item: Item, currentShelfId: string): ShelfBlocker[] {
  const ids = new Set<string>()
  if (item.currentStoreId) ids.add(item.currentStoreId)
  for (const id of item.backupStoreIds) {
    ids.add(id)
  }
  for (const id of Object.keys(item.storeStatuses)) {
    ids.add(id)
  }

  const out: ShelfBlocker[] = []
  for (const id of ids) {
    if (id === currentShelfId) continue
    const s = getStoreOptionStatus(item, id)
    if (s === "sold-out" || s === "not-found") {
      out.push({ storeId: id, status: s })
    }
  }
  out.sort((a, b) => a.storeId.localeCompare(b.storeId))
  return out
}

export function isQuestComplete(item: Item): boolean {
  return item.quantityBought >= item.quantity
}

/** Today / Stores lists: unfinished quest items still “on the trip” — includes sold out / not found so backups stay visible. Excludes defer / skip / complete. */
export function showsOnTodayView(item: Item): boolean {
  if (item.quantity <= 0) return false
  if (!item.currentStoreId) return false
  if (item.quantityBought >= item.quantity) return false
  const s = getCurrentStoreStatus(item)
  return s !== "check-later" && s !== "skip"
}

/** Bought / Sold out / Later at a specific shelf (primary or backup). Global “primary row” delegates here with `item.currentStoreId`. */
export function showsPrimaryShoppingActionsAt(item: Item, storeId: string): boolean {
  if (item.quantity <= 0) return false
  if (!item.currentStoreId) return false
  if (item.quantityBought >= item.quantity) return false
  const inScope = item.currentStoreId === storeId || item.backupStoreIds.includes(storeId)
  if (!inScope) return false
  const s = getStoreOptionStatus(item, storeId)
  return s === "not-checked" || s === "found" || s === "bought-here"
}

/** Bought / Sold out / Later quick actions at the route primary (legacy single-store mental model). */
export function showsPrimaryShoppingActions(item: Item): boolean {
  if (!item.currentStoreId) return false
  return showsPrimaryShoppingActionsAt(item, item.currentStoreId)
}

/** Item appears while browsing Store X — same semantics as legacy `hunting` + `getItemsByStore`. */
export function appearsActiveForStoreRow(item: Item, storeId: string): boolean {
  const inStoreScope =
    item.currentStoreId === storeId ||
    item.backupStoreIds.includes(storeId)
  if (!inStoreScope || item.quantity <= 0) return false
  if (item.quantityBought >= item.quantity) return false
  const s = getStoreOptionStatus(item, storeId)
  return s !== "check-later" && s !== "skip"
}

/** Sold out / not found at primary with backups — user may navigate (also visible in haul). */
export function showsSoldOutContinuation(item: Item): boolean {
  if (item.quantityBought >= item.quantity) return false
  if (!item.currentStoreId) return false
  const s = getStoreOptionStatus(item, item.currentStoreId)
  return (
    (s === "sold-out" || s === "not-found") &&
    item.backupStoreIds.length > 0
  )
}

export function showsDeferredQuickActionsAt(item: Item, storeId: string): boolean {
  if (!item.currentStoreId) return false
  if (item.quantity <= 0) return false
  if (item.quantityBought >= item.quantity) return false
  const inScope = item.currentStoreId === storeId || item.backupStoreIds.includes(storeId)
  if (!inScope) return false
  return getStoreOptionStatus(item, storeId) === "check-later"
}

export function showsDeferredQuickActions(item: Item): boolean {
  if (!item.currentStoreId) return false
  return showsDeferredQuickActionsAt(item, item.currentStoreId)
}

export function showsSkipQuickActionsAt(item: Item, storeId: string): boolean {
  if (!item.currentStoreId) return false
  if (item.quantity <= 0) return false
  if (item.quantityBought >= item.quantity) return false
  const inScope = item.currentStoreId === storeId || item.backupStoreIds.includes(storeId)
  if (!inScope) return false
  return getStoreOptionStatus(item, storeId) === "skip"
}

export function showsSkipQuickActions(item: Item): boolean {
  if (!item.currentStoreId) return false
  return showsSkipQuickActionsAt(item, item.currentStoreId)
}

/** Primary + backup shelves only (no extra keys from one-off visits). */
export function getPlannedHuntStoreIds(item: Item): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  if (item.currentStoreId && !seen.has(item.currentStoreId)) {
    seen.add(item.currentStoreId)
    out.push(item.currentStoreId)
  }
  for (const id of item.backupStoreIds) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

export function isSoldOutEverywhereOnPlannedRoute(item: Item): boolean {
  const route = getPlannedHuntStoreIds(item)
  if (route.length === 0) return false
  return route.every((id) => getStoreOptionStatus(item, id) === "sold-out")
}

/** Trip-oriented filter bucket (lookup + status views). */
export type HolidayPlanningBucket =
  | "complete"
  | "sold-out-route"
  | "paused"
  | "skipped"
  | "still-hunting"

export const holidayPlanningBuckets: HolidayPlanningBucket[] = [
  "complete",
  "still-hunting",
  "sold-out-route",
  "paused",
  "skipped",
]

export const holidayPlanningBucketConfig: Record<HolidayPlanningBucket, { label: string; short?: string }> =
  {
    complete: { label: "Done", short: "Done" },
    "still-hunting": { label: "Still hunting", short: "Active" },
    "sold-out-route": { label: "Sold out everywhere", short: "All out" },
    paused: { label: "Check later", short: "Later" },
    skipped: { label: "Skipped", short: "Skip" },
  }

export function getHolidayPlanningBucket(item: Item): HolidayPlanningBucket {
  if (item.quantityBought >= item.quantity) return "complete"
  if (!item.currentStoreId) return "still-hunting"
  const primary = getStoreOptionStatus(item, item.currentStoreId)
  if (primary === "check-later") return "paused"
  if (primary === "skip") return "skipped"
  if (isSoldOutEverywhereOnPlannedRoute(item)) return "sold-out-route"
  return "still-hunting"
}

/** @deprecated Use `HolidayPlanningBucket` / `getHolidayPlanningBucket` */
export type ItemLookupBucket = HolidayPlanningBucket

/** @deprecated Use `getHolidayPlanningBucket` */
export function getItemLookupBucket(item: Item): ItemLookupBucket {
  return getHolidayPlanningBucket(item)
}

function touch(now: string, item: Item): Item {
  return { ...item, updatedAt: now }
}

/** Shelf you are acting on: explicit (`atStoreId`) or route primary. Backups allowed for buys / shelf flags only. */
function resolveActionStore(item: Item, atStoreId?: string | null): string | null {
  const sid = atStoreId ?? item.currentStoreId
  if (!sid) return null
  if (item.currentStoreId === sid) return sid
  if (item.backupStoreIds.includes(sid)) return sid
  return null
}

function withActionStore(
  item: Item,
  atStoreId: string | undefined,
  updater: (item: Item, storeId: string) => Item
): Item {
  const sid = resolveActionStore(item, atStoreId)
  if (!sid) return item
  return updater(item, sid)
}

export function mergeStoreStatus(
  item: Item,
  storeId: string,
  status: StoreOptionStatus
): Item {
  return {
    ...item,
    storeStatuses: { ...item.storeStatuses, [storeId]: status },
  }
}

/** Undo Sold out / Not found here without wiping units already bought at this shelf (e.g. 4/10 then shelf empty). */
function undoSoldOutOrNotFoundAtStore(item: Item, storeId: string): Item {
  const prev = item.storeStatuses[storeId]
  if (prev !== "sold-out" && prev !== "not-found") return item
  const n = item.boughtAtStore[storeId] ?? 0
  const nextStatus: StoreOptionStatus =
    n >= item.quantity ? "bought-here" : n > 0 ? "bought-here" : "not-checked"
  return mergeStoreStatus({ ...item }, storeId, nextStatus)
}

/** Clear Later / Skip at this shelf only (does not touch purchase counts elsewhere). */
function resumeDeferSkipAtStore(item: Item, storeId: string): Item {
  const s = item.storeStatuses[storeId]
  if (s !== "check-later" && s !== "skip") return item
  const ss = { ...item.storeStatuses }
  delete ss[storeId]
  return { ...item, storeStatuses: ss }
}

function clearStoreProgress(item: Item, storeId: string): Item {
  const storeStatuses = { ...item.storeStatuses }
  delete storeStatuses[storeId]
  const boughtAtStore = { ...item.boughtAtStore }
  const boughtHere = boughtAtStore[storeId] ?? 0
  delete boughtAtStore[storeId]
  const quantityBought = Math.max(0, item.quantityBought - boughtHere)
  return {
    ...item,
    storeStatuses,
    boughtAtStore,
    quantityBought,
  }
}

interface AppState {
  items: Item[]
  stores: Store[]
  /** User-editable category tags (built-ins + customs). */
  categories: CategoryDefinition[]
  activeTab: string

  addItem: (
    item: Omit<Item, "id" | "createdAt" | "updatedAt" | "isPacked" | "storeStatuses" | "boughtAtStore"> &
      Partial<Pick<Item, "storeStatuses" | "boughtAtStore">>
  ) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
  markBought: (id: string, quantity?: number, options?: { atStoreId?: string }) => void
  /** Remove one purchase count (prefers `atStoreId`, else route primary); no-op if quantityBought is 0. */
  decrementOneBought: (id: string, options?: { atStoreId?: string }) => void
  /** Haul-only: add 1 purchased unit past the quest goal (`quantity`) when you stocked up. */
  incrementExtraBought: (id: string) => void
  markSoldOut: (id: string, options?: { atStoreId?: string }) => void
  markNotFound: (id: string, options?: { atStoreId?: string }) => void
  markCheckLater: (id: string, options?: { atStoreId?: string }) => void
  markSkip: (id: string, options?: { atStoreId?: string }) => void
  /** Clears shelf status + this store’s share of `boughtAtStore` only. Default shelf = route primary. */
  resetProgressAt: (id: string, atStoreId?: string) => void
  undoSoldOutOrNotFoundAt: (id: string, storeId: string) => void
  resumeDeferOrSkipAt: (id: string, storeId: string) => void
  /** Nuke purchase counts everywhere (Undo after quest marked complete everywhere). Keeps routing fields. */
  clearAllBuyingProgress: (id: string) => void
  resetCurrentStoreProgress: (id: string) => void
  /** @deprecated Prefer resetCurrentStoreProgress */
  resetStatus: (id: string) => void
  togglePacked: (id: string) => void
  tryNextStore: (id: string, nextBackupStoreId?: string) => void

  /** Creates a store and returns its id (synchronous). */
  addStore: (store: Omit<Store, "id">) => string
  updateStore: (id: string, updates: Partial<Store>) => void
  deleteStore: (id: string) => void

  /** Add a custom category; returns id or null if label empty / duplicate churn. */
  addCategory: (label: string) => string | null
  /** Removes a custom category and strips it from all items (built-ins cannot be removed). */
  removeCategory: (id: string) => void

  setActiveTab: (tab: string) => void

  exportData: () => string
  importData: (data: string) => boolean
  /** Replace list + shops with a small curated demo (Settings). */
  loadDemoData: () => void
}

/** Full sample shops — kept in code for demos & tests; not loaded on first launch. */
export const ARCHIVE_SAMPLE_STORES: Store[] = [
  {
    id: "1",
    name: "Don Quijote Shibuya",
    area: "Shibuya",
    notes: "Open 24hrs",
    hours: "24 hours",
  },
  {
    id: "2",
    name: "Tokyu Hands Shibuya",
    area: "Shibuya",
    notes: "Best for stationery & crafts",
    hours: "10:00-21:00",
  },
  {
    id: "3",
    name: "Onitsuka Tiger Omotesando",
    area: "Harajuku",
    notes: "Main flagship store",
    hours: "11:00-20:00",
  },
  { id: "4", name: "Kiddy Land Harajuku", area: "Harajuku", notes: "Character goods paradise", hours: "11:00-21:00" },
  {
    id: "5",
    name: "Tokyo Banana Tokyo Station",
    area: "Tokyo Station",
    notes: "Inside Yaesu exit",
    hours: "8:00-21:30",
  },
  { id: "6", name: "Animate Ikebukuro Main", area: "Ikebukuro", notes: "9 floors of anime!", hours: "10:00-21:00" },
  {
    id: "7",
    name: "Yodobashi Camera Akiba",
    area: "Akihabara",
    notes: "Electronics + kitchen goods",
    hours: "9:30-22:00",
  },
  { id: "8", name: "LOFT Shibuya", area: "Shibuya", notes: "Lifestyle & stationery", hours: "10:00-21:00" },
  {
    id: "9",
    name: "Muji Ginza Flagship",
    area: "Ginza",
    notes: "Huge selection + hotel",
    hours: "10:00-21:00",
  },
  { id: "10", name: "Daiso Harajuku", area: "Harajuku", notes: "100 yen treasures", hours: "10:00-21:00" },
  { id: "11", name: "Mandarake Nakano", area: "Nakano", notes: "Rare collectibles", hours: "12:00-20:00" },
  {
    id: "12",
    name: "Pokemon Center Mega Tokyo",
    area: "Ikebukuro",
    notes: "In Sunshine City",
    hours: "10:00-20:00",
  },
]

const mkDefaultTimestamps = () => ({
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

function baseItem(
  fields: Omit<Item, "createdAt" | "updatedAt" | "isPacked" | "storeStatuses" | "boughtAtStore"> &
    Partial<Pick<Item, "storeStatuses" | "boughtAtStore">> & { isPacked?: boolean }
): Item {
  const t = mkDefaultTimestamps()
  return {
    ...fields,
    storeStatuses: fields.storeStatuses ?? {},
    boughtAtStore: fields.boughtAtStore ?? {},
    isPacked: fields.isPacked ?? false,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

/** Full sample quest list — kept in code for demos & tests; not loaded on first launch. */
export const ARCHIVE_SAMPLE_ITEMS: Item[] = [
  baseItem({
    id: "1",
    name: "Nyota Blind Box (Cat Series)",
    forRecipients: ["Me"],
    categoryIds: ["merch"],
    quantity: 3,
    quantityBought: 0,
    currentStoreId: "4",
    backupStoreIds: ["6", "11"],
    storeStatuses: {},
    boughtAtStore: {},
    notes: "Check for the limited sakura edition!",
    price: "~1,200 yen each",
  }),
  baseItem({
    id: "2",
    name: "Onitsuka Tiger Mexico 66",
    forRecipients: ["Me"],
    categoryIds: ["fashion"],
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "3",
    backupStoreIds: [],
    notes: "Size 24.5cm - cream/red colorway only",
    price: "~15,000 yen",
  }),
  baseItem({
    id: "3",
    name: "Spicy Furikake (Shrimp)",
    forRecipients: ["Mom"],
    categoryIds: ["food"],
    quantity: 5,
    quantityBought: 2,
    currentStoreId: "1",
    backupStoreIds: ["9"],
    storeStatuses: { "1": "bought-here" },
    boughtAtStore: { "1": 2 },
    notes: "The one with little shrimp bits she loves",
  }),
  baseItem({
    id: "4",
    name: "Premium Hojicha Powder",
    forRecipients: ["Gifts"],
    categoryIds: ["food"],
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "9",
    backupStoreIds: ["1"],
    notes: "Latte-grade, not culinary",
    price: "~800 yen",
  }),
  baseItem({
    id: "5",
    name: "Zojirushi Thermos 500ml",
    forRecipients: ["Dad"],
    categoryIds: ["home"],
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "7",
    backupStoreIds: ["1", "9"],
    notes: "Matte black only - he was specific!",
    price: "~4,000 yen",
  }),
  baseItem({
    id: "6",
    name: "Aesthetic Journal Stickers",
    forRecipients: ["Me"],
    categoryIds: ["misc"],
    quantity: 10,
    quantityBought: 4,
    currentStoreId: "2",
    backupStoreIds: ["8", "10"],
    storeStatuses: { "2": "bought-here" },
    boughtAtStore: { "2": 4 },
    notes: "Washi tape counts too!",
  }),
  baseItem({
    id: "7",
    name: "Tokyo Banana (Original)",
    forRecipients: ["Office"],
    categoryIds: ["food"],
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "5",
    backupStoreIds: [],
    notes: "Get at station before leaving! 12-pack boxes",
    price: "~1,200 yen/box",
  }),
  baseItem({
    id: "8",
    name: "Blue Lock - Isagi Merch",
    forRecipients: ["Brother"],
    categoryIds: ["merch"],
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "6",
    backupStoreIds: ["11"],
    notes: "Keychain or acrylic stand - whatever looks cool",
  }),
  baseItem({
    id: "9",
    name: "JJK Gojo Figure",
    forRecipients: ["Me"],
    categoryIds: ["merch"],
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "6",
    backupStoreIds: ["11", "7"],
    notes: "Check limited editions first!",
    price: "~3,500 yen",
  }),
  baseItem({
    id: "10",
    name: "Shiseido Lip Balm",
    forRecipients: ["Sister"],
    categoryIds: ["beauty"],
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "1",
    backupStoreIds: ["9"],
    notes: "The rose one in the cute tin",
    price: "~1,000 yen",
  }),
  baseItem({
    id: "11",
    name: "Kit Kat Variety Pack",
    forRecipients: ["Gifts"],
    categoryIds: ["food"],
    quantity: 3,
    quantityBought: 0,
    currentStoreId: "1",
    backupStoreIds: ["5"],
    notes: "Matcha, strawberry, sake flavors",
  }),
]

const DEMO_SEED_STORE_IDS = new Set(["1", "2", "3", "4", "5", "6"])

/** Six Tokyo-area shops bundled with “Load demo data”. */
export const DEMO_SEED_STORES: Store[] = ARCHIVE_SAMPLE_STORES.filter((s) => DEMO_SEED_STORE_IDS.has(s.id))

/**
 * Five varied demo items (route, backups, partial progress, categories) using only `DEMO_SEED_STORES`.
 * Safe to call on Settings → Load demo data.
 */
export function getDemoSeedDataset(): { stores: Store[]; items: Item[] } {
  const allowed = DEMO_SEED_STORE_IDS
  const rows = ARCHIVE_SAMPLE_ITEMS.slice(0, 5).map((it) => {
    const currentStoreId =
      it.currentStoreId && allowed.has(it.currentStoreId) ? it.currentStoreId : "1"
    const backupStoreIds = it.backupStoreIds.filter((id) => allowed.has(id) && id !== currentStoreId)
    return { ...it, currentStoreId, backupStoreIds }
  })
  return {
    stores: DEMO_SEED_STORES,
    items: normalizeItems(rows),
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: [],
      stores: [],
      categories: defaultCategoryDefinitions(),
      activeTab: "stores",

      addItem: (item) => {
        const now = new Date().toISOString()
        const full = normalizeItem({
          ...item,
          storeStatuses: item.storeStatuses ?? {},
          boughtAtStore: item.boughtAtStore ?? {},
          id: Date.now().toString(),
          isPacked: false,
          createdAt: now,
          updatedAt: now,
        })
        if (!full) return
        set((state) => ({
          items: [...state.items, full],
        }))
      },

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const merged = normalizeItem({
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            })
            return merged ?? item
          }),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      markBought: (id, quantity = 1, options) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            return touch(
              now,
              withActionStore(item, options?.atStoreId, (it, storeId) => {
                const s = getStoreOptionStatus(it, storeId)
                const block =
                  !["not-checked", "found", "bought-here"].includes(s)
                if (block) return it
                const add = Math.max(1, quantity)
                const nextQty = Math.min(it.quantityBought + add, it.quantity)
                const delta = nextQty - it.quantityBought
                if (delta <= 0) return it

                const boughtAtStore = { ...it.boughtAtStore }
                boughtAtStore[storeId] = (boughtAtStore[storeId] ?? 0) + delta

                return mergeStoreStatus(
                  {
                    ...it,
                    quantityBought: nextQty,
                    boughtAtStore,
                  },
                  storeId,
                  "bought-here"
                )
              })
            )
          }),
        }))
      },

      decrementOneBought: (id, options) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            if (item.quantityBought <= 0) return item

            const boughtAtStore = { ...item.boughtAtStore }
            const prefer = options?.atStoreId
            const cid = item.currentStoreId
            let decrementedFrom: string | undefined
            if (prefer && (boughtAtStore[prefer] ?? 0) > 0) {
              boughtAtStore[prefer]--
              if (boughtAtStore[prefer] <= 0) delete boughtAtStore[prefer]
              decrementedFrom = prefer
            } else if (cid && (boughtAtStore[cid] ?? 0) > 0) {
              boughtAtStore[cid]--
              if (boughtAtStore[cid] <= 0) delete boughtAtStore[cid]
              decrementedFrom = cid
            } else {
              const keysWithStock = Object.keys(boughtAtStore)
                .filter((k) => (boughtAtStore[k] ?? 0) > 0)
                .sort()
              if (keysWithStock.length > 0) {
                const k = keysWithStock[0]
                boughtAtStore[k]!--
                if (boughtAtStore[k]! <= 0) delete boughtAtStore[k]
                decrementedFrom = k
              }
            }

            const shelfHasStockAfter = Object.values(boughtAtStore).some((v) => (v ?? 0) > 0)
            if (!decrementedFrom) {
              if (shelfHasStockAfter) return item
              if (item.quantityBought <= 0) return item
            }

            const quantityBought = Math.max(0, item.quantityBought - 1)
            const storeStatuses = { ...item.storeStatuses }
            if (
              decrementedFrom &&
              storeStatuses[decrementedFrom] === "bought-here" &&
              (boughtAtStore[decrementedFrom] ?? 0) <= 0
            ) {
              delete storeStatuses[decrementedFrom]
            }

            return {
              ...item,
              quantityBought,
              boughtAtStore,
              storeStatuses,
              isPacked: false,
              updatedAt: now,
            }
          }),
        }))
      },

      incrementExtraBought: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const bs = { ...item.boughtAtStore }
            const sid =
              item.currentStoreId ??
              [...Object.entries(bs)]
                .filter(([, n]) => (n ?? 0) > 0)
                .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ??
              item.backupStoreIds[0] ??
              null
            if (!sid) return item
            bs[sid] = (bs[sid] ?? 0) + 1
            return touch(
              now,
              mergeStoreStatus(
                {
                  ...item,
                  quantityBought: item.quantityBought + 1,
                  boughtAtStore: bs,
                  isPacked: false,
                },
                sid,
                "bought-here"
              )
            )
          }),
        }))
      },

      markSoldOut: (id, options) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            return touch(
              now,
              withActionStore(item, options?.atStoreId, (it, storeId) => {
                if (getStoreOptionStatus(it, storeId) === "sold-out") return it
                return mergeStoreStatus(it, storeId, "sold-out")
              })
            )
          }),
        }))
      },

      markNotFound: (id, options) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            return touch(
              now,
              withActionStore(item, options?.atStoreId, (it, storeId) => {
                if (getStoreOptionStatus(it, storeId) === "not-found") return it
                return mergeStoreStatus(it, storeId, "not-found")
              })
            )
          }),
        }))
      },

      markCheckLater: (id, options) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            return touch(
              now,
              withActionStore(item, options?.atStoreId, (it, storeId) => {
                if (getStoreOptionStatus(it, storeId) === "check-later") return it
                return mergeStoreStatus(it, storeId, "check-later")
              })
            )
          }),
        }))
      },

      markSkip: (id, options) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            return touch(
              now,
              withActionStore(item, options?.atStoreId, (it, storeId) => {
                if (getStoreOptionStatus(it, storeId) === "skip") return it
                return mergeStoreStatus(it, storeId, "skip")
              })
            )
          }),
        }))
      },

      resetProgressAt: (id, atStoreId) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const sid =
              atStoreId != null && atStoreId !== ""
                ? resolveActionStore(item, atStoreId)
                : item.currentStoreId
            if (!sid) return item
            return touch(now, clearStoreProgress(item, sid))
          }),
        }))
      },

      undoSoldOutOrNotFoundAt: (id, storeId) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const sid = resolveActionStore(item, storeId)
            if (!sid) return item
            return touch(now, undoSoldOutOrNotFoundAtStore(item, sid))
          }),
        }))
      },

      resumeDeferOrSkipAt: (id, storeId) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const sid = resolveActionStore(item, storeId)
            if (!sid) return item
            return touch(now, resumeDeferSkipAtStore(item, sid))
          }),
        }))
      },

      clearAllBuyingProgress: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? touch(now, {
                  ...item,
                  quantityBought: 0,
                  boughtAtStore: {},
                  storeStatuses: {},
                })
              : item
          ),
        }))
      },

      resetCurrentStoreProgress: (id) => {
        get().resetProgressAt(id)
      },

      resetStatus: (id) => get().resetCurrentStoreProgress(id),

      togglePacked: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, isPacked: !item.isPacked, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      tryNextStore: (id, nextBackupStoreId) => {
        const now = new Date().toISOString()
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const backups = item.backupStoreIds
            if (!item.currentStoreId || backups.length === 0) return item

            const target =
              nextBackupStoreId && backups.includes(nextBackupStoreId)
                ? nextBackupStoreId
                : backups[0]

            if (!backups.includes(target)) return item

            const prev = item.currentStoreId
            const newBackups = backups.filter((x) => x !== target)
            if (prev) newBackups.push(prev)

            const storeStatuses = { ...item.storeStatuses }
            delete storeStatuses[target]

            const nextItem: Item = {
              ...item,
              currentStoreId: target,
              backupStoreIds: newBackups,
              storeStatuses,
              updatedAt: now,
            }
            return nextItem
          }),
        }))
      },

      addStore: (store) => {
        const id = Date.now().toString()
        set((state) => ({
          stores: [...state.stores, { ...store, id }],
        }))
        return id
      },

      updateStore: (id, updates) =>
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === id ? { ...store, ...updates } : store
          ),
        })),

      deleteStore: (id) =>
        set((state) => ({
          stores: state.stores.filter((store) => store.id !== id),
        })),

      addCategory: (label) => {
        const trimmed = label.trim()
        if (!trimmed) return null
        let baseId = slugCategoryId(trimmed)
        if (!baseId) baseId = `cat-${Date.now()}`
        let id = baseId
        let n = 0
        while (get().categories.some((c) => c.id === id) && n < 100) {
          n += 1
          id = `${baseId}-${n}`
        }
        set((s) => ({
          categories: [...s.categories, { id, label: trimmed }],
        }))
        return id
      },

      removeCategory: (id) => {
        if ((BUILTIN_CATEGORY_IDS as readonly string[]).includes(id)) return
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          items: s.items.map((it) => ({
            ...it,
            categoryIds: it.categoryIds.filter((cid) => cid !== id),
          })),
        }))
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      exportData: () => {
        const { items, stores, categories } = get()
        return JSON.stringify(
          { items, stores, categories, exportedAt: new Date().toISOString() },
          null,
          2
        )
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (
            parsed.items &&
            parsed.stores &&
            Array.isArray(parsed.items) &&
            Array.isArray(parsed.stores)
          ) {
            const items = normalizeItems(parsed.items)
            const stores = normalizeStoredStores(parsed.stores)
            const categories = mergeCategoryCatalog(parsed.categories)
            set({ items, stores, categories })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      loadDemoData: () => {
        const { stores, items } = getDemoSeedDataset()
        set({
          stores,
          items,
          categories: defaultCategoryDefinitions(),
        })
      },
    }),
    {
      name: "yv-japan-buy-quest",
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.items = normalizeItems(state.items ?? [])
        state.stores = normalizeStoredStores(state.stores ?? [])
        state.categories = mergeCategoryCatalog(state.categories)
      },
    }
  )
)

// Helper functions
export function getStoreById(stores: Store[], id: string | null): Store | undefined {
  if (!id) return undefined
  return stores.find((s) => s.id === id)
}

/**
 * Every shelf on this item’s hunt route in **priority order**:
 * current store, then backups in list order, then any extra shelves touched via status/buys.
 */
export function getItemRouteStoreIds(item: Item): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (id: string | null | undefined) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    out.push(id)
  }
  push(item.currentStoreId)
  for (const id of item.backupStoreIds) push(id)
  for (const id of Object.keys(item.storeStatuses)) push(id)
  for (const id of Object.keys(item.boughtAtStore)) push(id)
  return out
}

/** 0-based index of a store on this item’s hunt route (`0` = highest priority stop). Larger = lower priority. */
export function shelfRouteRank(item: Item, storeId: string): number {
  const route = getItemRouteStoreIds(item)
  const idx = route.indexOf(storeId)
  return idx === -1 ? 10000 + route.length : idx
}

/** Sort items for one store’s shelf: earlier on that item’s route first, then name. */
export function compareItemsForStoreShelf(a: Item, b: Item, storeId: string): number {
  const d = shelfRouteRank(a, storeId) - shelfRouteRank(b, storeId)
  if (d !== 0) return d
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
}

/** Resolved stores in route priority order (lookup / tiles). */
export function getItemRouteStoresSorted(item: Item, stores: Store[]): Store[] {
  return getItemRouteStoreIds(item)
    .map((id) => getStoreById(stores, id))
    .filter((s): s is Store => s !== undefined)
}

export function getItemsByStore(items: Item[], storeId: string): Item[] {
  return items.filter(
    (item) =>
      item.currentStoreId === storeId || item.backupStoreIds.includes(storeId)
  )
}

/** @deprecated Prefer `getHolidayPlanningBucket` + filter for trip views */
export function getItemsByStoreOptionStatus(items: Item[], status: StoreOptionStatus): Item[] {
  return items.filter((item) => getCurrentStoreStatus(item) === status)
}

export function getProgressPercentage(item: Item): number {
  if (item.quantity === 0) return 0
  const p = Math.round((item.quantityBought / item.quantity) * 100)
  return Math.min(100, p)
}

export const storeOptionStatusConfig: Record<
  StoreOptionStatus,
  { label: string; icon: string; short?: string }
> = {
  "not-checked": { label: "Not checked", icon: "search", short: "Open" },
  found: { label: "Found", icon: "check" },
  "sold-out": { label: "Sold out", icon: "x" },
  "not-found": { label: "Not found", icon: "circle-slash" },
  "check-later": { label: "Check later", icon: "clock" },
  "bought-here": { label: "Bought here", icon: "shopping-bag", short: "Got it!" },
  skip: { label: "Skip", icon: "minus" },
}
