import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Priority = "S" | "A" | "B" | "C"
export type Status = "hunting" | "found" | "bought" | "sold-out" | "skipped"
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
  forWho: string
  priority: Priority
  category: Category
  quantity: number
  quantityBought: number
  currentStoreId: string | null
  backupStoreIds: string[]
  status: Status
  notes?: string
  price?: string
  isPacked: boolean
  createdAt: string
  updatedAt: string
}

interface AppState {
  items: Item[]
  stores: Store[]
  activeTab: string
  
  // Item actions
  addItem: (item: Omit<Item, "id" | "createdAt" | "updatedAt" | "isPacked">) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
  markBought: (id: string, quantity?: number) => void
  markSoldOut: (id: string) => void
  markSkipped: (id: string) => void
  markNotFound: (id: string) => void
  resetStatus: (id: string) => void
  togglePacked: (id: string) => void
  tryNextStore: (id: string) => void
  
  // Store actions
  addStore: (store: Omit<Store, "id">) => void
  updateStore: (id: string, updates: Partial<Store>) => void
  deleteStore: (id: string) => void
  
  // Navigation
  setActiveTab: (tab: string) => void
  
  // Backup
  exportData: () => string
  importData: (data: string) => boolean
}

const defaultStores: Store[] = [
  { id: "1", name: "Don Quijote Shibuya", area: "Shibuya", notes: "Open 24hrs", hours: "24 hours" },
  { id: "2", name: "Tokyu Hands Shibuya", area: "Shibuya", notes: "Best for stationery & crafts", hours: "10:00-21:00" },
  { id: "3", name: "Onitsuka Tiger Omotesando", area: "Harajuku", notes: "Main flagship store", hours: "11:00-20:00" },
  { id: "4", name: "Kiddy Land Harajuku", area: "Harajuku", notes: "Character goods paradise", hours: "11:00-21:00" },
  { id: "5", name: "Tokyo Banana Tokyo Station", area: "Tokyo Station", notes: "Inside Yaesu exit", hours: "8:00-21:30" },
  { id: "6", name: "Animate Ikebukuro Main", area: "Ikebukuro", notes: "9 floors of anime!", hours: "10:00-21:00" },
  { id: "7", name: "Yodobashi Camera Akiba", area: "Akihabara", notes: "Electronics + kitchen goods", hours: "9:30-22:00" },
  { id: "8", name: "LOFT Shibuya", area: "Shibuya", notes: "Lifestyle & stationery", hours: "10:00-21:00" },
  { id: "9", name: "Muji Ginza Flagship", area: "Ginza", notes: "Huge selection + hotel", hours: "10:00-21:00" },
  { id: "10", name: "Daiso Harajuku", area: "Harajuku", notes: "100 yen treasures", hours: "10:00-21:00" },
  { id: "11", name: "Mandarake Nakano", area: "Nakano", notes: "Rare collectibles", hours: "12:00-20:00" },
  { id: "12", name: "Pokemon Center Mega Tokyo", area: "Ikebukuro", notes: "In Sunshine City", hours: "10:00-20:00" },
]

const defaultItems: Item[] = [
  {
    id: "1",
    name: "Nyota Blind Box (Cat Series)",
    forWho: "Me",
    priority: "S",
    category: "merch",
    quantity: 3,
    quantityBought: 0,
    currentStoreId: "4",
    backupStoreIds: ["6", "11"],
    status: "hunting",
    notes: "Check for the limited sakura edition!",
    price: "~1,200 yen each",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Onitsuka Tiger Mexico 66",
    forWho: "Me",
    priority: "S",
    category: "fashion",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "3",
    backupStoreIds: [],
    status: "hunting",
    notes: "Size 24.5cm - cream/red colorway only",
    price: "~15,000 yen",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Spicy Furikake (Shrimp)",
    forWho: "Mom",
    priority: "A",
    category: "food",
    quantity: 5,
    quantityBought: 2,
    currentStoreId: "1",
    backupStoreIds: ["9"],
    status: "hunting",
    notes: "The one with little shrimp bits she loves",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Premium Hojicha Powder",
    forWho: "Gifts",
    priority: "A",
    category: "food",
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "9",
    backupStoreIds: ["1"],
    status: "hunting",
    notes: "Latte-grade, not culinary",
    price: "~800 yen",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Zojirushi Thermos 500ml",
    forWho: "Dad",
    priority: "S",
    category: "home",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "7",
    backupStoreIds: ["1", "9"],
    status: "hunting",
    notes: "Matte black only - he was specific!",
    price: "~4,000 yen",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Aesthetic Journal Stickers",
    forWho: "Me",
    priority: "C",
    category: "misc",
    quantity: 10,
    quantityBought: 4,
    currentStoreId: "2",
    backupStoreIds: ["8", "10"],
    status: "hunting",
    notes: "Washi tape counts too!",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Tokyo Banana (Original)",
    forWho: "Office",
    priority: "S",
    category: "food",
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "5",
    backupStoreIds: [],
    status: "hunting",
    notes: "Get at station before leaving! 12-pack boxes",
    price: "~1,200 yen/box",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Blue Lock - Isagi Merch",
    forWho: "Brother",
    priority: "A",
    category: "merch",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "6",
    backupStoreIds: ["11"],
    status: "hunting",
    notes: "Keychain or acrylic stand - whatever looks cool",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "9",
    name: "JJK Gojo Figure",
    forWho: "Me",
    priority: "B",
    category: "merch",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "6",
    backupStoreIds: ["11", "7"],
    status: "hunting",
    notes: "Check limited editions first!",
    price: "~3,500 yen",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Shiseido Lip Balm",
    forWho: "Sister",
    priority: "B",
    category: "beauty",
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "1",
    backupStoreIds: ["9"],
    status: "hunting",
    notes: "The rose one in the cute tin",
    price: "~1,000 yen",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Kit Kat Variety Pack",
    forWho: "Gifts",
    priority: "C",
    category: "food",
    quantity: 3,
    quantityBought: 0,
    currentStoreId: "1",
    backupStoreIds: ["5"],
    status: "hunting",
    notes: "Matcha, strawberry, sake flavors",
    isPacked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: defaultItems,
      stores: defaultStores,
      activeTab: "today",

      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id: Date.now().toString(),
              isPacked: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      markBought: (id, quantity = 1) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const newQuantityBought = Math.min(
              item.quantityBought + quantity,
              item.quantity
            )
            return {
              ...item,
              quantityBought: newQuantityBought,
              status: newQuantityBought >= item.quantity ? "bought" : "hunting",
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      markSoldOut: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "sold-out" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      markNotFound: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "sold-out" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      markSkipped: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "skipped" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      resetStatus: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "hunting" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      togglePacked: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, isPacked: !item.isPacked, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      tryNextStore: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            if (item.backupStoreIds.length === 0) return item
            const [nextStore, ...remaining] = item.backupStoreIds
            return {
              ...item,
              currentStoreId: nextStore,
              backupStoreIds: remaining,
              status: "hunting" as Status,
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      addStore: (store) =>
        set((state) => ({
          stores: [...state.stores, { ...store, id: Date.now().toString() }],
        })),

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

      setActiveTab: (tab) => set({ activeTab: tab }),

      exportData: () => {
        const { items, stores } = get()
        return JSON.stringify({ items, stores, exportedAt: new Date().toISOString() }, null, 2)
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.items && parsed.stores) {
            set({ items: parsed.items, stores: parsed.stores })
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: "yv-japan-buy-quest",
    }
  )
)

// Helper functions
export function getStoreById(stores: Store[], id: string | null): Store | undefined {
  if (!id) return undefined
  return stores.find((s) => s.id === id)
}

export function getItemsByStore(items: Item[], storeId: string): Item[] {
  return items.filter(
    (item) =>
      item.currentStoreId === storeId ||
      item.backupStoreIds.includes(storeId)
  )
}

export function getItemsByStatus(items: Item[], status: Status): Item[] {
  return items.filter((item) => item.status === status)
}

export function getItemsByCategory(items: Item[], category: Category): Item[] {
  return items.filter((item) => item.category === category)
}

export function getProgressPercentage(item: Item): number {
  if (item.quantity === 0) return 0
  return Math.round((item.quantityBought / item.quantity) * 100)
}

export const categoryConfig: Record<Category, { label: string; color: string; emoji: string }> = {
  fashion: { label: "Fashion", color: "bg-pastel-pink text-foreground", emoji: "fashion" },
  food: { label: "Food", color: "bg-pastel-orange text-foreground", emoji: "food" },
  merch: { label: "Merch", color: "bg-pastel-blue text-foreground", emoji: "merch" },
  beauty: { label: "Beauty", color: "bg-pastel-purple text-foreground", emoji: "beauty" },
  home: { label: "Home", color: "bg-pastel-green text-foreground", emoji: "home" },
  misc: { label: "Misc", color: "bg-pastel-yellow text-foreground", emoji: "misc" },
}

export const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; description: string }> = {
  S: { 
    label: "S", 
    color: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200/50", 
    bgColor: "bg-amber-50",
    description: "Cannot leave without!" 
  },
  A: { 
    label: "A", 
    color: "bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-md shadow-rose-200/50", 
    bgColor: "bg-rose-50",
    description: "Really want this" 
  },
  B: { 
    label: "B", 
    color: "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-200/50", 
    bgColor: "bg-sky-50",
    description: "Would be nice" 
  },
  C: { 
    label: "C", 
    color: "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-sm", 
    bgColor: "bg-slate-50",
    description: "If time permits" 
  },
}

export const statusConfig: Record<Status, { label: string; icon: string }> = {
  hunting: { label: "Looking", icon: "search" },
  found: { label: "Found", icon: "check" },
  bought: { label: "Got it!", icon: "shopping-bag" },
  "sold-out": { label: "Sold Out", icon: "x" },
  skipped: { label: "Later", icon: "clock" },
}
